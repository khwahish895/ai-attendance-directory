import { Attendance, RiskAssessment, RiskLevel, TrendDirection } from '../types';

export interface CalculatedRiskData {
  attendancePercentage: number;
  recentAttendancePercentage: number;
  recentAbsences: number;
  consecutiveAbsences: number;
  attendanceTrend: TrendDirection;
  predictedAttendance: number;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}

/**
 * Calculates attendance percentage safely.
 * Returns 0.0 if total classes is 0.
 */
export function calculateAttendancePercentage(present: number, total: number): number {
  if (!total || total <= 0) return 0.0;
  const pct = (present / total) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(1));
}

/**
 * Calculates consecutive absences from most recent attendance records backwards.
 */
export function calculateConsecutiveAbsences(records: Attendance[]): number {
  if (!records || records.length === 0) return 0;
  
  // Sort descending by date
  const sorted = [...records].sort(
    (a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime()
  );

  let consecutive = 0;
  for (const record of sorted) {
    if (record.status === 'absent') {
      consecutive++;
    } else {
      break;
    }
  }
  return consecutive;
}

/**
 * Detects frequent absenteeism and trend comparing recent records (last 10 classes) to prior.
 */
export function analyzeAttendanceTrend(records: Attendance[]): {
  overallPct: number;
  recentPct: number;
  recentAbsences: number;
  trend: TrendDirection;
  trendDiff: number;
} {
  if (!records || records.length === 0) {
    return {
      overallPct: 0,
      recentPct: 0,
      recentAbsences: 0,
      trend: 'stable',
      trendDiff: 0,
    };
  }

  const sorted = [...records].sort(
    (a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime()
  );

  const totalPresent = sorted.filter(r => r.status === 'present').length;
  const overallPct = calculateAttendancePercentage(totalPresent, sorted.length);

  // Take the most recent 10 classes (or half the records if fewer)
  const recentWindow = Math.min(10, Math.max(3, Math.ceil(sorted.length / 2)));
  const recentRecords = sorted.slice(0, recentWindow);
  const recentPresent = recentRecords.filter(r => r.status === 'present').length;
  const recentAbsences = recentRecords.length - recentPresent;
  const recentPct = calculateAttendancePercentage(recentPresent, recentRecords.length);

  const trendDiff = Number((recentPct - overallPct).toFixed(1));
  let trend: TrendDirection = 'stable';
  if (trendDiff <= -5.0) {
    trend = 'declining';
  } else if (trendDiff >= 5.0) {
    trend = 'improving';
  }

  return {
    overallPct,
    recentPct,
    recentAbsences,
    trend,
    trendDiff,
  };
}

/**
 * Centralized Risk Assessment Engine
 * Computes multi-factor risk score (0-100), risk level (LOW/MEDIUM/HIGH), and detailed explanations.
 */
export function computeRiskAssessment(
  studentId: string,
  records: Attendance[],
  predictedAttendanceValue?: number
): CalculatedRiskData {
  if (!records || records.length === 0) {
    return {
      attendancePercentage: 0,
      recentAttendancePercentage: 0,
      recentAbsences: 0,
      consecutiveAbsences: 0,
      attendanceTrend: 'stable',
      predictedAttendance: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      reasons: ['No attendance records logged yet for this academic period.'],
    };
  }

  const { overallPct, recentPct, recentAbsences, trend, trendDiff } = analyzeAttendanceTrend(records);
  const consecutiveAbsences = calculateConsecutiveAbsences(records);

  // Approximate default prediction if not supplied
  const pred = predictedAttendanceValue !== undefined
    ? predictedAttendanceValue
    : Number((0.6 * recentPct + 0.3 * overallPct + (trend === 'improving' ? 3 : trend === 'declining' ? -5 : 0)).toFixed(1));
  const clampedPred = Math.min(100, Math.max(0, pred));

  // Multi-factor weighted risk score computation (0-100)
  // Higher score = Higher risk
  // 1. Current attendance risk (40% weight): below 75% creates high base score
  const currentRiskFactor = Math.max(0, (100 - overallPct)) * 0.40;

  // 2. Recent attendance risk (20% weight)
  const recentRiskFactor = Math.max(0, (100 - recentPct)) * 0.20;

  // 3. Consecutive absences risk (15% weight): e.g. 1 abs = 3pts, 2 abs = 7pts, 3+ abs = 15pts
  const consecutiveRiskFactor = Math.min(15, consecutiveAbsences * 4);

  // 4. Trend risk (15% weight)
  let trendRiskFactor = 0;
  if (trend === 'declining') {
    trendRiskFactor = Math.min(15, Math.abs(trendDiff) * 1.2);
  } else if (trend === 'stable' && overallPct < 80) {
    trendRiskFactor = 5;
  }

  // 5. Predicted attendance risk (10% weight)
  const predictedRiskFactor = Math.max(0, (100 - clampedPred)) * 0.10;

  // Calculate composite score & normalize to 0-100
  let rawScore = currentRiskFactor + recentRiskFactor + consecutiveRiskFactor + trendRiskFactor + predictedRiskFactor;
  
  // High risk override if overall attendance < 75% or consecutive absences >= 4
  if (overallPct < 75) {
    rawScore = Math.max(rawScore, 65);
  }
  if (consecutiveAbsences >= 4) {
    rawScore = Math.max(rawScore, 70);
  }

  const riskScore = Number(Math.min(100, Math.max(0, rawScore)).toFixed(1));

  // Determine Risk Level according to base specifications & composite score
  let riskLevel: RiskLevel = 'LOW';
  if (overallPct < 75 || riskScore >= 60 || consecutiveAbsences >= 4) {
    riskLevel = 'HIGH';
  } else if (overallPct < 85 || riskScore >= 35 || trend === 'declining') {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Generate actionable reasons
  const reasons: string[] = [];
  if (overallPct < 75) {
    reasons.push(`Attendance is critically low at ${overallPct}%, below the required 75.0% statutory threshold.`);
  } else if (overallPct < 85) {
    reasons.push(`Current attendance is at ${overallPct}%, sitting in the warning bracket (75.0% - 84.9%).`);
  }

  if (consecutiveAbsences >= 3) {
    reasons.push(`Detected ${consecutiveAbsences} consecutive absences requiring immediate faculty check-in.`);
  } else if (consecutiveAbsences === 2) {
    reasons.push(`Student missed the last 2 consecutive classes.`);
  }

  if (trend === 'declining') {
    reasons.push(`Attendance trend is declining by ${Math.abs(trendDiff)}% in recent classes compared to semester average.`);
  } else if (trend === 'improving') {
    reasons.push(`Recent attendance is showing positive recovery (+${trendDiff}% trend).`);
  }

  if (clampedPred < 75) {
    reasons.push(`Projected semester-end attendance is ${clampedPred}%, which will fail minimum qualification if unaddressed.`);
  }

  if (recentAbsences >= 4) {
    reasons.push(`High frequency of absences (${recentAbsences} missed out of recent classes).`);
  }

  if (reasons.length === 0) {
    reasons.push(`Attendance is healthy (${overallPct}%) with regular class participation.`);
  }

  return {
    attendancePercentage: overallPct,
    recentAttendancePercentage: recentPct,
    recentAbsences,
    consecutiveAbsences,
    attendanceTrend: trend,
    predictedAttendance: clampedPred,
    riskScore,
    riskLevel,
    reasons,
  };
}

import { dataStore } from '../lib/dataProvider';

export const riskService = {
  calculateAttendancePercentage,
  calculateConsecutiveAbsences,
  analyzeAttendanceTrend,
  computeRiskAssessment,
  getRiskAssessment: (studentId: string): RiskAssessment | undefined => {
    return dataStore.getRiskAssessmentForStudent(studentId);
  },
  calculateStudentRisk: (studentId: string): CalculatedRiskData => {
    const records = dataStore.getAttendance({ studentId });
    return computeRiskAssessment(studentId, records);
  },
  saveRiskAssessment: (assessment: any): void => {
    // Analytics are maintained dynamically in dataStore
    if (assessment.student_id) {
      dataStore.recalculateStudentAnalytics(assessment.student_id);
    }
  },
  calculateAllStudentsRisk: (): RiskAssessment[] => {
    const students = dataStore.getStudents();
    students.forEach(s => dataStore.recalculateStudentAnalytics(s.id));
    return dataStore.getRiskAssessments();
  },
};
