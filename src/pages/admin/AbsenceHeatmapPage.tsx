import React, { useState, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { IntelligenceEngine } from '../../services/intelligenceEngine';
import { StatCard } from '../../components/common/StatCard';
import {
  Calendar as CalendarIcon,
  TrendingDown,
  Sparkles,
  Layers,
  AlertTriangle,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AbsenceHeatmapPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [hoveredCell, setHoveredCell] = useState<{ day: string; week: number; rate: number; absents: number } | null>(null);

  const subjects = dataStore.getSubjects();
  const patterns = useMemo(() => IntelligenceEngine.discoverCohortPatterns(), []);

  // Generate 12-week calendar matrix data for Mon-Sat
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Synthetic grounded matrix with Monday and Period 1 dips
  const heatmapMatrix = useMemo(() => {
    return weeks.map(week => {
      return days.map(day => {
        let baseRate = 88;
        if (day === 'Monday') baseRate -= 14;
        if (day === 'Friday') baseRate -= 8;
        if (day === 'Saturday') baseRate -= 12;
        if (week === 6 || week === 11) baseRate -= 10; // Mid-term & pre-exam dips
        const randomFactor = (week * 7 + day.length) % 7;
        const finalRate = Math.max(52, Math.min(98, baseRate + randomFactor - 3));
        const absents = Math.round(((100 - finalRate) / 100) * 45);
        return {
          week,
          day,
          rate: finalRate,
          absents,
        };
      });
    });
  }, [weeks, days]);

  // Day of week distribution chart data
  const dayChartData = [
    { day: 'Mon', attendance: 74.2, absences: 38.4 },
    { day: 'Tue', attendance: 88.6, absences: 11.2 },
    { day: 'Wed', attendance: 91.0, absences: 8.5 },
    { day: 'Thu', attendance: 87.4, absences: 12.1 },
    { day: 'Fri', attendance: 79.5, absences: 24.2 },
    { day: 'Sat', attendance: 81.2, absences: 16.0 },
  ];

  // Subject-wise absenteeism chart data
  const subjectChartData = subjects.slice(0, 5).map((s, i) => ({
    subject: s.code,
    name: s.name,
    absenceRate: [27.6, 23.9, 18.2, 14.5, 12.0][i] || 15.0,
  }));

  const getHeatmapColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500 hover:bg-emerald-400 text-white';
    if (rate >= 80) return 'bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100';
    if (rate >= 70) return 'bg-amber-600/80 hover:bg-amber-500 text-amber-100';
    return 'bg-rose-600/90 hover:bg-rose-500 text-rose-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Absence Heatmap & Spatial Discovery
            </span>
            <span className="text-xs text-slate-400">• Institutional Temporal Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Attendance Heatmap & Pattern Discovery
          </h1>
          <p className="text-xs text-[#B3B8D4] mt-1">
            Uncover systemic absenteeism patterns across days of the week, class timetable periods, and curriculum subjects.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-[#050816] border border-indigo-900/60 text-white text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Curriculum Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monday Absence Rate"
          value="38.4%"
          subtitle="Highest day-of-week drop"
          icon={TrendingDown}
          glowColor="rose"
        />

        <StatCard
          title="Period 1 Morning Drop"
          value="41.2%"
          subtitle="Earliest 08:30 AM lectures"
          icon={Clock}
          glowColor="amber"
        />

        <StatCard
          title="Most Affected Subject"
          value="DBMS (CS301)"
          subtitle="27.6% unexcused absence"
          icon={BookOpen}
          glowColor="purple"
        />

        <StatCard
          title="Systemic Patterns Discovered"
          value={`${patterns.length} Anomalies`}
          subtitle="AI Behavioral Signals"
          icon={Sparkles}
          glowColor="emerald"
        />
      </div>

      {/* Interactive Calendar Heatmap */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#8677FF]" />
              <span>Semester Calendar Attendance Matrix (Weeks 1 – 12)</span>
            </h2>
            <p className="text-xs text-[#B3B8D4]">
              Each cell represents cohort attendance rate for that specific weekday. Click or hover on a cell to inspect.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
            <span>&lt;70%</span>
            <span className="w-3.5 h-3.5 rounded bg-rose-600" />
            <span className="w-3.5 h-3.5 rounded bg-amber-600" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-700" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
            <span>90%+</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto border border-white/5 rounded-2xl bg-[#050816] p-4">
          <div className="min-w-[700px]">
            {/* Header row: Weeks */}
            <div className="grid grid-cols-13 gap-1.5 mb-2 text-center text-[11px] font-mono font-bold text-slate-400">
              <div className="text-left text-xs text-[#8677FF] pl-1">Day / Week</div>
              {weeks.map(w => (
                <div key={w}>W{w}</div>
              ))}
            </div>

            {/* Matrix Rows: Mon to Sat */}
            {days.map((dayName, dayIdx) => (
              <div key={dayName} className="grid grid-cols-13 gap-1.5 items-center mb-1.5">
                <div className="text-xs font-semibold text-white pl-1 font-mono truncate">
                  {dayName.slice(0, 3)}
                </div>
                {weeks.map((_, weekIdx) => {
                  const cell = heatmapMatrix[weekIdx][dayIdx];
                  return (
                    <div
                      key={weekIdx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      className={`h-9 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold cursor-pointer transition-all duration-200 shadow-sm ${getHeatmapColor(
                        cell.rate
                      )}`}
                    >
                      {cell.rate}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hovered cell info footer */}
        {hoveredCell ? (
          <div className="p-3.5 rounded-2xl bg-[#050816] border border-indigo-900/60 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8677FF]" />
              <span className="text-white font-bold">
                {hoveredCell.day}, Week {hoveredCell.week}:
              </span>
              <span className="text-slate-300">
                Cohort attendance was <strong className="text-white">{hoveredCell.rate}%</strong> (~{hoveredCell.absents} student absences).
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hoveredCell.rate >= 75
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {hoveredCell.rate >= 75 ? 'Healthy Standing' : 'Systemic Drop Flag'}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#050816] text-xs text-slate-500 text-center font-mono">
            Hover over any cell above to inspect localized absence breakdown.
          </div>
        )}
      </div>

      {/* Charts Section: Day Distribution + Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Day of Week Breakdown */}
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Day-of-the-Week Absenteeism Breakdown
            </h3>
            <p className="text-xs text-[#B3B8D4]">
              Analysis demonstrating heavy absence concentration on Mondays & Fridays.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#B3B8D4" fontSize={11} />
                <YAxis stroke="#B3B8D4" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#6E63FF', borderRadius: 12 }}
                />
                <Bar dataKey="absences" name="Absence Concentration %" fill="#FF5370" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Subject Breakdown */}
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Subject Absenteeism Vulnerability
            </h3>
            <p className="text-xs text-[#B3B8D4]">
              Identifies courses where students most frequently skip scheduled lecture sessions.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#B3B8D4" fontSize={11} />
                <YAxis dataKey="subject" type="category" stroke="#B3B8D4" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#6E63FF', borderRadius: 12 }}
                />
                <Bar dataKey="absenceRate" name="Absence Rate %" fill="#8677FF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
