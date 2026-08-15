import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { riskService } from '../../services/riskService';
import { predictionService } from '../../services/predictionService';
import { Student, Parent, AttendanceSummary, RiskAssessment, Attendance, Subject } from '../../types';
import { IntelligenceEngine } from '../../services/intelligenceEngine';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import { AiCopilotModal } from '../../components/common/AiCopilotModal';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  ShieldAlert,
  Phone,
  Mail,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Bot,
  Info
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [parent, setParent] = useState<Parent | null>(null);
  const [ward, setWard] = useState<Student | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [recentLogs, setRecentLogs] = useState<Attendance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const loadData = () => {
    const allParents = dataStore.getParents();
    const allStudents = dataStore.getStudents();
    const allSubjects = dataStore.getSubjects();

    // Match parent or fallback
    const currentParent = allParents.find(p => p.profile_id === user?.id) || allParents[0];
    setParent(currentParent);

    // Find linked ward
    const currentWard = allStudents.find(s => s.parent_id === currentParent?.id) || allStudents[0];
    setWard(currentWard);
    setSubjects(allSubjects);

    if (currentWard) {
      const allSummaries = dataStore.getAttendanceSummaries();
      setSummaries(allSummaries.filter(s => s.student_id === currentWard.id));

      const currentRisk = riskService.getRiskAssessment(currentWard.id);
      setRisk(currentRisk);

      const allAttendance = dataStore.getAttendance();
      const wardLogs = allAttendance
        .filter(a => a.student_id === currentWard.id)
        .sort((a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime())
        .slice(0, 5);
      setRecentLogs(wardLogs);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, [user]);

  const overallStats = useMemo(() => {
    const total = summaries.reduce((acc, curr) => acc + curr.total_classes, 0);
    const present = summaries.reduce((acc, curr) => acc + curr.present_classes, 0);
    const absent = summaries.reduce((acc, curr) => acc + curr.absent_classes, 0);
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return {
      total,
      present,
      absent,
      percentage: Number(percentage.toFixed(1)),
    };
  }, [summaries]);

  const parentPlainSummary = useMemo(() => {
    if (!ward) return null;
    return IntelligenceEngine.generateParentPlainSummary(ward.id);
  }, [ward]);

  const handleContactFaculty = () => {
    showToast(`Teacher communication channel opened for ${ward?.profile?.full_name}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Guardian Portal
            </span>
            <span className="text-xs text-slate-400">• Welcome, {user?.full_name || 'Guardian'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ward Attendance & Academic Safety
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Monitoring ward: <span className="text-white font-bold">{ward?.profile?.full_name}</span> ({ward?.roll_number}) • {ward?.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#050816] hover:bg-white/5 text-white border border-indigo-900/60 text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-[#8677FF]" />
            <span>Ask AI Copilot</span>
          </button>

          <button
            onClick={handleContactFaculty}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Class Teacher</span>
          </button>
        </div>
      </div>

      {/* 👨‍👩‍👧 Parent AI Plain-Language Summary Box */}
      {parentPlainSummary && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1035] to-[#050816] border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#6E63FF]/20 border border-[#6E63FF]/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#8677FF]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8677FF] font-bold">
                  AI Family Academic Summary
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  {parentPlainSummary.headline}
                </h3>
              </div>
            </div>
            <span className="text-xl">{parentPlainSummary.statusEmoji}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#050816] p-4 rounded-2xl border border-white/5">
            {parentPlainSummary.parentSummary}
          </p>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Next Steps for Guardian:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {parentPlainSummary.actionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0B1035] border border-white/5 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="text-[#8677FF] font-bold">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ward Overview Header Card */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={ward?.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${ward?.roll_number}`}
            alt="Ward Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{ward?.profile?.full_name}</h2>
              <RiskBadge level={risk ? risk.risk_level : 'LOW'} />
            </div>
            <div className="text-xs text-[#8677FF] font-mono mt-0.5">
              Roll No: {ward?.roll_number} • Student ID: {ward?.student_id}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Class: {ward?.class?.name || 'Computer Science Sem 6'} • Section {ward?.class?.section || 'A'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Semester Attendance</div>
            <div
              className={`text-2xl font-black font-mono mt-0.5 ${
                overallStats.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {overallStats.percentage}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Consecutive Misses</div>
            <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">
              {risk ? risk.consecutive_absences : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallStats.percentage}%`}
          subtitle="Minimum 75% needed for exam eligibility"
          icon={CalendarCheck2}
          glowColor={overallStats.percentage >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Total Classes Attended"
          value={`${overallStats.present} / ${overallStats.total}`}
          subtitle={`${overallStats.absent} missed lectures this semester`}
          icon={GraduationCap}
          glowColor="purple"
        />

        <StatCard
          title="Predicted 30-Day Rate"
          value={risk ? `${risk.predicted_attendance.toFixed(1)}%` : '—'}
          subtitle="Algorithmic semester forecast"
          icon={TrendingUp}
          glowColor="blue"
        />

        <StatCard
          title="Risk Classification"
          value={risk ? risk.risk_level : 'LOW'}
          subtitle={risk?.risk_level === 'HIGH' ? 'Requires immediate action' : 'Safe academic standing'}
          icon={ShieldAlert}
          glowColor={risk?.risk_level === 'HIGH' ? 'rose' : 'emerald'}
        />
      </div>

      {/* Warnings / Alerts Box if High Risk */}
      {risk && risk.risk_level === 'HIGH' && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Attendance Alert: Below Statutory 75% Requirement</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            Your ward's attendance currently sits at {overallStats.percentage}%, which is below the mandatory 75% semester requirement. Failure to attend upcoming lectures may disqualify your ward from taking semester end examinations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleContactFaculty}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Request Faculty Meeting
            </button>
          </div>
        </div>
      )}

      {/* Course Breakdown & Recent Session Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Subject-Wise Breakdown</h3>
              <p className="text-xs text-[#B3B8D4]">Course-by-course attendance percentages</p>
            </div>
          </div>

          <div className="space-y-3">
            {summaries.map(s => {
              const sub = subjects.find(sub => sub.id === s.subject_id);
              const isWarning = s.attendance_percentage < 75;

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-[#050816] border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-[#8677FF] flex items-center justify-center font-mono font-bold text-xs">
                        {sub?.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{sub?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sub?.code}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold font-mono text-xs ${
                          isWarning ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {s.attendance_percentage.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.present_classes} of {s.total_classes} classes
                      </div>
                    </div>
                  </div>

                  <AttendanceProgress percentage={s.attendance_percentage} size="sm" showLabel={false} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Daily Logs (1 col) */}
        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Roll Calls</h3>

          <div className="space-y-2.5">
            {recentLogs.map(log => {
              const sub = subjects.find(s => s.id === log.subject_id);

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#050816] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {log.status === 'present' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-white text-xs truncate max-w-[120px]">
                        {sub?.name || 'Lecture'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.attendance_date}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      log.status === 'present'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
