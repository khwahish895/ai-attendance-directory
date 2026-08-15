import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md',
  className = '',
}) => {
  const config = {
    LOW: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: ShieldCheck,
      label: 'LOW RISK',
      glow: 'shadow-emerald-500/10',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
      glow: 'shadow-amber-500/10',
    },
    HIGH: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse',
      icon: ShieldAlert,
      label: 'HIGH RISK',
      glow: 'shadow-rose-500/20',
    },
  }[level] || {
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
    icon: ShieldCheck,
    label: level,
    glow: '',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-sm ${config.bg} ${config.glow} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md ml-0.5">
          {score}/100
        </span>
      )}
    </span>
  );
};
