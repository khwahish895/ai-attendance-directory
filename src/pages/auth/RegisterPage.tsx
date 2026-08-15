import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AppLogo } from '../../components/auth/AppLogo';
import { dataStore } from '../../lib/dataProvider';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Hash,
  Building2,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student specific fields
  const [studentId, setStudentId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState<number>(4);
  const [classId, setClassId] = useState('cls-1');

  // Parent specific fields
  const [relationship, setRelationship] = useState<'Father' | 'Mother' | 'Guardian'>('Mother');
  const [wardRollNumber, setWardRollNumber] = useState('');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<'student' | 'parent'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerStudent, registerParent } = useAuth();
  const { success, error: showToastError } = useToast();
  const navigate = useNavigate();

  // Password rules validation
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      matchesConfirm: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

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
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  }, [strengthScore]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full legal name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!phone.trim()) errs.phone = 'Contact phone number is required.';

    if (!password) {
      errs.password = 'Password is required.';
    } else if (
      !passwordChecks.minLength ||
      !passwordChecks.hasUpper ||
      !passwordChecks.hasLower ||
      !passwordChecks.hasNumber
    ) {
      errs.password = 'Password does not satisfy all security criteria.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (activeTab === 'student') {
      if (!studentId.trim()) errs.studentId = 'Student ID is required.';
      if (!rollNumber.trim()) errs.rollNumber = 'Academic Roll Number is required.';
    } else {
      if (!wardRollNumber.trim()) {
        errs.wardRollNumber = 'Ward Student ID / Roll Number is required for guardian linking.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToastError('Please review and correct the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    let res: { success: boolean; error?: string };

    if (activeTab === 'student') {
      res = await registerStudent({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        studentId: studentId.trim(),
        rollNumber: rollNumber.trim(),
        department,
        classId,
        semester,
      });
      setRegisteredRole('student');
    } else {
      res = await registerParent({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        relationship,
        wardRollNumber: wardRollNumber.trim(),
      });
      setRegisteredRole('parent');
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      success('Account registered successfully! Please proceed to login.');
    } else {
      showToastError(res.error || 'Registration failed.');
      setErrors({ ...errors, general: res.error || 'Registration failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-[#6E63FF]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#8677FF]/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto relative z-10 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <AppLogo size="md" showGlow={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-[#B3B8D4]">
            Join the intelligent student attendance platform.
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="bg-[#0B1035] p-8 sm:p-10 rounded-3xl border border-emerald-500/40 shadow-2xl shadow-black/90 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Account Created Successfully
              </h2>
              <p className="text-sm text-emerald-300 font-semibold">
                Please verify your email to continue.
              </p>
              <p className="text-xs text-[#B3B8D4] max-w-md mx-auto leading-relaxed">
                An activation link has been prepared for <span className="text-white font-mono font-bold">{email}</span>. Your {registeredRole === 'student' ? 'Student profile' : 'Guardian account'} has been registered into the Apex Institute academic roster.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Registration Card */
          <div className="bg-[#0B1035] p-6 sm:p-8 md:p-10 rounded-3xl border border-indigo-900/60 shadow-2xl shadow-black/90 backdrop-blur-xl space-y-6">
            {/* Role Selection Tabs */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Your Registration Category:</span>
                <span className="text-[10px] text-[#8677FF] font-mono font-normal">Self-Service Portal</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#050816] border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('student')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-gradient-to-r from-[#6E63FF] to-[#8677FF] text-white shadow-lg shadow-[#6E63FF]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Registration</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'parent'
                      ? 'bg-gradient-to-r from-[#6E63FF] to-[#8677FF] text-white shadow-lg shadow-[#6E63FF]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Parent / Guardian</span>
                </button>
              </div>
            </div>

            {/* Role Administrative Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#8677FF] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#B3B8D4] leading-relaxed">
                <span className="font-bold text-white">Faculty & Administrative Policy</span>: Teacher, Department Admin, and Super Admin accounts are provisioned exclusively by Institutional IT Administrators.
              </p>
            </div>

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-[11px] text-rose-400">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. jordan.hayes@apextech.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Role-Specific Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0142"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[11px] text-rose-400">{errors.phone}</p>}
                </div>

                {activeTab === 'student' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Student ID Code *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="e.g. STU-2026-089"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                      />
                    </div>
                    {errors.studentId && <p className="mt-1 text-[11px] text-rose-400">{errors.studentId}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Relationship to Student *
                    </label>
                    <select
                      value={relationship}
                      onChange={e => setRelationship(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] text-white text-xs border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Legal Guardian</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Student Extra: Roll Number, Department, Semester */}
              {activeTab === 'student' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={e => setRollNumber(e.target.value)}
                      placeholder="e.g. CS-2024-042"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                    {errors.rollNumber && <p className="mt-1 text-[11px] text-rose-400">{errors.rollNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Academic Department
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] text-white text-xs border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Comm">Electronics & Comm</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Current Semester
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] text-white text-xs border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* Parent Extra: Ward Roll Number Linking */
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Ward Student ID / Roll Number Link *</span>
                    <span className="text-[10px] text-[#8677FF] font-mono">Secure Verification Code</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={wardRollNumber}
                      onChange={e => setWardRollNumber(e.target.value)}
                      placeholder="e.g. CS-2024-001 or STU-001"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                  </div>
                  {errors.wardRollNumber && (
                    <p className="mt-1 text-[11px] text-rose-400">{errors.wardRollNumber}</p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-400">
                    To prevent unauthorized access, parent linking requires the verified student roll number or institutional invitation token.
                  </p>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create strong password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] text-rose-400">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050816] text-white text-xs placeholder:text-slate-500 border border-indigo-900/60 focus:border-[#6E63FF] focus:outline-none"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-[11px] text-rose-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Strength Meter & Interactive Checklist */}
              {password.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 space-y-2.5 animate-fadeIn">
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

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
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
                      <span>At least one number</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/35 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Account & Roster Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create {activeTab === 'student' ? 'Student' : 'Parent'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="pt-4 border-t border-white/10 text-center text-xs text-[#B3B8D4]">
              Already have an institutional account?{' '}
              <Link
                to="/login"
                className="text-[#8677FF] font-bold hover:text-white hover:underline transition-colors ml-1"
              >
                Sign In Here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
