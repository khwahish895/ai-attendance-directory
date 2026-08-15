import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Student, RiskAssessment, Class, Subject } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  Filter,
  Users,
  ShieldAlert,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  ArrowUpDown,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Info
} from 'lucide-react';
import { riskService } from '../../services/riskService';
import { useToast } from '../../contexts/ToastContext';

export const TeacherStudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const load = () => {
    setStudents(dataStore.getStudents());
    setRiskAssessments(dataStore.getRiskAssessments());
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const studentsWithRisk = useMemo(() => {
    return students.map(student => {
      const risk = riskAssessments.find(r => r.student_id === student.id);
      return {
        student,
        risk,
        attendancePercent: risk ? risk.attendance_percentage : 0,
        riskLevel: risk ? risk.risk_level : 'LOW',
      };
    });
  }, [students, riskAssessments]);

  const filtered = useMemo(() => {
    return studentsWithRisk.filter(item => {
      if (selectedClass !== 'all' && item.student.class_id !== selectedClass) return false;
      if (selectedRisk !== 'all' && item.riskLevel !== selectedRisk) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = item.student.profile?.full_name?.toLowerCase() || '';
        const roll = item.student.roll_number.toLowerCase();
        const dept = item.student.department.toLowerCase();
        if (!name.includes(query) && !roll.includes(query) && !dept.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [studentsWithRisk, selectedClass, selectedRisk, searchQuery]);

  const handleRecalculateRisk = (studentId: string) => {
    const assessment = riskService.calculateStudentRisk(studentId);
    riskService.saveRiskAssessment(assessment);
    showToast('Risk assessment updated with latest session logs', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Class Roster & Early Warning
            </span>
            <span className="text-xs text-slate-400">• {students.length} Total Enrolled</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Student Attendance & Risk Diagnostics
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Monitor individual attendance trends, identify students falling below statutory thresholds, and trigger interventions.
          </p>
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
            placeholder="Search student by name, roll # or branch..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
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
            <option value="HIGH">High Risk (&lt;75%)</option>
            <option value="MEDIUM">Medium Risk (75-84%)</option>
            <option value="LOW">Low Risk (85%+)</option>
          </select>
        </div>
      </div>

      {/* Student List Cards / Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class & Dept</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4">Consecutive Misses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(({ student, risk, attendancePercent, riskLevel }) => {
                  const studentClass = classes.find(c => c.id === student.class_id);

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.roll_number}`}
                            alt="Avatar"
                            className="w-9 h-9 rounded-xl object-cover bg-indigo-950 border border-white/10"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">
                              {student.profile?.full_name}
                            </div>
                            <div className="text-[11px] text-[#8677FF] font-mono">
                              {student.roll_number}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{studentClass?.name || 'Class'}</div>
                        <div className="text-[10px] text-slate-400">{student.department} • Sem {student.semester}</div>
                      </td>

                      <td className="py-3.5 px-4 w-44">
                        <AttendanceProgress percentage={attendancePercent} size="sm" showLabel={true} />
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge level={riskLevel} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {risk && risk.consecutive_absences > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 text-[11px]">
                            <TrendingDown className="w-3 h-3" /> {risk.consecutive_absences} classes
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#6E63FF]/20 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                          >
                            View Diagnostic
                          </button>

                          <button
                            onClick={() => handleRecalculateRisk(student.id)}
                            title="Recalculate Risk Score"
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#8677FF] transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
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

      {/* Student Diagnostic Modal */}
      {selectedStudent && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Attendance Diagnostic • ${selectedStudent.profile?.full_name}`}
        >
          {(() => {
            const risk = riskAssessments.find(r => r.student_id === selectedStudent.id);
            const studentClass = classes.find(c => c.id === selectedStudent.class_id);
            const parent = selectedStudent.parent;

            return (
              <div className="space-y-5 text-xs">
                {/* Top overview card */}
                <div className="p-4 rounded-2xl bg-[#050816] border border-indigo-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudent.roll_number}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{selectedStudent.profile?.full_name}</div>
                      <div className="text-xs text-[#8677FF] font-mono">{selectedStudent.roll_number}</div>
                      <div className="text-[11px] text-slate-400">
                        {studentClass?.name} • {selectedStudent.department}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Risk Tier</div>
                    <RiskBadge level={risk ? risk.risk_level : 'LOW'} />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#050816] border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {risk ? `${risk.attendance_percentage.toFixed(1)}%` : '0%'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#050816] border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Consecutive Misses</div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                      {risk ? risk.consecutive_absences : 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#050816] border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Score</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                      {risk ? `${risk.risk_score} / 100` : '0 / 100'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#050816] border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Forecast (30d)</div>
                    <div className="text-lg font-bold text-[#8677FF] font-mono mt-0.5">
                      {risk ? `${risk.predicted_attendance.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                </div>

                {/* Risk Reasons */}
                {risk && risk.reasons && risk.reasons.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Identified Risk Factors</span>
                    </div>
                    <ul className="space-y-1 pl-5 list-disc text-rose-200/90 text-xs">
                      {risk.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parent Contact Information */}
                <div className="p-4 rounded-2xl bg-[#050816] border border-indigo-900/60 space-y-3">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#8677FF]" />
                    <span>Parent / Guardian Contact</span>
                  </div>

                  {parent && parent.profile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Guardian Name ({parent.relationship})</div>
                        <div className="font-semibold text-white">{parent.profile.full_name}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Email Address</div>
                        <div className="font-semibold text-slate-200">{parent.profile.email}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Phone Number</div>
                        <div className="font-semibold text-slate-200">{parent.profile.phone || '+1 (555) 019-2834'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">No linked guardian contact recorded.</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      showToast(`Intervention notice queued for ${selectedStudent.profile?.full_name}`, 'success');
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#6E63FF]/30 cursor-pointer"
                  >
                    Send Early Warning Alert
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
