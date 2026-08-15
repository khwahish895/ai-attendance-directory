import React from 'react';
import { AbsencePrediction } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  BookOpen,
  User,
  Info,
  TrendingDown,
  TrendingUp,
  Target,
  Send,
  Bell,
  Check,
  X,
  Clock,
  Cpu,
} from 'lucide-react';

interface AbsencePredictionCardProps {
  prediction: AbsencePrediction;
  onContactStudent?: (prediction: AbsencePrediction) => void;
  onNotifyParent?: (prediction: AbsencePrediction) => void;
  onOpenRecoveryPlan?: (prediction: AbsencePrediction) => void;
  onEvaluate?: (predictionId: string, status: 'present' | 'absent') => void;
  compact?: boolean;
}

export const AbsencePredictionCard: React.FC<AbsencePredictionCardProps> = ({
  prediction,
  onContactStudent,
  onNotifyParent,
  onOpenRecoveryPlan,
  onEvaluate,
  compact = false,
}) => {
  const isLikelyAbsent = prediction.prediction === 'Likely Absent';
  const isHighRisk = prediction.risk_level === 'HIGH';
  const isMediumRisk = prediction.risk_level === 'MEDIUM';

  const riskBadgeColor = isHighRisk
    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    : isMediumRisk
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  const predictionBg = isLikelyAbsent
    ? 'from-rose-950/40 via-[#0B1035] to-[#050816] border-rose-500/30'
    : 'from-emerald-950/40 via-[#0B1035] to-[#050816] border-emerald-500/30';

  return (
    <div
      className={`rounded-3xl bg-gradient-to-b ${predictionBg} border p-5 md:p-6 shadow-2xl transition-all hover:border-[#6E63FF]/50 relative overflow-hidden`}
    >
      {/* Subtle background glow */}
      <div
        className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isLikelyAbsent ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg ${
              isLikelyAbsent
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isLikelyAbsent ? (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {prediction.student?.profile?.full_name || 'Student'}
              </h3>
              {prediction.student?.roll_number && (
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                  {prediction.student.roll_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-[#8677FF]" />
                {prediction.subject?.name || 'Class Session'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Target: {prediction.target_date}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border uppercase tracking-wider ${riskBadgeColor}`}>
            {prediction.risk_level} RISK
          </span>
          <span className="text-[10px] text-slate-400 bg-[#0B1035] border border-white/10 px-2 py-1 rounded-xl font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#8677FF]" />
            v1.0 (Rule-Based)
          </span>
        </div>
      </div>

      {/* Main Prediction Output Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-2xl bg-[#050816]/70 border border-white/10 relative z-10">
        {/* Left: Decision & Probability */}
        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Projected Status for Upcoming Class
            </div>
            <div
              className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 flex items-center gap-2 ${
                isLikelyAbsent ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {prediction.prediction.toUpperCase()}
              {isLikelyAbsent ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300">
                  {prediction.absence_probability}% Risk
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  {prediction.attendance_probability}% Present
                </span>
              )}
            </div>
          </div>

          {/* Probability Balance Meter */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Absence Prob: {prediction.absence_probability}%
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Attendance Prob: {prediction.attendance_probability}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-l-full transition-all duration-500"
                style={{ width: `${prediction.absence_probability}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-r-full transition-all duration-500"
                style={{ width: `${prediction.attendance_probability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Confidence Score & Calibration Note */}
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-3 md:pt-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Statistical Confidence
              </span>
              <span className="text-sm font-bold text-white">{prediction.confidence}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#6E63FF] to-[#8677FF] rounded-full"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#8677FF] shrink-0 mt-0.5" />
              <span>{prediction.confidence_note}</span>
            </p>
          </div>

          {/* Outcome Evaluation Status Badge */}
          {prediction.actual_result && prediction.actual_result !== 'pending' && (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Actual Outcome:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                  prediction.actual_result === 'correct'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {prediction.actual_result === 'correct' ? '✓ Correct Prediction' : '⚠ False Alarm / Miss'}
                {prediction.actual_attendance_status ? ` (Actual: ${prediction.actual_attendance_status})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation & Factor Checklist */}
      {!compact && (
        <div className="space-y-3 relative z-10">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8677FF]" />
            Why is this outcome predicted? (Contributing Factors)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prediction.factors.map((factor, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                  factor.impact === 'negative'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                    : factor.impact === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    factor.impact === 'negative'
                      ? 'bg-rose-400'
                      : factor.impact === 'positive'
                      ? 'bg-emerald-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="truncate">{factor.text}</span>
              </div>
            ))}
          </div>

          {/* Recommendation Box */}
          <div className="p-3.5 rounded-2xl bg-[#0B1035]/80 border border-indigo-500/20 text-xs text-slate-300">
            <span className="font-bold text-[#8677FF] mr-1.5">Recommended Action:</span>
            {prediction.recommendation}
          </div>

          {/* Recovery Plan Snippet if below 75% */}
          {prediction.recovery_plan && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-amber-300">Attendance Recovery Target</div>
                  <div className="text-slate-300 text-[11px]">
                    Must attend next <strong className="text-white font-mono">{prediction.recovery_plan.classes_required}</strong> consecutive classes to reach 75%.
                  </div>
                </div>
              </div>
              {onOpenRecoveryPlan && (
                <button
                  onClick={() => onOpenRecoveryPlan(prediction)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all shrink-0"
                >
                  View Plan
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          {onContactStudent && (
            <button
              onClick={() => onContactStudent(prediction)}
              className="px-3.5 py-2 rounded-xl bg-[#0B1035] hover:bg-[#6E63FF]/20 text-slate-200 hover:text-white border border-white/10 hover:border-[#6E63FF]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-[#8677FF]" />
              Contact Student
            </button>
          )}

          {onNotifyParent && (
            <button
              onClick={() => onNotifyParent(prediction)}
              className="px-3.5 py-2 rounded-xl bg-[#0B1035] hover:bg-[#6E63FF]/20 text-slate-200 hover:text-white border border-white/10 hover:border-[#6E63FF]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              Notify Parent
            </button>
          )}
        </div>

        {/* Evaluation Controls for Teachers/Admins (if pending) */}
        {onEvaluate && (!prediction.actual_result || prediction.actual_result === 'pending') && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Evaluate Actual:</span>
            <button
              onClick={() => onEvaluate(prediction.id, 'present')}
              title="Record that student was actually Present"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition-all flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Present
            </button>
            <button
              onClick={() => onEvaluate(prediction.id, 'absent')}
              title="Record that student was actually Absent"
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-all flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Absent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
