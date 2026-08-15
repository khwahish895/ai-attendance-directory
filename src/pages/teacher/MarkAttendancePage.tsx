import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataStore } from '../../lib/dataProvider';
import { Class, Subject, Student, RiskAssessment } from '../../types';
import { PredictionResult } from '../../services/predictionService';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  CalendarCheck2,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Save,
  Clock,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export const MarkAttendancePage: React.FC = () => {
  const { user, role } = useAuth();
  const { success, error, info } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  // Selection form
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance Status Map: studentId -> 'present' | 'absent' | 'late' | 'excused'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const cls = dataStore.getClasses();
    const subs = dataStore.getSubjects();
    const stus = dataStore.getStudents();
    const risks = dataStore.getRiskAssessments();

    setClasses(cls);
    setSubjects(subs);
    setStudents(stus);
    setRiskAssessments(risks);

    if (cls.length > 0 && !selectedClassId) {
      setSelectedClassId(cls[0].id);
    }
    if (subs.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subs[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, []);

  // Filter students by selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.class_id === selectedClassId);
  }, [students, selectedClassId]);

  // When class, subject, or date changes, check if attendance was already recorded
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || !selectedDate) return;

    const existing = dataStore.getAttendance({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      date: selectedDate,
    });

    const newMap: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    const newRemarks: Record<string, string> = {};

    if (existing.length > 0) {
      setIsExistingRecord(true);
      existing.forEach(rec => {
        newMap[rec.student_id] = rec.status;
        if (rec.remarks) newRemarks[rec.student_id] = rec.remarks;
      });
      info('Loaded existing attendance records for this session.');
    } else {
      setIsExistingRecord(false);
      // Default all enrolled students to 'present'
      classStudents.forEach(s => {
        newMap[s.id] = 'present';
      });
    }

    setAttendanceMap(newMap);
    setRemarksMap(newRemarks);
  }, [selectedClassId, selectedSubjectId, selectedDate, classStudents.length]);

  // Search filtered class students
  const filteredClassStudents = useMemo(() => {
    return classStudents.filter(s => {
      const name = s.profile?.full_name?.toLowerCase() || '';
      const roll = s.roll_number.toLowerCase();
      return name.includes(searchFilter.toLowerCase()) || roll.includes(searchFilter.toLowerCase());
    });
  }, [classStudents, searchFilter]);

  // Bulk actions
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceMap };
    classStudents.forEach(s => {
      updated[s.id] = 'present';
    });
    setAttendanceMap(updated);
    success('Marked all enrolled students as Present');
  };

  const handleMarkAllAbsent = () => {
    const updated = { ...attendanceMap };
    classStudents.forEach(s => {
      updated[s.id] = 'absent';
    });
    setAttendanceMap(updated);
    info('Marked all enrolled students as Absent');
  };

  const handleToggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId || !selectedDate) {
      error('Please select class, subject, and date.');
      return;
    }

    if (classStudents.length === 0) {
      error('No students enrolled in this class to record attendance.');
      return;
    }

    setIsSubmitting(true);

    const records = classStudents.map(s => ({
      studentId: s.id,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      date: selectedDate,
      status: attendanceMap[s.id] || 'present',
      recordedBy: user?.id,
      remarks: remarksMap[s.id] || undefined,
    }));

    try {
      dataStore.markAttendanceBatch(records);
      success(
        isExistingRecord ? 'Attendance updated successfully!' : 'Attendance recorded successfully!',
        `Logged for ${records.length} students. Analytics, risk scores, and forecasts recalculated.`
      );
      setIsExistingRecord(true);
    } catch (err: any) {
      error('Failed to submit attendance: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Counts for current session
  const totalEnrolled = classStudents.length;
  const presentCount = Object.values(attendanceMap).filter(v => v === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter(v => v === 'late').length;
  const currentSessionPct = totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Faculty Portal
            </span>
            <span className="text-xs text-slate-400">• Daily Roll Call Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Log & Mark Attendance
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Select class cohort and course session to record attendance with real-time risk diagnostic preview.
          </p>
        </div>

        {isExistingRecord && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Editing recorded session</span>
          </div>
        )}
      </div>

      {/* Selection Control Panel */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-[#8677FF]" />
          <span>Session Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#8677FF]" />
              <span>Target Class *</span>
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs font-semibold focus:outline-none focus:border-[#6E63FF]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.department} - Sec {c.section})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8677FF]" />
              <span>Curricular Subject *</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs font-semibold focus:outline-none focus:border-[#6E63FF]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - Sem {s.semester}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8677FF]" />
              <span>Session Date *</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs font-semibold focus:outline-none focus:border-[#6E63FF]"
            />
          </div>
        </div>

        {/* Live Session Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Enrolled:</span>
              <span className="font-bold font-mono text-white">{totalEnrolled}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">Present:</span>
              <span className="font-bold font-mono text-emerald-400">{presentCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-semibold">Absent:</span>
              <span className="font-bold font-mono text-rose-400">{absentCount}</span>
            </div>
            {lateCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-semibold">Late:</span>
                <span className="font-bold font-mono text-amber-400">{lateCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Session Rate:</span>
              <span className="font-bold font-mono text-[#8677FF]">{currentSessionPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAllAbsent}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List with Roll Call Controls */}
      <form onSubmit={handleSubmitAttendance} className="space-y-4">
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Class Student Roster & Live Risk Indicators
              </h3>
              <p className="text-xs text-[#B3B8D4]">
                Toggle individual attendance statuses. Notice the calculated risk badges and statistical forecast values.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search student in class..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
                <tr>
                  <th className="py-3 px-4">Roll / Student</th>
                  <th className="py-3 px-4 min-w-[130px]">Overall Attendance %</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Projected %</th>
                  <th className="py-3 px-4">Consecutive Misses</th>
                  <th className="py-3 px-4 text-center">Session Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClassStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No students enrolled in this class.
                    </td>
                  </tr>
                ) : (
                  filteredClassStudents.map(student => {
                    const studentName = student.profile?.full_name || 'Student';
                    const risk = riskAssessments.find(r => r.student_id === student.id);
                    const pred = dataStore.getPredictionForStudent(student.id);
                    const currentStatus = attendanceMap[student.id] || 'present';

                    return (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`}
                              alt="Avatar"
                              className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white tracking-tight">{studentName}</div>
                              <div className="text-[11px] text-[#8677FF] font-mono">{student.roll_number}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <AttendanceProgress
                            percentage={risk?.attendance_percentage || 0}
                            height="sm"
                            showLabels={true}
                          />
                        </td>

                        <td className="py-3 px-4">
                          <RiskBadge
                            level={risk?.risk_level || 'LOW'}
                            score={risk?.risk_score}
                            showScore={true}
                            size="sm"
                          />
                        </td>

                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={pred && pred.predicted_attendance < 75 ? 'text-rose-400' : 'text-slate-300'}>
                            {pred ? `${pred.predicted_attendance.toFixed(1)}%` : '—'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {risk?.consecutive_absences && risk.consecutive_absences >= 3 ? (
                            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                              {risk.consecutive_absences} missed
                            </span>
                          ) : risk?.consecutive_absences ? (
                            <span className="text-amber-400">{risk.consecutive_absences}</span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student.id, 'present')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'bg-[#050816] text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student.id, 'absent')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                  : 'bg-[#050816] text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student.id, 'late')}
                              className={`px-2.5 py-1.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                  : 'bg-[#050816] text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              <span>Late</span>
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

        {/* Submit Bottom Bar */}
        <div className="p-4 rounded-3xl bg-[#0B1035] border border-indigo-900/50 flex items-center justify-between gap-4">
          <div className="text-xs text-[#B3B8D4] hidden sm:block">
            Submitting will log attendance records, recalculate statistical forecast models, and update risk flags.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isSubmitting || filteredClassStudents.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-xl shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Records...' : isExistingRecord ? 'Update Session Attendance' : 'Submit Class Attendance'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
