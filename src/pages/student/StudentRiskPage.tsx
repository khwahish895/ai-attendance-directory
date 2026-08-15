import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { riskService } from '../../services/riskService';
import { Student, RiskAssessment } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export const StudentRiskPage: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  const load = () => {
    const allStudents = dataStore.getStudents();
    const currentStudent = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
    if (currentStudent) {
      setStudent(currentStudent);
      const currentRisk = riskService.getRiskAssessment(currentStudent.id);
      setRisk(currentRisk);
    }
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Risk Diagnostics
            </span>
            <span className="text-xs text-slate-400">• Early Absenteeism Detection Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Personal Attendance Risk Assessment
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Understand the risk algorithms, potential academic jeopardy, and automatic alert factors.
          </p>
        </div>

        <RiskBadge level={risk ? risk.risk_level : 'LOW'} />
      </div>

      {/* Main Risk Diagnostics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Risk Score Metric</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">{risk ? risk.risk_score : 0}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Scores above 60 trigger automated alerts to your course advisors and parents.
          </p>
          <div className="w-full bg-[#050816] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (risk?.risk_score || 0) > 60
                  ? 'bg-rose-500'
                  : (risk?.risk_score || 0) > 30
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${risk?.risk_score || 0}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Consecutive Misses</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-rose-400 font-mono">
              {risk ? risk.consecutive_absences : 0}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Consecutive absences carry a higher penalty factor in the rule-based risk classifier.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Trajectory Direction</div>
          <div className="flex items-center gap-2">
            {risk?.attendance_trend === 'improving' ? (
              <span className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-6 h-6" /> Improving
              </span>
            ) : risk?.attendance_trend === 'declining' ? (
              <span className="text-2xl font-bold text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-6 h-6" /> Declining
              </span>
            ) : (
              <span className="text-2xl font-bold text-[#8677FF] flex items-center gap-1">
                <Sparkles className="w-6 h-6" /> Stable
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300">
            Calculated by comparing recent 10-session logs against the cumulative semester percentage.
          </p>
        </div>
      </div>

      {/* Trigger Reasons */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>Active Diagnostic Indicators</span>
        </h3>

        {risk && risk.reasons && risk.reasons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {risk.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No critical risk triggers detected. Your attendance record is in good academic standing.</span>
          </div>
        )}
      </div>
    </div>
  );
};
