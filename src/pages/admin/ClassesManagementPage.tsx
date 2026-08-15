import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Class, Teacher } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Layers, Plus, Users, GraduationCap, Calendar, BookOpen } from 'lucide-react';

export const ClassesManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [section, setSection] = useState('A');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [classTeacherId, setClassTeacherId] = useState('');

  const load = () => {
    setClasses(dataStore.getClasses());
    setTeachers(dataStore.getTeachers());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setName('');
    setSection('A');
    setDepartment('Computer Science');
    setSemester(4);
    setAcademicYear('2025-2026');
    setClassTeacherId(teachers[0]?.id || '');
    setIsAddModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      error('Please specify class code name (e.g. CS-4B)');
      return;
    }
    dataStore.addClass({
      name,
      section,
      department,
      semester: Number(semester),
      academicYear,
      classTeacherId: classTeacherId || undefined,
    });
    success(`Class ${name} created successfully.`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Academic Structure
            </span>
            <span className="text-xs text-slate-400">• {classes.length} Active Cohorts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Classes & Cohort Management
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Configure academic classes, section divisions, and assign dedicated class advisors.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map(c => {
          return (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{c.name}</h3>
                    <div className="text-xs text-[#8677FF] font-semibold">
                      Section {c.section} • Semester {c.semester}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {c.department}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 my-4 p-3 rounded-2xl bg-[#050816]/70 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#8677FF]" /> Enrolled Students:
                    </span>
                    <span className="font-bold font-mono text-white">{c.student_count || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#8677FF]" /> Class Teacher:
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                      {c.class_teacher?.profile?.full_name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8677FF]" /> Academic Year:
                    </span>
                    <span className="font-mono text-slate-200">{c.academic_year}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Academic Class"
        subtitle="Define class name, section, department, and assign teacher advisor"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Class Code Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. CS-4B"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Section</label>
              <input
                type="text"
                required
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="e.g. B"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Class Teacher Advisor</label>
            <select
              value={classTeacherId}
              onChange={e => setClassTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
            >
              <option value="">No Advisor Assigned</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.profile?.full_name} ({t.employee_id})
                </option>
              ))}
            </select>
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
              Create Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
