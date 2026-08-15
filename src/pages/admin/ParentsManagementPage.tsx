import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Parent, Student } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Users, Plus, Search, Mail, Phone, GraduationCap, Link2 } from 'lucide-react';

export const ParentsManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [address, setAddress] = useState('');

  const load = () => {
    setParents(dataStore.getParents());
    setStudents(dataStore.getStudents());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const filtered = parents.filter(p => {
    const name = p.profile?.full_name?.toLowerCase() || '';
    const email = p.profile?.email?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRelationship('Mother');
    setAddress('');
    setIsAddModalOpen(true);
  };

  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      error('Please complete Parent Name and Email');
      return;
    }
    dataStore.addParent({
      fullName,
      email,
      phone,
      relationship,
      address,
    });
    success(`Parent record for ${fullName} created.`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Guardian Directory
            </span>
            <span className="text-xs text-slate-400">• {parents.length} Registered Guardians</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Parents & Guardians
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Manage verified parent accounts, link student wards, and configure automated risk alert dispatches.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Parent Record</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(parent => {
          const linkedStudents = students.filter(s => s.parent_id === parent.id);
          const parentName = parent.profile?.full_name || 'Guardian';

          return (
            <div
              key={parent.id}
              className="p-5 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={parent.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${parentName}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{parentName}</h3>
                      <span className="text-xs text-[#8677FF] font-semibold">{parent.relationship}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-[#050816] px-2 py-0.5 rounded border border-white/5">
                    {parent.phone || 'No phone'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 mb-3 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8677FF]" />
                  <span>{parent.profile?.email}</span>
                </div>

                {/* Linked Wards */}
                <div className="p-3 rounded-2xl bg-[#050816]/70 border border-white/5">
                  <div className="text-[11px] font-bold text-[#B3B8D4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#8677FF]" />
                    <span>Linked Student Wards:</span>
                  </div>

                  {linkedStudents.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No students linked to this guardian yet.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {linkedStudents.map(student => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/5 border border-white/5"
                        >
                          <span className="font-semibold text-white">
                            {student.profile?.full_name} ({student.roll_number})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {student.class?.name || 'Class'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Parent Record"
        subtitle="Create guardian contact for student attendance notifications"
      >
        <form onSubmit={handleSaveParent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. eleanor.vance@example.com"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 304-9811"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#050816] text-slate-300 text-xs font-semibold hover:bg-white/5 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6E63FF] hover:bg-[#8677FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
            >
              Save Guardian
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
