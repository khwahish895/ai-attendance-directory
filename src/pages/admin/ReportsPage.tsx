import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Student, Class, Subject, RiskAssessment, AttendanceSummary } from '../../types';
import { reportService } from '../../services/reportService';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, eligible, ineligible
  const [searchQuery, setSearchQuery] = useState<string>('');

  const load = () => {
    setStudents(dataStore.getStudents());
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
    setRiskAssessments(dataStore.getRiskAssessments());
    setSummaries(dataStore.getAttendanceSummaries());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const reportData = useMemo(() => {
    return students.map(student => {
      const risk = riskAssessments.find(r => r.student_id === student.id);
      const studentClass = classes.find(c => c.id === student.class_id);
      const attendancePercent = risk ? risk.attendance_percentage : 0;
      const isEligible = attendancePercent >= 75;

      return {
        student,
        studentClass,
        risk,
        attendancePercent,
        isEligible,
      };
    });
  }, [students, riskAssessments, classes]);

  const filtered = useMemo(() => {
    return reportData.filter(item => {
      if (selectedClass !== 'all' && item.student.class_id !== selectedClass) return false;
      if (selectedStatus === 'eligible' && !item.isEligible) return false;
      if (selectedStatus === 'ineligible' && item.isEligible) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = item.student.profile?.full_name?.toLowerCase() || '';
        const roll = item.student.roll_number.toLowerCase();
        if (!name.includes(q) && !roll.includes(q)) return false;
      }
      return true;
    });
  }, [reportData, selectedClass, selectedStatus, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Class',
      'Department',
      'Attendance Percentage',
      'Risk Level',
      'Consecutive Misses',
      'Exam Eligibility (>=75%)',
    ];

    const rows = filtered.map(item => [
      item.student.roll_number,
      `"${item.student.profile?.full_name || ''}"`,
      `"${item.studentClass?.name || ''}"`,
      `"${item.student.department}"`,
      item.attendancePercent.toFixed(1) + '%',
      item.risk?.risk_level || 'LOW',
      item.risk?.consecutive_absences || 0,
      item.isEligible ? 'ELIGIBLE' : 'DEBARRED / INELIGIBLE',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Semester_Attendance_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comprehensive report exported as CSV', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Reporting Center
            </span>
            <span className="text-xs text-slate-400">• Institutional Audit Export</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Official Attendance Registers & Eligibility Reports
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Generate statutory semester exam eligibility sheets, debarred student lists, and departmental rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-[#050816] hover:bg-white/5 border border-indigo-900/60 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print Register</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs print:hidden">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student by name or roll number..."
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
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Statuses</option>
            <option value="eligible">Eligible Only (&gt;= 75%)</option>
            <option value="ineligible">Ineligible / Debarred (&lt; 75%)</option>
          </select>
        </div>
      </div>

      {/* Printable Register Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl print:bg-white print:text-black print:p-0 print:border-none">
        <div className="mb-4 pb-4 border-b border-white/10 hidden print:block text-black">
          <h2 className="text-xl font-bold">University Attendance & Exam Eligibility Register</h2>
          <p className="text-xs text-gray-600">Generated on {new Date().toLocaleDateString()} • Statutory Standard: 75.0%</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 print:text-black">
            <thead className="bg-[#050816] print:bg-gray-100 text-[#B3B8D4] print:text-black uppercase tracking-wider font-semibold border-y border-white/10 print:border-gray-300">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-200">
              {filtered.map(item => (
                <tr key={item.student.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white print:text-black">
                    {item.student.roll_number}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200 print:text-black">
                    {item.student.profile?.full_name}
                  </td>
                  <td className="py-3 px-4 text-slate-300 print:text-black">
                    {item.studentClass?.name || 'Class'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 print:text-black">
                    {item.student.department}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span className={item.isEligible ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-red-700'}>
                      {item.attendancePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isEligible ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:border-gray-400 print:text-black">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ELIGIBLE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 print:border-gray-400 print:text-black">
                        <XCircle className="w-3 h-3 text-rose-400" /> DEBARRED (&lt;75%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
