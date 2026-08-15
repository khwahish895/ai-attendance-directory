import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Check, Clock } from 'lucide-react';
import { Alert } from '../../types';
import { dataStore } from '../../lib/dataProvider';

interface AlertCardProps {
  alert: Alert;
  onRead?: (id: string) => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onRead,
  className = '',
}) => {
  const handleMarkRead = () => {
    dataStore.markAlertAsRead(alert.id);
    if (onRead) onRead(alert.id);
  };

  const severityConfig = {
    high: {
      border: 'border-rose-500/40 bg-rose-950/20',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    medium: {
      border: 'border-amber-500/40 bg-amber-950/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    low: {
      border: 'border-indigo-500/40 bg-indigo-950/20',
      icon: Info,
      iconColor: 'text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  }[alert.severity];

  const Icon = severityConfig.icon;

  const dateDisplay = new Date(alert.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${severityConfig.border} ${
        alert.is_read ? 'opacity-60' : 'shadow-lg shadow-black/40'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl bg-black/40 ${severityConfig.iconColor} shrink-0 mt-0.5`}>
            <Icon className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="text-sm font-bold text-white tracking-tight">{alert.title}</h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityConfig.badge}`}>
                {alert.severity}
              </span>
              {alert.student?.roll_number && (
                <span className="text-[10px] text-slate-400 bg-black/30 px-1.5 py-0.5 rounded font-mono">
                  {alert.student.roll_number}
                </span>
              )}
            </div>

            <p className="text-xs text-[#B3B8D4] leading-relaxed mb-2">
              {alert.message}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{dateDisplay}</span>
            </div>
          </div>
        </div>

        {!alert.is_read && (
          <button
            onClick={handleMarkRead}
            className="flex items-center gap-1 text-[11px] font-medium text-[#8677FF] hover:text-white px-2 py-1 rounded-lg bg-[#6E63FF]/10 hover:bg-[#6E63FF]/20 border border-[#6E63FF]/20 transition-colors shrink-0"
            title="Mark as resolved/read"
          >
            <Check className="w-3 h-3" />
            <span>Acknowledge</span>
          </button>
        )}
      </div>
    </div>
  );
};
