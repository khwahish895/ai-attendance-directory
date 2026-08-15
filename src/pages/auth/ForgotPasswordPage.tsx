import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please provide your registered email address');
      return;
    }
    setIsSubmitted(true);
    success('Password reset instructions dispatched!', 'Check your inbox for a secure token link.');
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6E63FF] to-[#8677FF] flex items-center justify-center shadow-xl shadow-[#6E63FF]/40 border border-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Password Recovery
        </h2>
        <p className="mt-1 text-center text-xs text-[#B3B8D4]">
          Receive authentication reset instructions via your institutional email
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1035] py-8 px-6 sm:px-10 shadow-2xl shadow-black/80 rounded-3xl border border-indigo-900/50">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-[#B3B8D4] leading-relaxed">
                If an account matches <span className="text-white font-medium">{email}</span>, a secure one-time passcode has been sent.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#8677FF] font-semibold hover:underline mt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. admin@apextech.edu"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
              >
                Send Reset Passcode
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
