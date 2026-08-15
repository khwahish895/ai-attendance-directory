import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  glowColor?: 'purple' | 'emerald' | 'amber' | 'rose' | 'blue';
  className?: string;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  glowColor = 'purple',
  className = '',
  id,
}) => {
  const glowMap = {
    purple: 'from-[#6E63FF]/20 to-transparent border-[#6E63FF]/30 text-[#8677FF]',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400',
    blue: 'from-blue-500/20 to-transparent border-blue-500/30 text-blue-400',
  };

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-2xl bg-[#0B1035] border border-indigo-900/40 p-5 shadow-lg shadow-black/40 transition-all duration-200 hover:border-indigo-500/40 group ${className}`}
    >
      {/* Subtle top gradient glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${glowMap[glowColor]}`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-[#B3B8D4] uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl bg-[#050816]/70 border border-white/5 ${glowMap[glowColor]} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-[#B3B8D4]">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <div
              className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
              {trend.label && <span className="text-[10px] opacity-75">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
