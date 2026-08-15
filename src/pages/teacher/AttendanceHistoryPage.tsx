import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Attendance, Class, Subject, Student } from '../../types';
import { History, Calendar, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setAttendance(dataStore.getAttendance());
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
    setStudents(dataStore.getStudents());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return attendance.filter(a => {
      if (selectedClass !== 'all' && a.class_id !== selectedClass) return false;
      if (selectedSubject !== 'all' && a.subject_id !== selectedSubject) return false;
      if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;

      if (searchQuery) {
        const student = students.find(s => s.id === a.student_id);
        const name = student?.profile?.full_name?.toLowerCase() || '';
        const roll = student?.roll_number?.toLowerCase() || '';
        if (!name.includes(searchQuery.toLowerCase()) && !roll.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [attendance, selectedClass, selectedSubject, selectedStatus, searchQuery, students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Audit Logs
            </span>
            <span className="text-xs text-slate-400">• {attendance.length} Total Historical Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Log Archive
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Inspect all past session roll calls, timestamps, status distributions, and remarks.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student name or roll #..."
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
                {c.name}
              </option>
            ))}
          </select>

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
            <option value="late">Late Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching attendance logs found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map(item => {
                  const student = students.find(s => s.id === item.student_id);
                  const studentName = student?.profile?.full_name || 'Student';

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {item.attendance_date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{studentName}</div>
                        <div className="text-[10px] text-[#8677FF] font-mono">{student?.roll_number}</div>
                      </td>
                      <td className="py-3 px-4">{item.class?.name || 'Class'}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-indigo-300">{item.subject?.code}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : item.status === 'absent' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Late
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.remarks || '—'}</td>
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
