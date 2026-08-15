import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showGlow = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const dim = iconSizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Background Soft Glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-3xl bg-[#6E63FF]/35 blur-xl animate-pulse pointer-events-none"
          style={{ transform: 'scale(1.2)' }}
        />
      )}

      {/* Futuristic SVG Logo Icon */}
      <div
        className={`relative ${sizeMap[size]} rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0B1035] via-[#12194d] to-[#050816] border border-indigo-500/40 p-2 shadow-2xl flex items-center justify-center overflow-hidden`}
      >
        {/* Subtle interior gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6E63FF]/20 via-transparent to-[#8677FF]/20" />

        <svg
          width={dim - 8}
          height={dim - 8}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_4px_12px_rgba(110,99,255,0.6)]"
        >
          {/* Circuit Grid Background Lines */}
          <path
            d="M20 50 H32 M68 50 H80 M50 20 V30 M50 78 V88"
            stroke="#6E63FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <circle cx="20" cy="50" r="3" fill="#8677FF" />
          <circle cx="80" cy="50" r="3" fill="#8677FF" />
          <circle cx="50" cy="88" r="3" fill="#8677FF" />

          {/* Attendance Prediction Graph Arc in background */}
          <path
            d="M28 72 Q 40 58, 52 64 T 76 46"
            stroke="#8677FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="3 3"
            strokeOpacity="0.8"
          />

          {/* Stylized Graduation Cap Top (Diamond) */}
          <path
            d="M50 18 L84 34 L50 48 L16 34 Z"
            fill="url(#capGradient)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Graduation Cap Skull Base */}
          <path
            d="M26 39 V52 C26 62 74 62 74 52 V39"
            stroke="#8677FF"
            strokeWidth="2.5"
            fill="#0B1035"
            fillOpacity="0.8"
          />

          {/* Tassel Hanging */}
          <path
            d="M80 36 V54 C80 57 78 60 76 61"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="76" cy="62" r="2.5" fill="#F59E0B" />

          {/* AI Neural Node Center / Student Focus */}
          <circle cx="50" cy="33" r="4.5" fill="#FFFFFF" />
          <circle cx="50" cy="33" r="2.5" fill="#6E63FF" />

          {/* Verification / High Attendance Checkmark Badge */}
          <g transform="translate(42, 60)">
            <circle cx="16" cy="16" r="14" fill="#050816" stroke="#10B981" strokeWidth="2.5" />
            <path
              d="M10 16 L14 20 L22 12"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="capGradient" x1="16" y1="18" x2="84" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6E63FF" />
              <stop offset="0.5" stopColor="#8677FF" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
