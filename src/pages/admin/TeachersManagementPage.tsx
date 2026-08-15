import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Teacher, Class, Subject, TeacherAssignment } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  Plus,
  Search,
  BookOpen,
  Layers,
  Link as LinkIcon,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export const TeachersManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<Teacher | null>(null);

  // Add Teacher Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [designation, setDesignation] = useState('Professor');

  // Assignment Form
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');

  const loadData = () => {
    setTeachers(dataStore.getTeachers());
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
    setAssignments(dataStore.getTeacherAssignments());
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const name = t.profile?.full_name?.toLowerCase() || '';
    const empId = t.employee_id.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || empId.includes(searchQuery.toLowerCase());
  });

  const handleOpenAddModal = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setDepartment('Computer Science');
    setDesignation('Senior Lecturer');
    setIsAddModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !employeeId) {
      error('Please complete all required fields.');
      return;
    }
    dataStore.addTeacher({
      fullName,
      email,
      phone,
      employeeId,
      department,
      designation,
    });
    success(`Faculty member ${fullName} added successfully.`);
    setIsAddModalOpen(false);
  };

  const handleOpenAssignModal = (teacher: Teacher) => {
    setSelectedTeacherForAssign(teacher);
    setAssignClassId(classes[0]?.id || '');
    setAssignSubjectId(subjects[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAssign || !assignClassId || !assignSubjectId) return;

    dataStore.assignTeacherToClassSubject({
      teacherId: selectedTeacherForAssign.id,
      classId: assignClassId,
      subjectId: assignSubjectId,
      academicYear: '2025-2026',
      semester: 4,
    });

    success('Class & Subject assigned to faculty member.');
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Faculty Directory
            </span>
            <span className="text-xs text-slate-400">• {teachers.length} Active Faculty</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Teachers & Faculty Allocation
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Manage instructor records and assign classes and subjects authorized for attendance logging.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name or employee ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeachers.map(teacher => {
          const teacherAssigned = assignments.filter(a => a.teacher_id === teacher.id);
          const teacherName = teacher.profile?.full_name || 'Faculty';

          return (
            <div
              key={teacher.id}
              className="p-5 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${teacherName}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{teacherName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#8677FF] font-semibold">{teacher.designation}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-[#050816] px-1.5 py-0.5 rounded border border-white/5">
                          {teacher.employee_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {teacher.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4 p-3 rounded-2xl bg-[#050816]/70 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8677FF]" />
                    <span className="truncate">{teacher.profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#8677FF]" />
                    <span>{teacher.department}</span>
                  </div>
                </div>

                {/* Assigned Classes and Subjects */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-bold text-[#B3B8D4] uppercase tracking-wider">
                    Authorized Class & Subject Teaching Scope:
                  </div>
                  {teacherAssigned.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No assigned classes currently.</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {teacherAssigned.map(ta => (
                        <span
                          key={ta.id}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        >
                          <BookOpen className="w-3 h-3 text-[#8677FF]" />
                          <span>
                            {ta.class?.name || 'Class'} • {ta.subject?.code || 'Sub'}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleOpenAssignModal(teacher)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#6E63FF]/20 hover:bg-[#6E63FF] text-[#8677FF] hover:text-white border border-[#6E63FF]/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Assign Class & Subject</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Create faculty profile with institutional credentials"
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Dr. John von Neumann"
              className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. neumann@apextech.edu"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-CS-004"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
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
              Save Faculty
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Class Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Class & Subject Authorization"
        subtitle={`Grant attendance marking permissions to ${selectedTeacherForAssign?.profile?.full_name}`}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Class *</label>
            <select
              value={assignClassId}
              onChange={e => setAssignClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.department} (Sec {c.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Subject *</label>
            <select
              value={assignSubjectId}
              onChange={e => setAssignSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - Sem {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#050816] text-slate-300 text-xs font-semibold hover:bg-white/5 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6E63FF] hover:bg-[#8677FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
