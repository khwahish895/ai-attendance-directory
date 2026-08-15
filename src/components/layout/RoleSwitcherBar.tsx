import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Shield, UserCheck, GraduationCap, Users, Sparkles } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { role, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string; path: string }[] = [
    { role: 'super_admin', label: 'Super Admin', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', path: '/super-admin' },
    { role: 'administrator', label: 'Administrator', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', path: '/admin' },
    { role: 'teacher', label: 'Teacher', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', path: '/teacher' },
    { role: 'student', label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', path: '/student' },
    { role: 'parent', label: 'Parent', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', path: '/parent' },
  ];

  const handleRoleSelect = (targetRole: UserRole, path: string) => {
    loginAsRole(targetRole);
    navigate(path);
  };

  return (
    <div className="bg-[#050816] border-b border-indigo-950/80 px-4 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto">
      <div className="flex items-center gap-2 text-slate-400 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-[#8677FF]" />
        <span className="font-semibold text-slate-300 hidden sm:inline">Role Simulator:</span>
        <span className="text-[11px] text-slate-400">Switch role view instantly:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {roles.map(r => {
          const isActive = role === r.role;
          return (
            <button
              key={r.role}
              onClick={() => handleRoleSelect(r.role, r.path)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isActive
                  ? `${r.color} shadow-md shadow-[#6E63FF]/20 ring-1 ring-white/20`
                  : 'bg-[#0B1035] text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
