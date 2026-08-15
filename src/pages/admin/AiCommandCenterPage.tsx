import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '../../lib/dataProvider';
import { IntelligenceEngine } from '../../services/intelligenceEngine';
import { StatCard } from '../../components/common/StatCard';
import {
  Sparkles,
  Bot,
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Send,
  Users,
  Calendar,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AiCopilotModal } from '../../components/common/AiCopilotModal';

export const AiCommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'early_warning' | 'consecutive'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const students = dataStore.getStudents();
  const risks = dataStore.getRiskAssessments();
  const attendance = dataStore.getAttendance();
  const earlyWarnings = useMemo(() => IntelligenceEngine.generateEarlyWarnings(), []);
  const cohortPatterns = useMemo(() => IntelligenceEngine.discoverCohortPatterns(), []);

  // Compute aggregate numbers
  const totalStudents = students.length;
  const highRiskCount = risks.filter(r => r.risk_level === 'HIGH').length;
  const mediumRiskCount = risks.filter(r => r.risk_level === 'MEDIUM').length;
  const lowRiskCount = risks.filter(r => r.risk_level === 'LOW').length;

  const totalLogs = attendance.length;
  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const overallAttendancePct = totalLogs > 0 ? Number(((totalPresent / totalLogs) * 100).toFixed(1)) : 82.4;

  const consecutiveCount = risks.filter(r => (r.consecutive_absences || 0) >= 2).length;
  const decliningCount = risks.filter(r => r.attendance_trend === 'declining').length;

  // Filtered early warnings / risk rows
  const flaggedRoster = useMemo(() => {
    return earlyWarnings.filter(w => {
      if (selectedFilter === 'critical') return w.warning_severity === 'imminent_breach';
      if (selectedFilter === 'consecutive') return w.consecutive_absences >= 2;
      if (selectedFilter === 'early_warning') return w.current_attendance >= 72;
      return true;
    });
  }, [earlyWarnings, selectedFilter]);

  const handleTriggerBulkAction = (actionType: string) => {
    if (actionType === 'interventions') {
      setActionSuccessMsg(`Successfully queued 4-Tier Smart Interventions for ${earlyWarnings.length} flagged students.`);
    } else if (actionType === 'sms') {
      setActionSuccessMsg(`Dispatched automated Parent SMS and Portal Alerts to ${highRiskCount + earlyWarnings.length} registered guardians.`);
    } else if (actionType === 'recovery') {
      navigate('/admin/simulator');
    }
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Signature Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1035] via-[#050816] to-[#0B1035] border border-indigo-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6E63FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Command Center
              </span>
              <span className="text-xs text-[#8677FF] font-mono font-semibold">
                Autonomous Academic Surveillance Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Attendance Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#B3B8D4] max-w-2xl leading-relaxed">
              Real-time multi-dimensional surveillance synthesizing early breach indicators, behavioral attendance DNA, pattern anomalies, and automated 4-tier smart interventions.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => navigate('/admin/heatmaps')}
              className="px-4 py-3 rounded-2xl bg-[#050816] hover:bg-white/5 text-white border border-indigo-900/60 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#8677FF]" />
              <span>Absence Heatmaps</span>
            </button>

            <button
              onClick={() => navigate('/admin/interventions')}
              className="px-4 py-3 rounded-2xl bg-[#050816] hover:bg-white/5 text-white border border-indigo-900/60 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interventions Log</span>
            </button>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionSuccessMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 6 High-Impact Operational KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallAttendancePct}%`}
          subtitle="Campus Average"
          icon={Activity}
          glowColor={overallAttendancePct >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Critical High Risk"
          value={`${highRiskCount} Students`}
          subtitle="<70% Statutory breach"
          icon={ShieldAlert}
          glowColor="rose"
        />

        <StatCard
          title="Early Warnings"
          value={`${earlyWarnings.length} Students`}
          subtitle="<75% Imminent breach"
          icon={AlertTriangle}
          glowColor="amber"
        />

        <StatCard
          title="Downward Momentum"
          value={`${decliningCount} Students`}
          subtitle="Negative gradient"
          icon={TrendingDown}
          glowColor="purple"
        />

        <StatCard
          title="Consecutive Misses"
          value={`${consecutiveCount} Students`}
          subtitle="2+ unexcused in a row"
          icon={Clock}
          glowColor="amber"
        />

        <StatCard
          title="30-Day Forecast"
          value={`${(overallAttendancePct - 0.8).toFixed(1)}%`}
          subtitle="Projected trajectory"
          icon={Sparkles}
          glowColor="blue"
        />
      </div>

      {/* Strategic AI Insights & Discovered Patterns Panel */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8677FF]" />
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Automated AI Pattern Signals & Anomaly Discovery
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Updated live across {totalStudents} student profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cohortPatterns.map(pattern => (
            <div
              key={pattern.id}
              className={`p-4 rounded-2xl border transition-all ${
                pattern.severity === 'high'
                  ? 'bg-rose-500/5 border-rose-500/30'
                  : 'bg-amber-500/5 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    pattern.severity === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {pattern.category}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {pattern.metricValue}
                </span>
              </div>
              <h3 className="font-bold text-white text-xs mb-1 tracking-tight">
                {pattern.title}
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                {pattern.description}
              </p>
              <div className="text-[10px] font-mono text-[#8677FF] flex items-center justify-between border-t border-white/5 pt-2">
                <span>Affected: ~{pattern.affectedCount} Students</span>
                <span className="text-slate-400">Systemic Risk</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* One-Click Action Bar */}
      <div className="p-5 rounded-3xl bg-[#050816] border border-indigo-900/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>One-Click Administrative Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleTriggerBulkAction('interventions')}
            className="px-3.5 py-2 rounded-xl bg-[#6E63FF]/20 hover:bg-[#6E63FF]/30 text-white border border-[#6E63FF]/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#8677FF]" />
            <span>Dispatch Smart Interventions ({earlyWarnings.length})</span>
          </button>

          <button
            onClick={() => handleTriggerBulkAction('sms')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Send Bulk Guardian Notices</span>
          </button>

          <button
            onClick={() => navigate('/admin/simulator')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Recovery Roadmaps</span>
          </button>
        </div>
      </div>

      {/* Explainable AI Early Warning & Risk Roster Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Explainable AI Risk Roster & Early Warning Flags</span>
            </h2>
            <p className="text-xs text-[#B3B8D4]">
              Transparent reasoning behind why each student was identified for academic intervention.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#050816] p-1.5 rounded-2xl border border-indigo-900/60 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedFilter === 'all' ? 'bg-[#6E63FF] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Flagged ({earlyWarnings.length})
            </button>
            <button
              onClick={() => setSelectedFilter('critical')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedFilter === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Imminent Breach
            </button>
            <button
              onClick={() => setSelectedFilter('consecutive')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedFilter === 'consecutive' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Consecutive Misses
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-white/5 rounded-2xl bg-[#050816]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Current %</th>
                <th className="py-3 px-4">Recent %</th>
                <th className="py-3 px-4">Consecutive</th>
                <th className="py-3 px-4">AI Projected %</th>
                <th className="py-3 px-4">Explainable Root Cause</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {flaggedRoster.map(row => (
                <tr key={row.student_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{row.student_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{row.roll_number}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{row.class_name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{row.current_attendance}%</td>
                  <td className="py-3 px-4 font-mono text-amber-400">{row.recent_attendance}%</td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.consecutive_absences >= 2
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.consecutive_absences} missed
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">
                    <div className="flex items-center gap-1">
                      <span>{row.predicted_attendance}%</span>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="space-y-1">
                      {row.why_flagged.map((reason, i) => (
                        <div key={i} className="text-[10px] text-slate-300 flex items-start gap-1">
                          <span className="text-[#8677FF] font-bold">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6E63FF]/20 text-[#8677FF] border border-[#6E63FF]/30">
                      Level {row.target_intervention_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate('/admin/interventions')}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-90 text-white font-bold text-[10px] transition-all cursor-pointer"
                    >
                      Intervene
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating / Embedded AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
