import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '../../lib/dataProvider';
import { Student, RiskAssessment, Attendance, Class, Subject } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  Users,
  GraduationCap,
  UserCheck,
  Layers,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Filter,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  useEffect(() => {
    const load = () => {
      setStudents(dataStore.getStudents());
      setClasses(dataStore.getClasses());
      setSubjects(dataStore.getSubjects());
      setRiskAssessments(dataStore.getRiskAssessments());
      setAttendance(dataStore.getAttendance());
    };
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClass !== 'all' && s.class_id !== selectedClass) return false;
      if (selectedDepartment !== 'all' && s.department !== selectedDepartment) return false;
      if (selectedRiskFilter !== 'all') {
        const risk = riskAssessments.find(r => r.student_id === s.id);
        if (risk?.risk_level !== selectedRiskFilter) return false;
      }
      return true;
    });
  }, [students, selectedClass, selectedDepartment, selectedRiskFilter, riskAssessments]);

  // Overall Metrics
  const totalStudents = students.length;
  const totalTeachers = dataStore.getTeachers().length;
  const totalClasses = classes.length;

  const validRisks = riskAssessments.filter(r =>
    filteredStudents.some(s => s.id === r.student_id)
  );

  const avgAttendance = validRisks.length > 0
    ? Number((validRisks.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / validRisks.length).toFixed(1))
    : 0;

  const highRiskCount = validRisks.filter(r => r.risk_level === 'HIGH').length;
  const mediumRiskCount = validRisks.filter(r => r.risk_level === 'MEDIUM').length;
  const lowRiskCount = validRisks.filter(r => r.risk_level === 'LOW').length;
  const below75Count = validRisks.filter(r => r.attendance_percentage < 75.0).length;

  // Chart Data: Attendance Trend over unique dates
  const trendChartData = useMemo(() => {
    const dateMap = new Map<string, { total: number; present: number }>();
    attendance.forEach(a => {
      const entry = dateMap.get(a.attendance_date) || { total: 0, present: 0 };
      entry.total += 1;
      if (a.status === 'present') entry.present += 1;
      dateMap.set(a.attendance_date, entry);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    return sortedDates.slice(-14).map(date => {
      const data = dateMap.get(date)!;
      const pct = data.total > 0 ? Number(((data.present / data.total) * 100).toFixed(1)) : 0;
      return {
        date: date.slice(5), // MM-DD
        attendance: pct,
        benchmark: 75,
      };
    });
  }, [attendance]);

  // Subject-wise Chart Data
  const subjectChartData = useMemo(() => {
    return subjects.map(sub => {
      const subRecords = attendance.filter(a => a.subject_id === sub.id);
      const present = subRecords.filter(a => a.status === 'present').length;
      const total = subRecords.length;
      const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;
      return {
        name: sub.code,
        fullName: sub.name,
        percentage: pct,
      };
    });
  }, [subjects, attendance]);

  // Risk Distribution Chart
  const riskPieData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10B981' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#F59E0B' },
    { name: 'High Risk', value: highRiskCount, color: '#F43F5E' },
  ];

  // At Risk Students List
  const atRiskStudents = useMemo(() => {
    return filteredStudents
      .map(s => {
        const risk = riskAssessments.find(r => r.student_id === s.id);
        const pred = dataStore.getPredictionForStudent(s.id);
        return {
          student: s,
          risk,
          pred,
        };
      })
      .filter(item => item.risk && (item.risk.risk_level === 'HIGH' || item.risk.risk_level === 'MEDIUM'))
      .sort((a, b) => (b.risk?.risk_score || 0) - (a.risk?.risk_score || 0));
  }, [filteredStudents, riskAssessments]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Institutional Intelligence
            </span>
            <span className="text-xs text-slate-400">• Real-Time Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Operations & Risk Center
          </h1>
          <p className="text-xs text-[#B3B8D4] mt-1">
            Campus-wide student attendance analytics, early warning risk detection, and forecast modeling.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/admin/attendance')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Log Attendance</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-4 py-2.5 rounded-xl bg-[#050816] hover:bg-white/5 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Download CSV Reports
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Filter className="w-4 h-4 text-[#8677FF]" />
          <span>Dashboard Filters:</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Class filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.department})
              </option>
            ))}
          </select>

          {/* Department filter */}
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Data Science">Data Science</option>
            <option value="Cyber Security">Cyber Security</option>
          </select>

          {/* Risk Level filter */}
          <select
            value={selectedRiskFilter}
            onChange={e => setSelectedRiskFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk (Safe)</option>
          </select>

          {(selectedClass !== 'all' || selectedDepartment !== 'all' || selectedRiskFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedClass('all');
                setSelectedDepartment('all');
                setSelectedRiskFilter('all');
              }}
              className="text-[11px] text-[#8677FF] hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* High-Level Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Average Attendance"
          value={`${avgAttendance}%`}
          subtitle="Target threshold is >= 85.0%"
          icon={TrendingUp}
          glowColor={avgAttendance >= 80 ? 'emerald' : 'amber'}
          trend={{
            value: avgAttendance >= 75 ? 'Passable' : 'Deficit',
            isPositive: avgAttendance >= 75,
          }}
        />

        <StatCard
          title="Students Below 75%"
          value={below75Count}
          subtitle="Breaching statutory requirement"
          icon={ShieldAlert}
          glowColor="rose"
          trend={{
            value: `${below75Count} At Risk`,
            isPositive: false,
          }}
        />

        <StatCard
          title="High Risk Students"
          value={highRiskCount}
          subtitle={`Medium Risk: ${mediumRiskCount} | Safe: ${lowRiskCount}`}
          icon={AlertTriangle}
          glowColor={highRiskCount > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle={`${totalClasses} Classes • ${totalTeachers} Faculty`}
          icon={GraduationCap}
          glowColor="purple"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Attendance Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Attendance Trajectory (Past 14 Days)
              </h3>
              <p className="text-xs text-[#B3B8D4]">
                Aggregated daily class presence with 75% statutory benchmark line
              </p>
            </div>
            <span className="text-[10px] text-slate-400 bg-[#050816] px-2.5 py-1 rounded-lg border border-white/5">
              Live Aggregate
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#B3B8D4" fontSize={11} tickLine={false} />
                <YAxis stroke="#B3B8D4" fontSize={11} domain={[40, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1035',
                    borderColor: 'rgba(110,99,255,0.4)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Daily Attendance']}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#6E63FF"
                  strokeWidth={3}
                  dot={{ fill: '#8677FF', r: 4 }}
                  activeDot={{ r: 6, fill: '#FFFFFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#F43F5E"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Pie (1 Col) */}
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Risk Distribution</h3>
            <p className="text-xs text-[#B3B8D4]">Calculated across active cohort</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1035',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 border-t border-white/5 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Low Risk (&gt;= 85%)
              </span>
              <span className="font-bold font-mono text-emerald-400">{lowRiskCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Medium Risk (75–84.9%)
              </span>
              <span className="font-bold font-mono text-amber-400">{mediumRiskCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                High Risk (&lt; 75%)
              </span>
              <span className="font-bold font-mono text-rose-400">{highRiskCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Bar Chart */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Curricular Subject-Wise Attendance Breakdown
            </h3>
            <p className="text-xs text-[#B3B8D4]">
              Comparison across core computer science & data subjects
            </p>
          </div>
          <span className="text-xs text-[#8677FF] font-semibold">{subjects.length} Subjects Tracked</span>
        </div>

        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#B3B8D4" fontSize={11} tickLine={false} />
              <YAxis stroke="#B3B8D4" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1035',
                  borderColor: 'rgba(110,99,255,0.4)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#FFF',
                }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}%`,
                  item.payload.fullName || 'Attendance',
                ]}
              />
              <Bar dataKey="percentage" fill="#6E63FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Action Table: High & Medium Risk Students */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Immediate Attention Roster (At-Risk Students)</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {atRiskStudents.length} Flagged
              </span>
            </h3>
            <p className="text-xs text-[#B3B8D4]">
              Sorted by highest calculated risk score. Click any student for comprehensive diagnostics.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/risk')}
            className="text-xs font-semibold text-[#8677FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Risk Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Current Attendance</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Consecutive Misses</th>
                <th className="py-3 px-4">Projected %</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students currently flagged in risk thresholds.
                  </td>
                </tr>
              ) : (
                atRiskStudents.map(({ student, risk, pred }) => {
                  const studentName = student.profile?.full_name || 'Student';
                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white tracking-tight">{studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student.roll_number}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">
                          {student.class?.name || 'Class'}
                        </span>
                        <div className="text-[10px] text-slate-400">{student.department}</div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
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
                        {risk?.consecutive_absences && risk.consecutive_absences >= 3 ? (
                          <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            {risk.consecutive_absences} in a row
                          </span>
                        ) : risk?.consecutive_absences ? (
                          <span className="text-amber-400 font-medium">
                            {risk.consecutive_absences} missed
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={pred && pred.predicted_attendance < 75 ? 'text-rose-400' : 'text-amber-400'}>
                          {pred?.predicted_attendance.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/student-profile/${student.id}`)}
                          className="px-3 py-1 rounded-xl bg-[#6E63FF]/20 text-[#8677FF] hover:bg-[#6E63FF] hover:text-white border border-[#6E63FF]/30 transition-all font-semibold cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
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
