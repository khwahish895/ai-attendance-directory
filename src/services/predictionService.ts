import { Attendance, Prediction, RiskLevel, TrendDirection } from '../types';
import { analyzeAttendanceTrend, calculateConsecutiveAbsences } from './riskService';
import { dataStore } from '../lib/dataProvider';

export interface PredictionResult {
  predictedAttendance: number;
  confidence: number;
  predictedRiskLevel: RiskLevel;
  algorithmVersion: string;
  trend: TrendDirection;
  explanation: string;
  modelType: 'rule-based' | 'ml-service';
  factors: {
    recentWeightPct: number;
    overallWeightPct: number;
    trendAdjustmentPct: number;
    sampleSize: number;
    consecutivePenalty: number;
  };
}

/**
 * Predicts future attendance using the statistical rule-based model (v1).
 * Architecture is designed to be easily superseded by an asynchronous FastAPI/ML microservice endpoint.
 */
export function predictStudentAttendance(records: Attendance[]): PredictionResult {
  const algorithmVersion = 'rule-based-v1';

  if (!records || records.length === 0) {
    return {
      predictedAttendance: 0.0,
      confidence: 0,
      predictedRiskLevel: 'LOW',
      algorithmVersion,
      trend: 'stable',
      explanation: 'Insufficient historical attendance records to produce a reliable prediction.',
      modelType: 'rule-based',
      factors: {
        recentWeightPct: 0,
        overallWeightPct: 0,
        trendAdjustmentPct: 0,
        sampleSize: 0,
        consecutivePenalty: 0,
      },
    };
  }

  const { overallPct, recentPct, trend, trendDiff } = analyzeAttendanceTrend(records);
  const consecutiveAbsences = calculateConsecutiveAbsences(records);
  const sampleSize = records.length;

  // Rule-based algorithm (v1):
  // 60% Recent Attendance + 30% Overall Attendance + 10% Trend/Consecutive Adjustment
  const recentWeight = recentPct * 0.60;
  const overallWeight = overallPct * 0.30;
  
  // Trend factor: slope adjustment
  let trendAdjustment = trendDiff * 0.10;
  
  // Consecutive absence acceleration factor
  const consecutivePenalty = consecutiveAbsences >= 2 ? consecutiveAbsences * 2.5 : 0;

  let rawPrediction = recentWeight + overallWeight + trendAdjustment - consecutivePenalty;
  const predictedAttendance = Number(Math.min(100, Math.max(0, rawPrediction)).toFixed(1));

  // Determine predicted risk level
  let predictedRiskLevel: RiskLevel = 'LOW';
  if (predictedAttendance < 75.0) {
    predictedRiskLevel = 'HIGH';
  } else if (predictedAttendance < 85.0) {
    predictedRiskLevel = 'MEDIUM';
  } else {
    predictedRiskLevel = 'LOW';
  }

  // Calculate confidence score (0 - 100) based on sample size and consistency
  let sampleConfidence = 50;
  if (sampleSize >= 30) {
    sampleConfidence = 92;
  } else if (sampleSize >= 15) {
    sampleConfidence = 84;
  } else if (sampleSize >= 8) {
    sampleConfidence = 72;
  } else {
    sampleConfidence = 55;
  }

  // Deduct confidence if high volatility in trend
  const volatilityPenalty = Math.min(15, Math.abs(trendDiff) * 0.8);
  const confidence = Math.round(Math.min(98, Math.max(40, sampleConfidence - volatilityPenalty)));

  // Generate explanatory context
  let explanation = '';
  if (predictedAttendance >= 85) {
    explanation = `Model projects strong trajectory (${predictedAttendance}%) based on solid ${sampleSize}-class history and positive session consistency.`;
  } else if (predictedAttendance >= 75) {
    explanation = `Model projects moderate attendance (${predictedAttendance}%) with a ${trend} trend. Additional unexcused absences could breach the 75% limit.`;
  } else {
    explanation = `CRITICAL: Statistical forecast indicates final attendance will drop to ${predictedAttendance}%, falling short of minimum 75% required credits.`;
  }

  return {
    predictedAttendance,
    confidence,
    predictedRiskLevel,
    algorithmVersion,
    trend,
    explanation,
    modelType: 'rule-based',
    factors: {
      recentWeightPct: Number(recentWeight.toFixed(1)),
      overallWeightPct: Number(overallWeight.toFixed(1)),
      trendAdjustmentPct: Number(trendAdjustment.toFixed(1)),
      sampleSize,
      consecutivePenalty,
    },
  };
}

export const predictionService = {
  predictStudentAttendance,
  getPrediction: (studentId: string): Prediction | undefined => {
    return dataStore.getPredictionForStudent(studentId);
  },
  calculateAllPredictions: () => {
    const students = dataStore.getStudents();
    students.forEach(s => {
      dataStore.recalculateStudentAnalytics(s.id);
    });
    return dataStore.getPredictions();
  },
  predictForStudent: (studentId: string): PredictionResult => {
    const records = dataStore.getAttendance({ studentId });
    return predictStudentAttendance(records);
  }
};
