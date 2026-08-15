import {
  AbsencePrediction,
  AbsencePredictionInput,
  AbsencePredictionOutcome,
  DayOfWeekName,
  PredictionFactor,
  PredictionPerformanceMetrics,
  RecoveryPlanData,
  RiskLevel,
  Attendance,
  AttendanceStatus,
} from '../types';
import { dataStore } from '../lib/dataProvider';

/**
 * Pluggable Prediction Provider Abstraction
 * Allows replacing the rule-based statistical engine with a Python FastAPI ML model
 * without altering UI components.
 */
export interface PredictionProvider {
  name: string;
  version: string;
  isML: boolean;
  predict(input: AbsencePredictionInput): Promise<AbsencePrediction> | AbsencePrediction;
}

/**
 * Transparent Rule-Based & Statistical Prediction Engine (v1)
 * Mathematical weighting:
 * - Current/Overall attendance: 25%
 * - Recent attendance: 20%
 * - Recent absence frequency (last 7-14d): 15%
 * - Consecutive absences: 15%
 * - Attendance trend: 10%
 * - Previous class behavior: 5%
 * - Day-of-week pattern: 5%
 * - Subject-specific attendance: 5%
 * + Optional behavioral modifiers
 */
export class RuleBasedPredictionProvider implements PredictionProvider {
  public name = 'Rule-Based Statistical Predictor';
  public version = 'rule-based-absence-v1';
  public isML = false;

  public predict(input: AbsencePredictionInput): AbsencePrediction {
    const factors: PredictionFactor[] = [];

    // 1. Overall Attendance Factor (25% Weight)
    // 100% attendance = 0 risk; 50% attendance = 50 risk; 0% attendance = 100 risk
    const overallRisk = Math.max(0, Math.min(100, 100 - input.overall_attendance_pct));
    const overallWeight = 0.25;

    if (input.overall_attendance_pct < 75) {
      factors.push({
        text: `Attendance is below 75% (${input.overall_attendance_pct}%)`,
        impact: 'negative',
        weight: Number((overallRisk * overallWeight).toFixed(1)),
      });
    } else if (input.overall_attendance_pct >= 90) {
      factors.push({
        text: `Overall attendance is strong and healthy (${input.overall_attendance_pct}%)`,
        impact: 'positive',
        weight: Number((overallRisk * overallWeight).toFixed(1)),
      });
    } else {
      factors.push({
        text: `Overall attendance is satisfactory (${input.overall_attendance_pct}%)`,
        impact: 'neutral',
        weight: Number((overallRisk * overallWeight).toFixed(1)),
      });
    }

    // 2. Recent Attendance Factor (20% Weight)
    const recentRisk = Math.max(0, Math.min(100, 100 - input.recent_attendance_pct));
    const recentWeight = 0.20;

    if (input.recent_attendance_pct < 70) {
      factors.push({
        text: `Recent attendance dropped to ${input.recent_attendance_pct}%`,
        impact: 'negative',
        weight: Number((recentRisk * recentWeight).toFixed(1)),
      });
    } else if (input.recent_attendance_pct >= 85) {
      factors.push({
        text: `Recent session consistency is high (${input.recent_attendance_pct}%)`,
        impact: 'positive',
        weight: Number((recentRisk * recentWeight).toFixed(1)),
      });
    }

    // 3. Recent Absence Frequency (15% Weight)
    // Up to 5 absences in last 7-14 days scales up to 100%
    const absenceFreqScore = Math.min(
      100,
      input.absences_last_7_days * 22 + input.absences_last_14_days * 12
    );
    const absenceFreqWeight = 0.15;

    if (input.absences_last_7_days > 0) {
      factors.push({
        text: `${input.absences_last_7_days} absence${input.absences_last_7_days > 1 ? 's' : ''} in the last 7 days`,
        impact: 'negative',
        weight: Number((absenceFreqScore * absenceFreqWeight).toFixed(1)),
      });
    } else if (input.absences_last_14_days > 2) {
      factors.push({
        text: `${input.absences_last_14_days} absences recorded across the last 14 days`,
        impact: 'negative',
        weight: Number((absenceFreqScore * absenceFreqWeight).toFixed(1)),
      });
    } else {
      factors.push({
        text: 'Zero absences in the past 7 days',
        impact: 'positive',
        weight: 0,
      });
    }

    // 4. Consecutive Absences (15% Weight)
    let consecutiveScore = 0;
    if (input.consecutive_absences >= 4) consecutiveScore = 100;
    else if (input.consecutive_absences === 3) consecutiveScore = 80;
    else if (input.consecutive_absences === 2) consecutiveScore = 55;
    else if (input.consecutive_absences === 1) consecutiveScore = 30;
    else consecutiveScore = 0;

    const consecutiveWeight = 0.15;

    if (input.consecutive_absences >= 2) {
      factors.push({
        text: `${input.consecutive_absences} consecutive absences leading into this class`,
        impact: 'negative',
        weight: Number((consecutiveScore * consecutiveWeight).toFixed(1)),
      });
    } else if (input.consecutive_absences === 1) {
      factors.push({
        text: 'Missed the previous consecutive class',
        impact: 'negative',
        weight: Number((consecutiveScore * consecutiveWeight).toFixed(1)),
      });
    } else if (input.recent_streak >= 3) {
      factors.push({
        text: `Active present streak of ${input.recent_streak} sessions`,
        impact: 'positive',
        weight: 0,
      });
    }

    // 5. Attendance Trend (10% Weight)
    let trendScore = 40; // stable default
    if (input.trend === 'declining') {
      trendScore = 88;
      factors.push({
        text: 'Attendance trend is declining recently',
        impact: 'negative',
        weight: 8.8,
      });
    } else if (input.trend === 'increasing') {
      trendScore = 10;
      factors.push({
        text: 'Recent attendance trajectory is improving',
        impact: 'positive',
        weight: 1.0,
      });
    } else {
      trendScore = 35;
      factors.push({
        text: 'Attendance trend remains stable',
        impact: 'neutral',
        weight: 3.5,
      });
    }
    const trendWeight = 0.10;

    // 6. Previous Class Behavior (5% Weight)
    let prevClassScore = input.previous_class_status === 'absent' ? 85 : 12;
    const prevClassWeight = 0.05;
    factors.push({
      text:
        input.previous_class_status === 'absent'
          ? 'Previous class attendance was absent'
          : 'Attended the immediately preceding class',
      impact: input.previous_class_status === 'absent' ? 'negative' : 'positive',
      weight: Number((prevClassScore * prevClassWeight).toFixed(1)),
    });

    // 7. Day-of-Week Pattern (5% Weight)
    const dayScore = Math.max(0, Math.min(100, input.day_of_week_absence_rate));
    const dayWeight = 0.05;
    if (input.day_of_week_absence_rate >= 50) {
      factors.push({
        text: `${input.day_of_week} historically has high absence frequency (${input.day_of_week_absence_rate}% miss rate)`,
        impact: 'negative',
        weight: Number((dayScore * dayWeight).toFixed(1)),
      });
    } else if (input.day_of_week_absence_rate <= 20) {
      factors.push({
        text: `${input.day_of_week} sessions show solid historic turnout (${100 - input.day_of_week_absence_rate}% attendance)`,
        impact: 'positive',
        weight: Number((dayScore * dayWeight).toFixed(1)),
      });
    }

    // 8. Subject-Specific Attendance (5% Weight)
    const subjectRisk = Math.max(0, Math.min(100, 100 - input.subject_attendance_pct));
    const subjectWeight = 0.05;
    if (input.subject_attendance_pct < 75) {
      factors.push({
        text: `Subject-specific attendance is low (${input.subject_attendance_pct}%)`,
        impact: 'negative',
        weight: Number((subjectRisk * subjectWeight).toFixed(1)),
      });
    } else if (input.subject_attendance_pct >= 90) {
      factors.push({
        text: `Subject-specific engagement is strong (${input.subject_attendance_pct}%)`,
        impact: 'positive',
        weight: Number((subjectRisk * subjectWeight).toFixed(1)),
      });
    }

    // Optional Modifiers
    let behavioralModifier = 0;
    if (input.recent_academic_activity === 'Low') {
      behavioralModifier += 3.5;
      factors.push({
        text: 'Academic engagement & assignment activity is low',
        impact: 'negative',
        weight: 3.5,
      });
    } else if (input.recent_academic_activity === 'Healthy') {
      behavioralModifier -= 2.5;
      factors.push({
        text: 'Strong assignment completion and academic participation',
        impact: 'positive',
        weight: 0,
      });
    }

    if (input.late_attendance_frequency && input.late_attendance_frequency >= 3) {
      behavioralModifier += 2.0;
      factors.push({
        text: `Frequent tardiness logged (${input.late_attendance_frequency} instances)`,
        impact: 'negative',
        weight: 2.0,
      });
    }

    // Composite Absence Score Calculation (0 - 100)
    let rawScore =
      overallRisk * overallWeight +
      recentRisk * recentWeight +
      absenceFreqScore * absenceFreqWeight +
      consecutiveScore * consecutiveWeight +
      trendScore * trendWeight +
      prevClassScore * prevClassWeight +
      dayScore * dayWeight +
      subjectRisk * subjectWeight +
      behavioralModifier;

    // Normalization & Clamping
    const absenceProbability = Math.round(Math.max(2, Math.min(98, rawScore)));
    const attendanceProbability = 100 - absenceProbability;

    // Classification
    const prediction: AbsencePredictionOutcome =
      absenceProbability >= 50 ? 'Likely Absent' : 'Likely Present';

    let risk_level: RiskLevel = 'LOW';
    if (absenceProbability >= 70) {
      risk_level = 'HIGH';
    } else if (absenceProbability >= 40) {
      risk_level = 'MEDIUM';
    } else {
      risk_level = 'LOW';
    }

    // Confidence Calculation based on historical sample size & data consistency
    let confidence = 82;
    let confidence_note =
      'Confidence is based on the amount and consistency of available historical attendance data.';

    if (input.total_classes < 4) {
      confidence = Math.max(35, Math.min(52, 38 + input.total_classes * 4));
      confidence_note =
        'Limited historical data. Predictions have lower statistical confidence until more sessions are logged.';
    } else if (input.total_classes < 10) {
      confidence = Math.max(55, Math.min(72, 54 + input.total_classes * 2));
    } else if (input.total_classes < 25) {
      confidence = Math.max(74, Math.min(86, 70 + Math.floor(input.total_classes * 0.6)));
    } else {
      confidence = Math.max(85, Math.min(96, 85 + Math.floor(input.total_classes * 0.3)));
    }

    // Adjust confidence if trend is volatile or conflicting signals
    if (Math.abs(input.overall_attendance_pct - input.recent_attendance_pct) > 25) {
      confidence = Math.max(45, confidence - 6);
    }

    // Dynamic Contextual Explanation
    let explanation = '';
    if (prediction === 'Likely Absent') {
      if (absenceProbability >= 75) {
        explanation = `High absence probability (${absenceProbability}%) driven by declining attendance, recent misses, and previous absent record.`;
      } else {
        explanation = `Moderate-high probability of absence (${absenceProbability}%) detected based on recent attendance volatility.`;
      }
    } else {
      if (attendanceProbability >= 80) {
        explanation = `High probability of attendance (${attendanceProbability}%) supported by solid attendance patterns and positive session consistency.`;
      } else {
        explanation = `Projected to attend (${attendanceProbability}%), though recent trends should be monitored to maintain good standing.`;
      }
    }

    // Recommendation Engine
    let recommendation = '';
    if (risk_level === 'HIGH' || absenceProbability >= 70) {
      recommendation =
        'High absence probability detected. Consider contacting the student before the upcoming class and alerting the academic advisor.';
    } else if (risk_level === 'MEDIUM' || (absenceProbability >= 40 && absenceProbability < 70)) {
      recommendation =
        "The student's recent attendance pattern shows moderate absence risk. Regular attendance is recommended.";
    } else {
      recommendation =
        'The student has a strong attendance pattern and is likely to attend the upcoming class.';
    }

    // Recovery Plan if student attendance is below 75%
    let recovery_plan: RecoveryPlanData | undefined = undefined;
    if (input.overall_attendance_pct < 75 && input.total_classes > 0) {
      const targetPct = 75;
      // Formula: (0.75 * (T + N) - (A + N)) <= 0 => N >= (0.75 * T - A) / (1 - 0.75) = (0.75 * T - A) / 0.25
      const currentAttended = input.classes_attended;
      const currentTotal = input.total_classes;
      const neededClasses = Math.max(
        1,
        Math.ceil((0.75 * currentTotal - currentAttended) / 0.25)
      );

      recovery_plan = {
        current_attendance: input.overall_attendance_pct,
        target_attendance: targetPct,
        classes_required: neededClasses,
        action_summary: `Attend next ${neededClasses} consecutive classes without unexcused absences to restore standing to >= ${targetPct}%.`,
      };
    }

    return {
      id: `pred-abs-${input.student_id}-${input.subject_id}-${input.target_date}-${Date.now()}`,
      student_id: input.student_id,
      subject_id: input.subject_id,
      class_id: input.class_id,
      prediction_date: new Date().toISOString(),
      target_date: input.target_date,
      absence_probability: absenceProbability,
      attendance_probability: attendanceProbability,
      prediction,
      risk_level,
      confidence,
      confidence_note,
      explanation,
      factors,
      recommendation,
      algorithm_version: this.version,
      actual_result: 'pending',
      created_at: new Date().toISOString(),
      recovery_plan,
    };
  }
}

/**
 * Future ML Prediction Provider placeholder (FastAPI / PyTorch ML endpoint)
 */
export class FastAPIMLPredictionProvider implements PredictionProvider {
  public name = 'Python FastAPI ML Model Provider';
  public version = 'fastapi-xgboost-v1.0';
  public isML = true;
  private endpointUrl: string;

  constructor(endpointUrl: string = 'http://localhost:8000/api/predict-absence') {
    this.endpointUrl = endpointUrl;
  }

  public async predict(input: AbsencePredictionInput): Promise<AbsencePrediction> {
    // Graceful fallback to rule-based engine if endpoint is offline or not configured
    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Endpoint fallback
    }
    const fallbackProvider = new RuleBasedPredictionProvider();
    return fallbackProvider.predict(input);
  }
}

/**
 * Provider Registry
 */
let activeProvider: PredictionProvider = new RuleBasedPredictionProvider();

export function setPredictionProvider(provider: PredictionProvider) {
  activeProvider = provider;
}

export function getActivePredictionProvider(): PredictionProvider {
  return activeProvider;
}

// ----------------------------------------------------------------------------
// Helper Utilities for Mode A (Automatic Data Extraction from Database)
// ----------------------------------------------------------------------------

export function getDayOfWeekFromDateString(dateStr: string): DayOfWeekName {
  const d = new Date(dateStr + 'T12:00:00Z');
  const days: DayOfWeekName[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[d.getUTCDay()] || 'Monday';
}

/**
 * Extracts student historical data from the application dataStore
 * to build the standardized prediction input.
 */
export function extractPredictionInputFromDatabase(
  studentId: string,
  subjectId: string,
  targetDate: string
): AbsencePredictionInput | null {
  const student = dataStore.getStudentById(studentId);
  if (!student) return null;

  const allRecords = dataStore.getAttendance({ studentId });
  const subjectRecords = allRecords.filter(r => r.subject_id === subjectId);

  // Sort chronologically ascending
  const sortedAll = [...allRecords].sort(
    (a, b) => new Date(a.attendance_date).getTime() - new Date(b.attendance_date).getTime()
  );

  const totalClasses = sortedAll.length;
  const classesAttended = sortedAll.filter(r => r.status === 'present').length;
  const classesMissed = totalClasses - classesAttended;
  const overallPct = totalClasses > 0 ? Number(((classesAttended / totalClasses) * 100).toFixed(1)) : 0;

  // Subject Specific
  const subTotal = subjectRecords.length;
  const subAttended = subjectRecords.filter(r => r.status === 'present').length;
  const subjectPct = subTotal > 0 ? Number(((subAttended / subTotal) * 100).toFixed(1)) : overallPct;

  // Recent 8 sessions
  const recentSlice = sortedAll.slice(-8);
  const recentTotal = recentSlice.length;
  const recentAttended = recentSlice.filter(r => r.status === 'present').length;
  const recentPct = recentTotal > 0 ? Number(((recentAttended / recentTotal) * 100).toFixed(1)) : overallPct;

  // Date boundaries relative to current target or latest record
  const targetTime = new Date(targetDate + 'T23:59:59Z').getTime();
  const d7 = targetTime - 7 * 24 * 60 * 60 * 1000;
  const d14 = targetTime - 14 * 24 * 60 * 60 * 1000;
  const d30 = targetTime - 30 * 24 * 60 * 60 * 1000;

  let absences7 = 0;
  let absences14 = 0;
  let absences30 = 0;

  sortedAll.forEach(r => {
    const t = new Date(r.attendance_date + 'T12:00:00Z').getTime();
    if (r.status === 'absent') {
      if (t >= d7) absences7++;
      if (t >= d14) absences14++;
      if (t >= d30) absences30++;
    }
  });

  // Consecutive absences leading backwards from last session
  let consecutiveAbsences = 0;
  let recentStreak = 0;
  for (let i = sortedAll.length - 1; i >= 0; i--) {
    if (sortedAll[i].status === 'absent') {
      if (recentStreak === 0) {
        consecutiveAbsences++;
      } else {
        break;
      }
    } else {
      if (consecutiveAbsences === 0) {
        recentStreak++;
      } else {
        break;
      }
    }
  }

  // Previous class status
  const lastRecord = sortedAll[sortedAll.length - 1];
  const previous_class_status: 'present' | 'absent' = lastRecord ? lastRecord.status : 'present';

  // Day of week analysis
  const dayOfWeek = getDayOfWeekFromDateString(targetDate);
  const dayRecords = sortedAll.filter(r => getDayOfWeekFromDateString(r.attendance_date) === dayOfWeek);
  const dayTotal = dayRecords.length;
  const dayMisses = dayRecords.filter(r => r.status === 'absent').length;
  const day_of_week_absence_rate =
    dayTotal > 0 ? Number(((dayMisses / dayTotal) * 100).toFixed(1)) : 20;

  // Trend detection
  let trend: 'increasing' | 'stable' | 'declining' = 'stable';
  if (recentPct > overallPct + 4) {
    trend = 'increasing';
  } else if (recentPct < overallPct - 4) {
    trend = 'declining';
  }

  // Academic activity if available
  const academicSummary = dataStore.getAcademicActivitySummary(studentId);

  return {
    student_id: studentId,
    student_name: student.profile?.full_name,
    roll_number: student.roll_number,
    class_id: student.class_id,
    subject_id: subjectId,
    target_date: targetDate,
    overall_attendance_pct: overallPct,
    subject_attendance_pct: subjectPct,
    recent_attendance_pct: recentPct,
    classes_attended: classesAttended,
    classes_missed: classesMissed,
    total_classes: totalClasses,
    absences_last_7_days: absences7,
    absences_last_14_days: absences14,
    absences_last_30_days: absences30,
    consecutive_absences: consecutiveAbsences,
    recent_streak: recentStreak,
    previous_class_status,
    day_of_week: dayOfWeek,
    day_of_week_absence_rate,
    trend,
    late_attendance_frequency: 0,
    recent_academic_activity: academicSummary.activity_level,
  };
}

/**
 * Predict Absence Risk from complete or custom input
 */
export function predictAbsenceRisk(
  input: AbsencePredictionInput,
  provider: PredictionProvider = activeProvider
): AbsencePrediction {
  const prediction = provider.predict(input) as AbsencePrediction;
  return prediction;
}

/**
 * Evaluates an existing prediction against the actual recorded attendance
 */
export function evaluatePredictionOutcome(
  prediction: AbsencePrediction,
  actualStatus: AttendanceStatus
): AbsencePrediction {
  const isActualAbsent = actualStatus === 'absent';
  const isPredictedAbsent = prediction.prediction === 'Likely Absent';

  const isCorrect =
    (isPredictedAbsent && isActualAbsent) || (!isPredictedAbsent && !isActualAbsent);

  return {
    ...prediction,
    actual_result: isCorrect ? 'correct' : 'incorrect',
    actual_attendance_status: actualStatus,
    evaluated_at: new Date().toISOString(),
  };
}

/**
 * Calculates genuine performance metrics from actual evaluated predictions
 * (Zero fake stats; shows insufficient data if less than 3 evaluations exist)
 */
export function calculatePredictionPerformanceMetrics(
  predictions: AbsencePrediction[]
): PredictionPerformanceMetrics {
  const evaluated = predictions.filter(p => p.actual_result === 'correct' || p.actual_result === 'incorrect');

  if (evaluated.length < 3) {
    return {
      total_predictions: predictions.length,
      evaluated_predictions: evaluated.length,
      pending_predictions: predictions.length - evaluated.length,
      correct_predictions: evaluated.filter(p => p.actual_result === 'correct').length,
      incorrect_predictions: evaluated.filter(p => p.actual_result === 'incorrect').length,
      present_predictions: predictions.filter(p => p.prediction === 'Likely Present').length,
      absent_predictions: predictions.filter(p => p.prediction === 'Likely Absent').length,
      true_positives: 0,
      true_negatives: 0,
      false_positives: 0,
      false_negatives: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      accuracy: 0,
      has_sufficient_data: false,
    };
  }

  // Binary Classification where Positive Class = "ABSENT"
  let TP = 0; // Predicted Absent, Actual Absent
  let TN = 0; // Predicted Present, Actual Present
  let FP = 0; // Predicted Absent, Actual Present (False Alarm)
  let FN = 0; // Predicted Present, Actual Absent (Missed Absence)

  evaluated.forEach(p => {
    const predAbsent = p.prediction === 'Likely Absent';
    const actualAbsent = p.actual_attendance_status === 'absent';

    if (predAbsent && actualAbsent) TP++;
    else if (!predAbsent && !actualAbsent) TN++;
    else if (predAbsent && !actualAbsent) FP++;
    else if (!predAbsent && actualAbsent) FN++;
  });

  const correct = TP + TN;
  const incorrect = FP + FN;
  const accuracy = Number(((correct / evaluated.length) * 100).toFixed(1));

  const precision =
    TP + FP > 0 ? Number(((TP / (TP + FP)) * 100).toFixed(1)) : 0;
  const recall =
    TP + FN > 0 ? Number(((TP / (TP + FN)) * 100).toFixed(1)) : 0;
  const f1 =
    precision + recall > 0
      ? Number(((2 * (precision * recall)) / (precision + recall)).toFixed(1))
      : 0;

  return {
    total_predictions: predictions.length,
    evaluated_predictions: evaluated.length,
    pending_predictions: predictions.length - evaluated.length,
    correct_predictions: correct,
    incorrect_predictions: incorrect,
    present_predictions: predictions.filter(p => p.prediction === 'Likely Present').length,
    absent_predictions: predictions.filter(p => p.prediction === 'Likely Absent').length,
    true_positives: TP,
    true_negatives: TN,
    false_positives: FP,
    false_negatives: FN,
    precision,
    recall,
    f1_score: f1,
    accuracy,
    has_sufficient_data: true,
  };
}

export const absencePredictionService = {
  predictAbsenceRisk,
  extractPredictionInputFromDatabase,
  evaluatePredictionOutcome,
  calculatePredictionPerformanceMetrics,
  setPredictionProvider,
  getActivePredictionProvider,
};
