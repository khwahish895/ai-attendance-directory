import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { Sparkles, Shield, UserCheck, GraduationCap, Users, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAsRole } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleRoleQuickLogin = (role: UserRole) => {
    loginAsRole(role);
    success(`Logged in as ${role.replace('_', ' ').toUpperCase()}`);
    if (role === 'super_admin') navigate('/super-admin');
    else if (role === 'administrator') navigate('/admin');
    else if (role === 'teacher') navigate('/teacher');
    else if (role === 'student') navigate('/student');
    else if (role === 'parent') navigate('/parent');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email address');
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      success('Authentication successful!');
      navigate('/admin');
    } else {
      error(result.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6E63FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#8677FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#6E63FF] to-[#8677FF] flex items-center justify-center shadow-xl shadow-[#6E63FF]/40 border border-white/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Attendance & Risk System
        </h2>
        <p className="mt-1 text-center text-xs text-[#B3B8D4]">
          Educational Analytics • Absenteeism Detection • Risk Forecasts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1035] py-8 px-6 sm:px-10 shadow-2xl shadow-black/80 rounded-3xl border border-indigo-900/50 backdrop-blur-xl">
          {/* One-Click Quick Role Switcher for reviewers */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Role Demo Logins:</span>
              <span className="text-[10px] text-[#8677FF] font-normal">Click any role</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('administrator')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer text-left"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('teacher')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer text-left"
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('student')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer text-left"
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('parent')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer text-left"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Parent</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('super_admin')}
                className="col-span-2 sm:col-span-2 flex items-center gap-1.5 p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer text-left"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Super Admin (System Owner)</span>
              </button>
            </div>
          </div>

          {/* Standard Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. admin@apextech.edu"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF] focus:ring-1 focus:ring-[#6E63FF] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#8677FF] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF] focus:ring-1 focus:ring-[#6E63FF] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#B3B8D4]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#8677FF] font-semibold hover:underline">
              Register New Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
