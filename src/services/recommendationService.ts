import { Attendance, Recommendation, RiskAssessment, RiskLevel } from '../types';
import { PredictionResult, predictStudentAttendance } from './predictionService';
import { computeRiskAssessment } from './riskService';
import { dataStore } from '../lib/dataProvider';

export interface CalculatedRecommendations {
  recommendations: Recommendation[];
  classesNeededFor75: number;
  classesNeededFor85: number;
  maxAllowableAbsencesBefore75: number;
  overallSummary: string;
}

/**
 * Calculates how many consecutive future classes a student must attend 100% to reach a target percentage.
 */
export function calculateClassesNeeded(present: number, total: number, targetPct: number): number {
  if (total <= 0) return 0;
  const currentPct = (present / total) * 100;
  if (currentPct >= targetPct) return 0;

  const targetDecimal = targetPct / 100;
  // Formula: (present + x) / (total + x) = targetDecimal
  // present + x = targetDecimal * total + targetDecimal * x
  // x * (1 - targetDecimal) = targetDecimal * total - present
  // x = (targetDecimal * total - present) / (1 - targetDecimal)
  const classesNeeded = Math.ceil((targetDecimal * total - present) / (1 - targetDecimal));
  return Math.max(0, classesNeeded);
}

/**
 * Calculates how many more classes a student can miss before dipping below 75%.
 */
export function calculateAllowableAbsences(present: number, total: number, targetPct: number = 75): number {
  if (total <= 0) return 0;
  const currentPct = (present / total) * 100;
  if (currentPct < targetPct) return 0;

  const targetDecimal = targetPct / 100;
  // Formula: present / (total + x) >= targetDecimal
  // present >= targetDecimal * total + targetDecimal * x
  // targetDecimal * x <= present - targetDecimal * total
  // x <= (present - targetDecimal * total) / targetDecimal
  const allowable = Math.floor((present - targetDecimal * total) / targetDecimal);
  return Math.max(0, allowable);
}

/**
 * Generates dynamic, multi-stakeholder recommendations based on actual calculated analytics.
 */
export function generateRecommendations(
  studentId: string,
  riskData: RiskAssessment,
  prediction: PredictionResult,
  totalClasses: number,
  presentClasses: number
): CalculatedRecommendations {
  const recommendations: Recommendation[] = [];
  const pct = riskData.attendance_percentage;
  const pred = prediction.predictedAttendance;
  const consecutive = riskData.consecutive_absences;
  const trend = riskData.attendance_trend;

  const classesNeededFor75 = calculateClassesNeeded(presentClasses, totalClasses, 75);
  const classesNeededFor85 = calculateClassesNeeded(presentClasses, totalClasses, 85);
  const maxAllowableAbsencesBefore75 = calculateAllowableAbsences(presentClasses, totalClasses, 75);

  // 1. Critical High-Risk Interventions
  if (pct < 75 || pred < 75 || consecutive >= 3) {
    recommendations.push({
      id: `rec-high-${studentId}-1`,
      student_id: studentId,
      category: 'intervention',
      title: 'Urgent Academic Retention Intervention',
      description: `Attendance (${pct}%) is below statutory 75%. Student must attend the next ${classesNeededFor75 || 5} consecutive scheduled sessions without absence to regain eligibility.`,
      urgency: 'high',
      actionable_steps: [
        `Attend next ${classesNeededFor75 || 5} classes consecutively without miss`,
        'Schedule mandatory 1-on-1 counselor check-in',
        'Submit official medical or bereavement certificates for past absences',
      ],
      target_audience: 'student',
    });

    recommendations.push({
      id: `rec-high-${studentId}-2`,
      student_id: studentId,
      category: 'counseling',
      title: 'Parent & Faculty Conference Required',
      description: `Immediate notification dispatched. Consecutive absence count (${consecutive}) signals academic detachment risk.`,
      urgency: 'high',
      actionable_steps: [
        'Call parent/guardian regarding consecutive absence pattern',
        'Provide remedial assignment packets for missed topics',
        'Review attendance contract milestones with Department Head',
      ],
      target_audience: 'teacher',
    });
  }

  // 2. Medium Risk / Warning Threshold
  if (pct >= 75 && pct < 85) {
    recommendations.push({
      id: `rec-med-${studentId}-1`,
      student_id: studentId,
      category: 'attendance',
      title: 'Attendance Recovery Protocol',
      description: `Current attendance is ${pct}%. Attending ${classesNeededFor85} more sessions will elevate status into the safe 85%+ green zone. Warning buffer: you can only afford ${maxAllowableAbsencesBefore75} more missed classes.`,
      urgency: 'medium',
      actionable_steps: [
        `Target 100% attendance over the next ${classesNeededFor85} lectures`,
        'Notify class representative and instructors in advance if illness arises',
        'Verify attendance log accuracy with your teacher weekly',
      ],
      target_audience: 'student',
    });

    if (trend === 'declining') {
      recommendations.push({
        id: `rec-med-${studentId}-2`,
        student_id: studentId,
        category: 'academic',
        title: 'Declining Trend Advisory',
        description: `Recent participation has fallen relative to baseline. Early intervention recommended before exam eligibility is impacted.`,
        urgency: 'medium',
        actionable_steps: [
          'Monitor upcoming weekly lecture checkpoints',
          'Offer peer study buddy pairing',
          'Review course lecture slides for missed material',
        ],
        target_audience: 'teacher',
      });
    }
  }

  // 3. Healthy / Good Standing Recommendations
  if (pct >= 85) {
    recommendations.push({
      id: `rec-healthy-${studentId}-1`,
      student_id: studentId,
      category: 'academic',
      title: 'Exemplary Attendance Maintenance',
      description: `Attendance is in healthy standing (${pct}%). Student maintains strong engagement and meets honors credit requirements.`,
      urgency: 'low',
      actionable_steps: [
        'Maintain consistent lecture presence and active participation',
        'Eligible for peer tutoring leadership initiatives',
      ],
      target_audience: 'student',
    });
  }

  // 4. Parent Guidance Recommendation
  recommendations.push({
    id: `rec-parent-${studentId}`,
    student_id: studentId,
    category: 'counseling',
    title: 'Home-School Engagement Recommendation',
    description: pct < 75
      ? `Your ward's attendance (${pct}%) is critical. Please ensure daily punctuality and coordinate with the class teacher.`
      : `Your ward is currently maintaining ${pct}% attendance. Continue supporting daily study routines.`,
    urgency: pct < 75 ? 'high' : pct < 85 ? 'medium' : 'low',
    actionable_steps: [
      'Review real-time attendance alerts in the parent portal',
      'Contact class advisor if unexpected health or transportation challenges occur',
    ],
    target_audience: 'parent',
  });

  let overallSummary = '';
  if (pct < 75) {
    overallSummary = `CRITICAL ATTENTION REQUIRED: Attendance is at ${pct}% (below minimum 75%). The student must attend ${classesNeededFor75} consecutive classes to regain exam eligibility.`;
  } else if (pct < 85) {
    overallSummary = `ATTENDANCE WARNING: Current attendance (${pct}%) is in the medium-risk bracket. Only ${maxAllowableAbsencesBefore75} more absences are permitted before falling below threshold.`;
  } else {
    overallSummary = `HEALTHY PARTICIPATION: Current attendance (${pct}%) exceeds target criteria. Projected to finish the semester in good standing.`;
  }

  return {
    recommendations,
    classesNeededFor75,
    classesNeededFor85,
    maxAllowableAbsencesBefore75,
    overallSummary,
  };
}

export const recommendationService = {
  calculateClassesNeeded,
  calculateAllowableAbsences,
  generateRecommendations,
  getStudentRecommendations: (studentId: string): CalculatedRecommendations => {
    return recommendationService.getRecommendationsForStudent(studentId);
  },
  getRecommendationsForStudent: (studentId: string): CalculatedRecommendations => {
    const student = dataStore.getStudentById(studentId);
    const risk = dataStore.getRiskAssessmentForStudent(studentId);
    const prediction = dataStore.getPredictionForStudent(studentId);
    const records = dataStore.getAttendance({ studentId });
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;

    const defaultRisk: RiskAssessment = risk || {
      id: `risk-${studentId}`,
      student_id: studentId,
      attendance_percentage: total > 0 ? (present / total) * 100 : 0,
      recent_attendance_percentage: 0,
      recent_absences: 0,
      consecutive_absences: 0,
      attendance_trend: 'stable',
      predicted_attendance: 0,
      risk_score: 0,
      risk_level: 'LOW',
      reasons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const predResult: PredictionResult = prediction
      ? {
          predictedAttendance: prediction.predicted_attendance,
          confidence: prediction.confidence,
          predictedRiskLevel: prediction.predicted_risk_level,
          algorithmVersion: prediction.algorithm_version,
          trend: prediction.trend,
          explanation: prediction.explanation,
          modelType: 'rule-based',
          factors: {
            recentWeightPct: 0,
            overallWeightPct: 0,
            trendAdjustmentPct: 0,
            sampleSize: total,
            consecutivePenalty: 0,
          },
        }
      : predictStudentAttendance(records);

    return generateRecommendations(studentId, defaultRisk, predResult, total, present);
  },
};
