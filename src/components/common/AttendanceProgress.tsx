import React from 'react';

interface AttendanceProgressProps {
  percentage: number;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  threshold?: number; // default 75
  className?: string;
}

export const AttendanceProgress: React.FC<AttendanceProgressProps> = ({
  percentage,
  showLabels = true,
  height = 'md',
  threshold = 75,
  className = '',
}) => {
  const safePct = Math.min(100, Math.max(0, percentage));

  let barColor = 'bg-emerald-500 shadow-emerald-500/50';
  let textColor = 'text-emerald-400';
  let statusText = 'Healthy';

  if (safePct < threshold) {
    barColor = 'bg-rose-500 shadow-rose-500/50';
    textColor = 'text-rose-400';
    statusText = 'Critical (<75%)';
  } else if (safePct < 85) {
    barColor = 'bg-amber-500 shadow-amber-500/50';
    textColor = 'text-amber-400';
    statusText = 'Warning (75-84%)';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-[#B3B8D4]">Attendance Progress</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-normal">({statusText})</span>
            <span className={`font-bold font-mono ${textColor}`}>{safePct.toFixed(1)}%</span>
          </div>
        </div>
      )}

      <div className={`relative w-full bg-[#050816] rounded-full overflow-hidden border border-white/5 ${heightClasses}`}>
        {/* Threshold target marker at 75% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 z-10"
          style={{ left: `${threshold}%` }}
          title={`Minimum statutory requirement (${threshold}%)`}
        />
        {/* 85% safe line marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/50 z-10"
          style={{ left: '85%' }}
          title="Safe target threshold (85%)"
        />

        <div
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${barColor}`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  );
};
