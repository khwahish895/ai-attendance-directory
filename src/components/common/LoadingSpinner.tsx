import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading analytics & attendance data...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative">
        <Loader2 className={`${sizeClasses} text-[#6E63FF] animate-spin`} />
        <div className="absolute inset-0 rounded-full blur-md bg-[#8677FF]/40 animate-pulse" />
      </div>
      {label && <p className="text-xs font-medium text-[#B3B8D4] tracking-wide">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
