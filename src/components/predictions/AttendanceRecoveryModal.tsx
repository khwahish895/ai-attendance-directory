import React, { useState } from 'react';
import { AbsencePrediction } from '../../types';
import { Target, X, Calculator, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AttendanceRecoveryModalProps {
  prediction: AbsencePrediction;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceRecoveryModal: React.FC<AttendanceRecoveryModalProps> = ({
  prediction,
  isOpen,
  onClose,
}) => {
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  if (!isOpen) return null;

  const studentName = prediction.student?.profile?.full_name || 'Student';
  const currentAttendance = prediction.recovery_plan?.current_attendance || 68;

  // Assume a standard semester benchmark of 45 classes if not directly supplied
  const totalClassesSoFar = 30;
  const attendedSoFar = Math.round((currentAttendance / 100) * totalClassesSoFar);

  // Recovery formula:
  // (attended + X) / (totalSoFar + X) >= target / 100
  // attended + X >= targetPct * (totalSoFar + X)
  // X * (1 - targetPct) >= targetPct * totalSoFar - attended
  // X = Math.ceil((targetPct * totalSoFar - attended) / (1 - targetPct))
  const targetPctDecimal = targetPercentage / 100;
  const neededClasses = Math.max(
    0,
    Math.ceil((targetPctDecimal * totalClassesSoFar - attendedSoFar) / (1 - targetPctDecimal))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0B1035] border border-indigo-900/60 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6E63FF]/20 border border-[#6E63FF]/30 flex items-center justify-center text-[#8677FF]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Attendance Recovery Planner</h2>
              <p className="text-xs text-slate-400">Mathematical pathway to restore course eligibility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary */}
        <div className="p-4 rounded-2xl bg-[#050816] border border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Student:</span>
            <div className="font-bold text-white text-sm mt-0.5">{studentName}</div>
          </div>
          <div>
            <span className="text-slate-400">Current Standing:</span>
            <div className={`font-bold text-sm mt-0.5 ${currentAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {currentAttendance}% Attendance
            </div>
          </div>
        </div>

        {/* Target Slider / Buttons */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Select Target Attendance Benchmark</label>
          <div className="grid grid-cols-3 gap-2">
            {[75, 80, 85].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setTargetPercentage(pct)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  targetPercentage === pct
                    ? 'bg-[#6E63FF] border-[#8677FF] text-white shadow-lg shadow-[#6E63FF]/30'
                    : 'bg-[#050816] border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                {pct}% {pct === 75 ? '(Minimum Requirement)' : pct === 80 ? '(Safe Zone)' : '(Distinction)'}
              </button>
            ))}
          </div>
        </div>

        {/* Recovery Calculation Output Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6E63FF]/15 to-[#0B1035] border border-[#6E63FF]/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#8677FF]" />
              Required Classes to Attend
            </span>
            <span className="text-2xl font-black text-white font-mono">{neededClasses} Classes</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {neededClasses > 0 ? (
              <>
                To achieve <strong className="text-white">{targetPercentage}%</strong> from current standing ({currentAttendance}%), {studentName} must attend the next <strong className="text-[#8677FF]">{neededClasses} consecutive classes</strong> with zero unexcused absences.
              </>
            ) : (
              <>
                {studentName} currently already meets the <strong className="text-emerald-400">{targetPercentage}%</strong> threshold! Maintain regular attendance to preserve standing.
              </>
            )}
          </p>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Institution policy requires minimum 75% attendance to qualify for semester finals.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
          >
            Close Planner
          </button>
        </div>
      </div>
    </div>
  );
};
