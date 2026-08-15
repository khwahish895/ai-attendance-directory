import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getHomeRoute = () => {
    switch (role) {
      case 'super_admin':
        return '/super-admin';
      case 'administrator':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'parent':
        return '/parent';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-md">
        <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
        <p className="text-xs text-[#B3B8D4]">
          The route you requested does not exist or may have been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2.5 rounded-xl bg-[#050816] hover:bg-white/5 border border-indigo-900/60 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate(getHomeRoute())}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 cursor-pointer flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
