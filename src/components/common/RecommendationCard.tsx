import React, { useState } from 'react';
import { Lightbulb, CheckSquare, Square, ChevronRight, UserCheck, AlertTriangle } from 'lucide-react';
import { Recommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  className = '',
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const urgencyConfig = {
    high: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
    medium: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
    low: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
  }[recommendation.urgency];

  return (
    <div
      className={`rounded-2xl bg-[#0B1035] border border-indigo-900/40 p-5 shadow-md shadow-black/30 transition-all hover:border-indigo-500/30 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#6E63FF]/15 text-[#8677FF] border border-[#6E63FF]/30">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">{recommendation.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Target: <span className="text-[#8677FF] capitalize">{recommendation.target_audience}</span>
              </span>
            </div>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${urgencyConfig}`}>
          {recommendation.urgency} Priority
        </span>
      </div>

      <p className="text-xs text-[#B3B8D4] leading-relaxed mb-4">
        {recommendation.description}
      </p>

      {recommendation.actionable_steps && recommendation.actionable_steps.length > 0 && (
        <div className="space-y-2 border-t border-white/5 pt-3">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Actionable Next Steps:
          </div>
          {recommendation.actionable_steps.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl bg-[#050816]/60 border border-white/5 hover:border-white/10 transition-colors text-xs text-slate-300 group cursor-pointer"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-0.5" />
                )}
                <span className={`leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
