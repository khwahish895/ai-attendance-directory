import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[#0B1035]/60 border border-dashed border-indigo-900/40 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-[#050816] text-[#8677FF] border border-white/5 mb-4 shadow-inner">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-[#B3B8D4] max-w-sm leading-relaxed mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-[#6E63FF] hover:bg-[#8677FF] text-white text-xs font-semibold shadow-lg shadow-[#6E63FF]/30 transition-all hover:scale-105 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
