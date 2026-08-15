import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Institution } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import {
  Building2,
  Users,
  ShieldCheck,
  Cpu,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Server,
  Layers
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const SuperAdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInst, setNewInst] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    contact_email: '',
    student_count: 500,
  });

  const load = () => {
    setInstitutions(dataStore.getInstitutions());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const totalStudentsAcrossTenants = institutions.reduce((acc, curr) => acc + (curr.student_count || 0), 0);

  const filtered = institutions.filter(inst => {
    const q = searchQuery.toLowerCase();
    return inst.name.toLowerCase().includes(q) || inst.code.toLowerCase().includes(q) || inst.city.toLowerCase().includes(q);
  });

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.name || !newInst.code) {
      showToast('Please provide institution name and code', 'error');
      return;
    }

    const created: Institution = {
      id: 'inst-' + Date.now(),
      name: newInst.name,
      code: newInst.code.toUpperCase(),
      city: newInst.city || 'Metropolis',
      state: newInst.state || 'CA',
      contact_email: newInst.contact_email || 'admin@edu.org',
      student_count: Number(newInst.student_count) || 500,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    dataStore.addInstitution(created);
    showToast(`Institution "${created.name}" provisioned successfully`, 'success');
    setShowAddModal(false);
    setNewInst({
      name: '',
      code: '',
      city: '',
      state: '',
      contact_email: '',
      student_count: 500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400">• Multi-Tenant University Cloud</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Institutional Tenants & Cloud Fleet Management
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Monitor deployed university clusters, aggregate active student counts, and provision new campus tenants.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard University Tenant</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campuses"
          value={institutions.length}
          subtitle="Provisioned tenants"
          icon={Building2}
          glowColor="purple"
        />

        <StatCard
          title="Total Managed Students"
          value={totalStudentsAcrossTenants.toLocaleString()}
          subtitle="Across all university instances"
          icon={Users}
          glowColor="blue"
        />

        <StatCard
          title="Prediction Engine Uptime"
          value="99.98%"
          subtitle="ML model inference node online"
          icon={Cpu}
          glowColor="emerald"
        />

        <StatCard
          title="System Health"
          value="Optimal"
          subtitle="0 sync latency delays"
          icon={Server}
          glowColor="emerald"
        />
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search university by name, code or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Campus / University</th>
                <th className="py-3 px-4">Tenant Code</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Contact Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(inst => (
                <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-[#8677FF] flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-white text-xs">{inst.name}</div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#8677FF]">
                    {inst.code}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {inst.city}, {inst.state}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    {inst.student_count.toLocaleString()} students
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active Cluster
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {inst.contact_email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Institution Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Onboard New Educational Institution Tenant"
      >
        <form onSubmit={handleAddInstitution} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Institution Full Name *</label>
            <input
              type="text"
              required
              value={newInst.name}
              onChange={e => setNewInst({ ...newInst, name: e.target.value })}
              placeholder="e.g. Stanford Polytechnic Institute"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tenant Code *</label>
              <input
                type="text"
                required
                value={newInst.code}
                onChange={e => setNewInst({ ...newInst, code: e.target.value })}
                placeholder="e.g. SPI-01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white uppercase font-mono focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Student Capacity</label>
              <input
                type="number"
                value={newInst.student_count}
                onChange={e => setNewInst({ ...newInst, student_count: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">City</label>
              <input
                type="text"
                value={newInst.city}
                onChange={e => setNewInst({ ...newInst, city: e.target.value })}
                placeholder="City"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">State / Province</label>
              <input
                type="text"
                value={newInst.state}
                onChange={e => setNewInst({ ...newInst, state: e.target.value })}
                placeholder="State"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Primary Administrator Email</label>
            <input
              type="email"
              value={newInst.contact_email}
              onChange={e => setNewInst({ ...newInst, contact_email: e.target.value })}
              placeholder="admin@institution.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono focus:outline-none focus:border-[#6E63FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white font-bold shadow-lg shadow-[#6E63FF]/30 cursor-pointer"
            >
              Deploy University Cluster
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
