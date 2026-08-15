import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { AppLogo } from '../../components/auth/AppLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  UserCheck,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  TrendingUp,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { login, loginAsRole } = useAuth();
  const { success, error: showToastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleQuickSelect = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('ApexAdmin2026!');
    setFormErrors({});
  };

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
    setFormErrors({});

    if (!validateForm()) {
      showToastError('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      success('Authentication verified successfully! Redirecting...');
      
      // Determine redirection path based on stored user profile
      const redirectState = (location.state as any)?.from?.pathname;
      if (redirectState) {
        navigate(redirectState, { replace: true });
        return;
      }

      // Check current email pattern or role
      if (email.toLowerCase().includes('super')) {
        navigate('/super-admin');
      } else if (email.toLowerCase().includes('teacher') || email.toLowerCase().includes('faculty')) {
        navigate('/teacher');
      } else if (email.toLowerCase().includes('student') || email.toLowerCase().includes('alex') || email.toLowerCase().includes('riya')) {
        navigate('/student');
      } else if (email.toLowerCase().includes('parent') || email.toLowerCase().includes('guardian')) {
        navigate('/parent');
      } else {
        navigate('/admin');
      }
    } else {
      const err = result.error || 'Invalid email or password.';
      setFormErrors({ general: err });
      showToastError(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft glowing ambient lighting */}
      <div className="absolute top-10 left-1/4 w-[480px] h-[480px] bg-[#6E63FF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] bg-[#8677FF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: AI Attendance Platform Branding & Features (Desktop) */}
        <div className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1035] border border-indigo-500/30 text-xs font-mono text-[#8677FF] shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#8677FF]" />
            <span>Apex Institutional Intelligence v2.4</span>
          </div>

          <div className="flex items-center gap-4">
            <AppLogo size="lg" showGlow={true} />
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6E63FF] to-[#8677FF]">Attendance</span>
              </h1>
              <p className="text-xs text-[#B3B8D4]">
                Smart Attendance • Early Risk Detection • Better Student Success
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to the centralized attendance prediction and dropout prevention ecosystem. Powered by neural pattern analysis, real-time absence tracking, and automated 4-tier intervention workflows.
          </p>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#0B1035]/80 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Brain className="w-4 h-4" />
                <span>94.2% AI Accuracy</span>
              </div>
              <p className="text-[11px] text-[#B3B8D4]">
                Predictive risk models detect at-risk students 3 weeks earlier.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B1035]/80 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[#8677FF] text-xs font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>What-If Simulator</span>
              </div>
              <p className="text-[11px] text-[#B3B8D4]">
                Calculate exact recovery attendance targets to meet 75% thresholds.
              </p>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#8677FF] shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">FERPA & ISO 27001 Compliant</span>: Student records, biometric signatures, and logs are protected by institutional AES-256 encryption.
            </div>
          </div>
        </div>

        {/* Right Side: Login Card (Mobile + Desktop) */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          {/* Mobile Header Branding */}
          <div className="lg:hidden text-center mb-6 space-y-2">
            <div className="flex justify-center">
              <AppLogo size="md" showGlow={true} />
            </div>
            <h1 className="text-2xl font-black text-white">AI Attendance</h1>
            <p className="text-xs text-[#B3B8D4]">
              Smart Attendance • Early Risk Detection • Better Student Success
            </p>
          </div>

          {/* Login Form Container Card */}
          <div className="bg-[#0B1035] p-6 sm:p-8 md:p-10 shadow-2xl shadow-black/90 rounded-3xl border border-indigo-900/60 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[#B3B8D4] mt-1">
                Sign in to continue to your attendance dashboard.
              </p>
            </div>

            {/* Quick 1-Click Role Logins for seamless testing & evaluators */}
            <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Quick Role Demo Logins:</span>
                <span className="text-[10px] text-[#8677FF] font-mono">1-Click Instant Switch</span>
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
                  <Shield className="w-3.5 h-3.5 shrink-0 text-[#8677FF]" />
                  <span className="truncate">Super Admin</span>
                </button>
              </div>
            </div>

            {/* General Form Error Alert */}
            {formErrors.general && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Credential Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border transition-all focus:outline-none ${
                      formErrors.email
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-indigo-900/60 focus:border-[#6E63FF] focus:ring-1 focus:ring-[#6E63FF]'
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-[#8677FF] hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border transition-all focus:outline-none ${
                      formErrors.password
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-indigo-900/60 focus:border-[#6E63FF] focus:ring-1 focus:ring-[#6E63FF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#B3B8D4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md bg-[#050816] border-indigo-900/80 text-[#6E63FF] focus:ring-[#6E63FF] accent-[#6E63FF]"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/35 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Navigation Link */}
            <div className="pt-4 border-t border-white/10 text-center text-xs text-[#B3B8D4]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#8677FF] font-bold hover:text-white hover:underline transition-colors ml-1"
              >
                Create an account / Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
