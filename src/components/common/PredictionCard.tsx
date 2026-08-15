import React from 'react';
import { Cpu, Sparkles, TrendingDown, TrendingUp, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Prediction } from '../../types';
import { RiskBadge } from './RiskBadge';

interface PredictionCardProps {
  prediction: Prediction;
  currentAttendance?: number;
  className?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  currentAttendance,
  className = '',
}) => {
  const isCritical = prediction.predicted_attendance < 75.0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-[#0B1035] border ${
        isCritical ? 'border-rose-500/40' : 'border-[#6E63FF]/30'
      } p-6 shadow-xl shadow-black/50 ${className}`}
    >
      {/* Neon Glow backdrop */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isCritical ? 'bg-rose-500' : 'bg-[#8677FF]'
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#6E63FF]/15 border border-[#6E63FF]/30 text-[#8677FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Statistical Attendance Forecast
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#050816] text-[#B3B8D4] border border-white/10">
                <Sparkles className="w-2.5 h-2.5 text-[#8677FF]" />
                {prediction.algorithm_version}
              </span>
            </div>
            <p className="text-xs text-[#B3B8D4]">
              Projection horizon: <span className="text-slate-300 font-medium">{prediction.prediction_period}</span>
            </p>
          </div>
        </div>

        <RiskBadge level={prediction.predicted_risk_level} size="sm" />
      </div>

      {/* Main Metric Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-4 rounded-2xl bg-[#050816]/70 border border-white/5">
        {/* Predicted Attendance */}
        <div>
          <div className="text-xs text-[#B3B8D4] font-medium mb-1">Projected Attendance</div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${
                isCritical ? 'text-rose-400' : prediction.predicted_attendance >= 85 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {prediction.predicted_attendance.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="text-xs text-[#B3B8D4] font-medium mb-1">Model Confidence</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {prediction.confidence}%
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              (High sample stability)
            </span>
          </div>
        </div>

        {/* Trajectory */}
        <div>
          <div className="text-xs text-[#B3B8D4] font-medium mb-1">Trajectory Velocity</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {prediction.trend === 'improving' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5" /> Improving
              </span>
            ) : prediction.trend === 'declining' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                <TrendingDown className="w-3.5 h-3.5" /> Declining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-500/10 px-2 py-1 rounded-lg border border-slate-500/20">
                <Minus className="w-3.5 h-3.5" /> Stable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warning Callout if below threshold */}
      {isCritical && (
        <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300">Attention Required:</span> Forecast warns attendance will fail statutory minimum (75%). Immediate intervention needed.
          </div>
        </div>
      )}

      {!isCritical && currentAttendance && currentAttendance >= 85 && (
        <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300">On Track:</span> Student is consistently above required threshold and meeting graduation credit benchmarks.
          </div>
        </div>
      )}

      {/* Model Rationale */}
      <div className="text-xs text-[#B3B8D4] leading-relaxed border-t border-white/5 pt-3">
        <span className="font-semibold text-slate-300">Model Insights: </span>
        {prediction.explanation}
      </div>
    </div>
  );
};
