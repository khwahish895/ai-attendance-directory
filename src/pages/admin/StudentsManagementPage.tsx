import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '../../lib/dataProvider';
import { Student, Class, Parent, RiskAssessment } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { downloadCSV } from '../../services/reportService';

export const StudentsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formSemester, setFormSemester] = useState(4);
  const [formParentId, setFormParentId] = useState('');

  const loadData = () => {
    setStudents(dataStore.getStudents());
    setClasses(dataStore.getClasses());
    setParents(dataStore.getParents());
    setRiskAssessments(dataStore.getRiskAssessments());
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const name = s.profile?.full_name?.toLowerCase() || '';
      const roll = s.roll_number?.toLowerCase() || '';
      const email = s.profile?.email?.toLowerCase() || '';
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || roll.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedClass !== 'all' && s.class_id !== selectedClass) return false;

      if (selectedRisk !== 'all') {
        const risk = riskAssessments.find(r => r.student_id === s.id);
        if (risk?.risk_level !== selectedRisk) return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedClass, selectedRisk, riskAssessments]);

  const handleOpenAddModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormRollNumber(`CS-${Math.floor(100 + Math.random() * 900)}`);
    setFormStudentId(`STU-2024-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormClassId(classes[0]?.id || 'cls-1');
    setFormDepartment('Computer Science');
    setFormSemester(4);
    setFormParentId('');
    setIsAddModalOpen(true);
  };

  const handleSaveAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail || !formRollNumber) {
      error('Please complete required fields (Full Name, Email, Roll Number)');
      return;
    }

    try {
      dataStore.addStudent({
        fullName: formFullName,
        email: formEmail,
        phone: formPhone,
        rollNumber: formRollNumber,
        studentId: formStudentId,
        classId: formClassId,
        department: formDepartment,
        semester: Number(formSemester),
        parentId: formParentId || undefined,
      });
      success(`Enrolled student ${formFullName} successfully!`);
      setIsAddModalOpen(false);
    } catch (err: any) {
      error('Failed to create student: ' + err.message);
    }
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormFullName(student.profile?.full_name || '');
    setFormEmail(student.profile?.email || '');
    setFormPhone(student.profile?.phone || '');
    setFormRollNumber(student.roll_number);
    setFormClassId(student.class_id);
    setFormDepartment(student.department);
    setFormSemester(student.semester);
    setFormParentId(student.parent_id || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      dataStore.updateStudent(editingStudent.id, {
        fullName: formFullName,
        email: formEmail,
        phone: formPhone,
        roll_number: formRollNumber,
        class_id: formClassId,
        department: formDepartment,
        semester: Number(formSemester),
        parent_id: formParentId || undefined,
      });
      success(`Updated student ${formFullName}`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      error('Failed to update student: ' + err.message);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    const studentName = student.profile?.full_name || student.roll_number;
    if (window.confirm(`Are you sure you want to remove ${studentName} from the database? All attendance logs will be purged.`)) {
      dataStore.deleteStudent(student.id);
      success(`Removed ${studentName} from database.`);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredStudents.map(s => {
      const risk = riskAssessments.find(r => r.student_id === s.id);
      return {
        'Roll Number': s.roll_number,
        'Student ID': s.student_id,
        'Full Name': s.profile?.full_name || '',
        'Email': s.profile?.email || '',
        'Class': s.class?.name || '',
        'Department': s.department,
        'Semester': s.semester,
        'Attendance %': risk?.attendance_percentage || 0,
        'Risk Level': risk?.risk_level || 'LOW',
        'Risk Score': risk?.risk_score || 0,
        'Consecutive Absences': risk?.consecutive_absences || 0,
      };
    });
    downloadCSV('students_directory', rows);
    info('Exported student roster to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Student Directory
            </span>
            <span className="text-xs text-slate-400">• {students.length} Enrolled Students</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Students & Enrollment Management
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Manage student records, assign classes and parents, and inspect individual attendance risk logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#050816] hover:bg-white/5 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll #, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.department})
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk (&lt; 75%)</option>
            <option value="MEDIUM">Medium Risk (75–85%)</option>
            <option value="LOW">Low Risk (&gt;= 85%)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class / Dept</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 min-w-[150px]">Attendance %</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4">Consecutive Misses</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching students found with current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const studentName = student.profile?.full_name || 'Student';
                  const risk = riskAssessments.find(r => r.student_id === student.id);

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`}
                            alt="Avatar"
                            className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white tracking-tight">{studentName}</div>
                            <div className="text-[11px] text-[#8677FF] font-mono">{student.roll_number}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{student.class?.name || 'Class CS-4A'}</div>
                        <div className="text-[10px] text-slate-400">{student.department} (Sem {student.semester})</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 truncate max-w-[160px]">{student.profile?.email}</div>
                        <div className="text-[10px] text-slate-500">{student.profile?.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <AttendanceProgress
                          percentage={risk?.attendance_percentage || 0}
                          height="sm"
                          showLabels={true}
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge
                          level={risk?.risk_level || 'LOW'}
                          score={risk?.risk_score}
                          showScore={true}
                          size="sm"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {risk?.consecutive_absences ? (
                          <span className={risk.consecutive_absences >= 3 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                            {risk.consecutive_absences} missed
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/student-profile/${student.id}`)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
                            title="View Full Profile & Analytics"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Student Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Deactivate / Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student"
        subtitle="Create student profile, assign class, and initialize baseline attendance analytics"
      >
        <form onSubmit={handleSaveAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formFullName}
                onChange={e => setFormFullName(e.target.value)}
                placeholder="e.g. Samuel Green"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="e.g. samuel.green@apextech.edu"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={formRollNumber}
                onChange={e => setFormRollNumber(e.target.value)}
                placeholder="e.g. CS-109"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student ID *</label>
              <input
                type="text"
                required
                value={formStudentId}
                onChange={e => setFormStudentId(e.target.value)}
                placeholder="e.g. STU-2024-0109"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assign Class *</label>
              <select
                value={formClassId}
                onChange={e => setFormClassId(e.target.value)}
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={formDepartment}
                onChange={e => setFormDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Link Parent / Guardian</label>
              <select
                value={formParentId}
                onChange={e => setFormParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              >
                <option value="">No Parent Linked</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.profile?.full_name} ({p.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#050816] text-slate-300 text-xs font-semibold hover:bg-white/5 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6E63FF] hover:bg-[#8677FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Information"
        subtitle={`Updating details for ${editingStudent?.profile?.full_name || editingStudent?.roll_number}`}
      >
        <form onSubmit={handleSaveEditStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formFullName}
                onChange={e => setFormFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={formRollNumber}
                onChange={e => setFormRollNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Class *</label>
              <select
                value={formClassId}
                onChange={e => setFormClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.department} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Parent / Guardian Link</label>
              <select
                value={formParentId}
                onChange={e => setFormParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              >
                <option value="">No Parent Linked</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.profile?.full_name} ({p.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#050816] text-slate-300 text-xs font-semibold hover:bg-white/5 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6E63FF] hover:bg-[#8677FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
            >
              Update Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
