import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppLogo } from '../../components/auth/AppLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing AI Neural Model...');

  useEffect(() => {
    // Increment smooth loading progress over ~2 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 10;
        if (next === 40) setStatusMessage('Checking Session & Security Policies...');
        if (next === 80) setStatusMessage('Calibrating Risk Prediction Engine...');
        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100 || isLoading) return;

    // Transition after ~2.0 - 2.2 seconds based on authentication state
    const timeout = setTimeout(() => {
      if (isAuthenticated && user && role) {
        switch (role) {
          case 'super_admin':
            navigate('/super-admin', { replace: true });
            break;
          case 'administrator':
            navigate('/admin', { replace: true });
            break;
          case 'teacher':
            navigate('/teacher', { replace: true });
            break;
          case 'student':
            navigate('/student', { replace: true });
            break;
          case 'parent':
            navigate('/parent', { replace: true });
            break;
          default:
            navigate('/admin', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [progress, isLoading, isAuthenticated, user, role, navigate]);

  const handleSkip = () => {
    if (isAuthenticated && role) {
      navigate(`/${role === 'administrator' ? 'admin' : role.replace('_', '-')}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050816] text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-[#6E63FF]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-[420px] h-[420px] bg-[#8677FF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 -left-20 w-[380px] h-[380px] bg-[#4F46E5]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header Tag */}
      <header className="relative z-10 w-full flex items-center justify-between max-w-5xl">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1035]/80 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-950/40">
          <Sparkles className="w-3.5 h-3.5 text-[#8677FF] animate-spin" />
          <span className="text-[11px] font-mono text-slate-300 font-semibold tracking-wider uppercase">
            Apex Institute • AI System v2.4
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-[#B3B8D4] hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-xl px-4 animate-in fade-in zoom-in-95 duration-700">
        {/* App Logo */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
          <AppLogo size="xl" showGlow={true} />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6E63FF] via-[#8677FF] to-indigo-300">Attendance</span>
        </h1>

        {/* Feature Sub-Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6E63FF]/20 to-[#8677FF]/20 border border-[#6E63FF]/40 text-indigo-200 text-xs font-semibold tracking-wide mb-6 shadow-md shadow-[#6E63FF]/10">
          <span>Smart Attendance</span>
          <span className="text-[#8677FF] font-bold">•</span>
          <span>Prediction</span>
          <span className="text-[#8677FF] font-bold">•</span>
          <span>Risk Detection</span>
        </div>

        {/* Full Official Title */}
        <h2 className="text-sm sm:text-base font-bold text-slate-200 max-w-md leading-snug mb-3">
          AI-Based Student Attendance Prediction and Risk Detection System
        </h2>

        {/* Short Tagline */}
        <p className="text-xs sm:text-sm text-[#B3B8D4] max-w-sm font-medium leading-relaxed">
          Smart Attendance. Early Risk Detection. Better Student Success.
        </p>

        {/* Animated Loading Dots & Progress Bar */}
        <div className="mt-8 sm:mt-10 w-full max-w-xs space-y-3">
          {/* Pulsing Dots: ● ● ● */}
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#6E63FF] shadow-lg shadow-[#6E63FF]"
              style={{
                animation: 'pulse 1.4s infinite ease-in-out',
                animationDelay: '0s',
              }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#8677FF] shadow-lg shadow-[#8677FF]"
              style={{
                animation: 'pulse 1.4s infinite ease-in-out',
                animationDelay: '0.2s',
              }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-indigo-300 shadow-lg shadow-indigo-300"
              style={{
                animation: 'pulse 1.4s infinite ease-in-out',
                animationDelay: '0.4s',
              }}
            />
          </div>

          {/* Smooth Progress Track */}
          <div className="w-full bg-[#0B1035] rounded-full h-1.5 border border-indigo-900/60 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#6E63FF] via-[#8677FF] to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(110,99,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Live Status Message */}
          <div className="text-[11px] font-mono text-slate-400">
            {statusMessage}
          </div>
        </div>
      </main>

      {/* Footer Security Badge */}
      <footer className="relative z-10 w-full text-center max-w-md">
        <div className="inline-flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>AES-256 Encrypted • Multi-Tenant RBAC Auth Enabled</span>
        </div>
      </footer>
    </div>
  );
};
