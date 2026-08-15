import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { AppLogo } from '../../components/auth/AppLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || 'user@apextech.edu';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { success, error: showToastError } = useToast();
  const navigate = useNavigate();

  // Password requirements check
  const passwordChecks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      matchesConfirm: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.minLength) score += 25;
    if (passwordChecks.hasUpper) score += 25;
    if (passwordChecks.hasLower) score += 25;
    if (passwordChecks.hasNumber) score += 25;
    return score;
  }, [passwordChecks]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 25) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (strengthScore <= 50) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (strengthScore <= 75) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
    return { label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-400' };
  }, [strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !passwordChecks.minLength ||
      !passwordChecks.hasUpper ||
      !passwordChecks.hasLower ||
      !passwordChecks.hasNumber
    ) {
      setErrorMessage('Please fulfill all password security rules.');
      showToastError('Please meet the password requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      showToastError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    setIsSubmitting(false);
    setIsSuccess(true);
    success('Password updated successfully.');
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6E63FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#8677FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <AppLogo size="md" showGlow={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-[#B3B8D4]">
            Update your credentials for <span className="text-white font-semibold">{emailParam}</span>
          </p>
        </div>

        <div className="bg-[#0B1035] py-8 px-6 sm:px-10 shadow-2xl shadow-black/80 rounded-3xl border border-indigo-900/60 backdrop-blur-xl">
          {isSuccess ? (
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Password Updated Successfully</h3>
                <p className="text-xs text-[#B3B8D4] leading-relaxed">
                  Your new password is now active. You can now sign in with your updated credentials.
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Strength Meter */}
              {newPassword.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-bold ${strengthLabel.text}`}>{strengthLabel.label}</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${strengthLabel.color} transition-all duration-300`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                    <div className={`flex items-center gap-1.5 ${passwordChecks.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordChecks.minLength ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                      <span>8+ characters</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                      <span>Uppercase letter</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                      <span>Lowercase letter</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                      <span>Number included</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
