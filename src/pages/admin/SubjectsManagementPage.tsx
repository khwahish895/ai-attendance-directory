import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Subject } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import { BookOpen, Plus, Search, Award } from 'lucide-react';

export const SubjectsManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [credits, setCredits] = useState(4);

  const load = () => {
    setSubjects(dataStore.getSubjects());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const filtered = subjects.filter(
    s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setName('');
    setCode('');
    setDepartment('Computer Science');
    setSemester(4);
    setCredits(4);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      error('Please complete subject name and code');
      return;
    }
    dataStore.addSubject({
      name,
      code,
      department,
      semester: Number(semester),
      credits: Number(credits),
    });
    success(`Subject ${name} (${code}) created.`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Curriculum & Courses
            </span>
            <span className="text-xs text-slate-400">• {subjects.length} Accredited Subjects</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Subjects & Course Catalog
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Manage curricular courses, subject codes, semester schedules, and credit hour allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sub => (
          <div
            key={sub.id}
            className="p-5 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-indigo-500/15 text-[#8677FF] border border-indigo-500/30">
                  {sub.code}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#050816] px-2 py-0.5 rounded-md border border-white/5">
                  Semester {sub.semester}
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight mb-1">{sub.name}</h3>
              <p className="text-xs text-[#B3B8D4]">{sub.department}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Award className="w-3.5 h-3.5 text-[#8677FF]" /> Credits:
              </span>
              <span className="font-bold font-mono text-white">{sub.credits} Units</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Subject to Catalog"
        subtitle="Define course title, institutional code, semester, and credit weighting"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Distributed Cloud Computing"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. CS405"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="12"
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
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
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
