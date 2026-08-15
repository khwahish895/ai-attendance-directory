import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { Student, Attendance, Subject, AttendanceSummary } from '../../types';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar as CalendarIcon,
  Download,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchDate, setSearchDate] = useState<string>('');

  const load = () => {
    const allStudents = dataStore.getStudents();
    const currentStudent = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
    if (currentStudent) {
      setStudent(currentStudent);

      const allLogs = dataStore.getAttendance();
      setAttendance(allLogs.filter(a => a.student_id === currentStudent.id));

      const allSummaries = dataStore.getAttendanceSummaries();
      setSummaries(allSummaries.filter(s => s.student_id === currentStudent.id));

      setSubjects(dataStore.getSubjects());
    }
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, [user]);

  const filteredLogs = useMemo(() => {
    return attendance.filter(log => {
      if (selectedSubject !== 'all' && log.subject_id !== selectedSubject) return false;
      if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
      if (searchDate && !log.attendance_date.includes(searchDate)) return false;
      return true;
    });
  }, [attendance, selectedSubject, selectedStatus, searchDate]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast('No logs to export', 'error');
      return;
    }
    const headers = ['Date', 'Subject Code', 'Subject Name', 'Status', 'Remarks'];
    const rows = filteredLogs.map(l => {
      const sub = subjects.find(s => s.id === l.subject_id);
      return [
        l.attendance_date,
        sub?.code || '',
        `"${sub?.name || ''}"`,
        l.status,
        `"${l.remarks || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${student?.roll_number || 'student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported as CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Personal Attendance Archive
            </span>
            <span className="text-xs text-slate-400">• {attendance.length} Total Sessions Recorded</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Comprehensive Attendance Log
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Review all subject roll calls, verify presence stamps, and export your personal log records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-2xl bg-[#050816] hover:bg-white/5 border border-indigo-900/60 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-[#8677FF]" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Course Summaries Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map(s => {
          const sub = subjects.find(sub => sub.id === s.subject_id);
          const isWarning = s.attendance_percentage < 75;

          return (
            <div
              key={s.id}
              className={`p-4 rounded-2xl bg-[#0B1035] border transition-all ${
                isWarning ? 'border-rose-500/30' : 'border-indigo-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-[#8677FF] font-bold">{sub?.code}</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    isWarning ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {s.attendance_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="font-bold text-white text-xs truncate mb-2">{sub?.name}</div>

              <AttendanceProgress percentage={s.attendance_percentage} size="sm" showLabel={false} />

              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>{s.present_classes} Present</span>
                <span>{s.absent_classes} Absent</span>
                <span>{s.total_classes} Total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>

        <div className="relative w-full md:w-56">
          <input
            type="text"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            placeholder="Filter by Date (YYYY-MM-DD)..."
            className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No matching attendance logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const subject = subjects.find(s => s.id === log.subject_id);

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-200">{log.attendance_date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{subject?.name}</div>
                        <div className="text-[10px] text-[#8677FF] font-mono">{subject?.code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">Prof. Faculty Staff</td>
                      <td className="py-3 px-4 text-center">
                        {log.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{log.remarks || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
