import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  CalendarCheck2,
  Users,
  ShieldAlert,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowUpRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classes, setClasses] = useState(dataStore.getClasses());
  const [subjects, setSubjects] = useState(dataStore.getSubjects());
  const [students, setStudents] = useState(dataStore.getStudents());
  const [riskAssessments, setRiskAssessments] = useState(dataStore.getRiskAssessments());
  const [assignments, setAssignments] = useState(dataStore.getTeacherAssignments());

  const load = () => {
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
    setStudents(dataStore.getStudents());
    setRiskAssessments(dataStore.getRiskAssessments());
    setAssignments(dataStore.getTeacherAssignments());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const totalAssignedClasses = classes.length;
  const totalStudents = students.length;

  const highRiskStudents = useMemo(() => {
    return students
      .map(s => {
        const risk = riskAssessments.find(r => r.student_id === s.id);
        return { student: s, risk };
      })
      .filter(item => item.risk && item.risk.risk_level === 'HIGH');
  }, [students, riskAssessments]);

  const avgAttendance = useMemo(() => {
    if (riskAssessments.length === 0) return 0;
    const sum = riskAssessments.reduce((acc, curr) => acc + curr.attendance_percentage, 0);
    return Number((sum / riskAssessments.length).toFixed(1));
  }, [riskAssessments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Faculty Workspace
            </span>
            <span className="text-xs text-slate-400">• Welcome back, {user?.full_name || 'Professor'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Class Cohort Overview & Roll Call
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Monitor your assigned class attendance rates, record daily presence, and track students at risk.
          </p>
        </div>

        <button
          onClick={() => navigate('/teacher/attendance')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Mark Class Attendance</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Class Attendance"
          value={`${avgAttendance}%`}
          subtitle="Across assigned sections"
          icon={TrendingUp}
          glowColor={avgAttendance >= 80 ? 'emerald' : 'amber'}
        />

        <StatCard
          title="Students At High Risk"
          value={highRiskStudents.length}
          subtitle="Below 75% statutory requirement"
          icon={ShieldAlert}
          glowColor="rose"
        />

        <StatCard
          title="Assigned Classes"
          value={totalAssignedClasses}
          subtitle="Spring 2026 Semester"
          icon={Layers}
          glowColor="purple"
        />

        <StatCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Active course roster"
          icon={Users}
          glowColor="blue"
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes Card */}
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">My Teaching Schedule</h3>
              <span className="text-xs text-[#8677FF] font-semibold">{classes.length} Classes</span>
            </div>

            <div className="space-y-3">
              {classes.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[#8677FF]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.department} • Section {c.section}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/teacher/attendance')}
                    className="px-3 py-1 rounded-xl bg-[#6E63FF]/20 text-[#8677FF] hover:bg-[#6E63FF] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Take Roll Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Risk Students Alert */}
        <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Immediate Attention Needed</span>
              </h3>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                {highRiskStudents.length} Students
              </span>
            </div>

            <div className="space-y-3">
              {highRiskStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No students in your classes are currently in the high risk tier.
                </div>
              ) : (
                highRiskStudents.slice(0, 4).map(({ student, risk }) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-2xl bg-[#050816] border border-rose-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.roll_number}`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{student.profile?.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.roll_number}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs text-rose-400 font-mono">
                        {risk?.attendance_percentage.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {risk?.consecutive_absences} missed in a row
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => navigate('/teacher/students')}
              className="w-full text-center text-xs text-[#8677FF] hover:underline font-semibold"
            >
              View Full Class Roster & Risk Indicators →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
