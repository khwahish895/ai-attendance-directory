import React from 'react';
import { AbsencePrediction, PredictionPerformanceMetrics } from '../../types';
import { calculatePredictionPerformanceMetrics } from '../../services/absencePredictionService';
import {
  BarChart3,
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldAlert,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface PredictionPerformanceModalProps {
  predictions: AbsencePrediction[];
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionPerformanceModal: React.FC<PredictionPerformanceModalProps> = ({
  predictions,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const metrics: PredictionPerformanceMetrics = calculatePredictionPerformanceMetrics(predictions);

  // Chart data: Predicted vs Actual
  const outcomeData = [
    { name: 'True Positives (Absent)', count: metrics.true_positives, fill: '#6E63FF' },
    { name: 'True Negatives (Present)', count: metrics.true_negatives, fill: '#10B981' },
    { name: 'False Alarms (Predicted Absent, Was Present)', count: metrics.false_positives, fill: '#F59E0B' },
    { name: 'Missed Absences (Predicted Present, Was Absent)', count: metrics.false_negatives, fill: '#EF4444' },
  ];

  // Chart data: Risk Distribution
  const highRiskCount = predictions.filter(p => p.risk_level === 'HIGH').length;
  const medRiskCount = predictions.filter(p => p.risk_level === 'MEDIUM').length;
  const lowRiskCount = predictions.filter(p => p.risk_level === 'LOW').length;

  const riskDistribution = [
    { name: 'High Risk (>=70%)', value: highRiskCount, color: '#EF4444' },
    { name: 'Medium Risk (40-69%)', value: medRiskCount, color: '#F59E0B' },
    { name: 'Low Risk (<40%)', value: lowRiskCount, color: '#10B981' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0B1035] border border-indigo-900/70 p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#6E63FF]/20 border border-[#6E63FF]/30 flex items-center justify-center text-[#8677FF]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Predictor Performance & Evaluation Metrics
              </h2>
              <p className="text-xs text-slate-400">
                Transparent verification of statistical model outputs against actual class attendance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#050816] border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Overall Accuracy</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {metrics.has_sufficient_data ? `${metrics.accuracy}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {metrics.correct_predictions} of {metrics.evaluated_predictions} evaluated
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Precision (Absence)</div>
            <div className="text-2xl font-black text-[#8677FF] mt-1 font-mono">
              {metrics.has_sufficient_data ? `${metrics.precision}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">TP / (TP + FP)</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Recall (Sensitivity)</div>
            <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">
              {metrics.has_sufficient_data ? `${metrics.recall}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">TP / (TP + FN)</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">F1 Balance Score</div>
            <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
              {metrics.has_sufficient_data ? `${metrics.f1_score}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Harmonic mean</div>
          </div>
        </div>

        {/* 2x2 Confusion Matrix Section */}
        <div className="p-5 rounded-2xl bg-[#050816] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#8677FF]" />
                Statistical Confusion Matrix (Positive Class = Absence)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of model predictions vs actual logged attendance outcomes
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#6E63FF]/20 text-[#8677FF] border border-[#6E63FF]/30 font-mono">
              Evaluated: {metrics.evaluated_predictions} | Pending: {metrics.pending_predictions}
            </span>
          </div>

          {metrics.has_sufficient_data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Matrix Table */}
              <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-500/20 overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-white/10 bg-black/40 text-slate-400"></th>
                      <th className="p-2 border border-white/10 bg-rose-500/10 text-rose-300 font-bold">
                        Actual Absent
                      </th>
                      <th className="p-2 border border-white/10 bg-emerald-500/10 text-emerald-300 font-bold">
                        Actual Present
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-white/10 bg-rose-500/10 text-rose-300 font-bold text-left">
                        Predicted Absent
                      </td>
                      <td className="p-3 border border-white/10 bg-[#6E63FF]/20">
                        <div className="font-mono text-base font-bold text-white">{metrics.true_positives}</div>
                        <div className="text-[10px] text-slate-300">True Positive (TP)</div>
                      </td>
                      <td className="p-3 border border-white/10 bg-amber-500/10">
                        <div className="font-mono text-base font-bold text-amber-300">{metrics.false_positives}</div>
                        <div className="text-[10px] text-amber-300/80">False Alarm (FP)</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-white/10 bg-emerald-500/10 text-emerald-300 font-bold text-left">
                        Predicted Present
                      </td>
                      <td className="p-3 border border-white/10 bg-rose-500/10">
                        <div className="font-mono text-base font-bold text-rose-300">{metrics.false_negatives}</div>
                        <div className="text-[10px] text-rose-300/80">Missed Absence (FN)</div>
                      </td>
                      <td className="p-3 border border-white/10 bg-emerald-500/20">
                        <div className="font-mono text-base font-bold text-emerald-300">{metrics.true_negatives}</div>
                        <div className="text-[10px] text-emerald-300/80">True Negative (TN)</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Chart Visualizer */}
              <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-500/20 flex flex-col justify-center">
                <div className="text-xs font-semibold text-slate-300 mb-2">Evaluation Breakdown</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outcomeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" width={110} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B1035', borderColor: '#6E63FF', borderRadius: '12px' }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0B1035] rounded-2xl border border-white/5 space-y-2">
              <Info className="w-8 h-8 text-[#8677FF] mx-auto" />
              <div className="text-sm font-bold text-white">Insufficient Evaluated Predictions</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The statistical engine requires at least 3 completed and evaluated predictions before generating
                the confusion matrix and precision/recall statistics. Mark actual outcomes on past predictions to populate.
              </p>
            </div>
          )}
        </div>

        {/* Risk Distribution & Architecture Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#050816] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Current Roster Risk Distribution
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1035', borderColor: '#6E63FF', borderRadius: '12px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#050816] border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-[#8677FF]" />
                Algorithm & Microservice Architecture
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The current system utilizes the <strong className="text-white">RuleBasedPredictionProvider (v1.0)</strong>, combining multi-factor weighted statistical scoring with historical trend adjustments.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-[#0B1035] border border-indigo-500/20 text-[11px] text-slate-300 space-y-1">
                <div className="text-[#8677FF] font-bold">FastAPI / ML Integration Ready:</div>
                <p className="text-slate-400">
                  Implements the standard <code className="text-white font-mono">PredictionProvider</code> interface. Can be upgraded seamlessly to an external XGBoost / Random Forest microservice without frontend modifications.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
              >
                Close Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
