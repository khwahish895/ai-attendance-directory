import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Shield, Building2, Save, Key, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile information updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl flex items-center gap-4">
        <img
          src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id || 'profile'}`}
          alt="Avatar"
          className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.full_name || 'My Profile'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30 capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-5 text-xs">
        <h2 className="text-base font-bold text-white tracking-tight border-b border-white/5 pb-3">
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050816]/60 border border-white/5 text-slate-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Contact Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Assigned Department</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
