import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { predictionService } from '../../services/predictionService';
import { riskService } from '../../services/riskService';
import { Student, Prediction, RiskAssessment, AttendanceSummary } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const StudentPredictionsPage: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);

  // Simulation parameters
  const [hypotheticalMisses, setHypotheticalMisses] = useState<number>(2);
  const [upcomingClassCount, setUpcomingClassCount] = useState<number>(15);

  const load = () => {
    const allStudents = dataStore.getStudents();
    const currentStudent = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
    if (currentStudent) {
      setStudent(currentStudent);
      const currentPred = predictionService.getPrediction(currentStudent.id);
      setPrediction(currentPred);
      const currentRisk = riskService.getRiskAssessment(currentStudent.id);
      setRisk(currentRisk);
      const allSummaries = dataStore.getAttendanceSummaries();
      setSummaries(allSummaries.filter(s => s.student_id === currentStudent.id));
    }
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, [user]);

  const currentOverall = useMemo(() => {
    const total = summaries.reduce((acc, c) => acc + c.total_classes, 0);
    const present = summaries.reduce((acc, c) => acc + c.present_classes, 0);
    return total > 0 ? (present / total) * 100 : 0;
  }, [summaries]);

  // Simulation output
  const simulatedOutcome = useMemo(() => {
    const totalNow = summaries.reduce((acc, c) => acc + c.total_classes, 0);
    const presentNow = summaries.reduce((acc, c) => acc + c.present_classes, 0);

    const attendedInFuture = Math.max(0, upcomingClassCount - hypotheticalMisses);
    const newTotal = totalNow + upcomingClassCount;
    const newPresent = presentNow + attendedInFuture;

    const rate = newTotal > 0 ? (newPresent / newTotal) * 100 : 0;
    const isPassing = rate >= 75;

    return {
      rate: Number(rate.toFixed(1)),
      isPassing,
      delta: Number((rate - currentOverall).toFixed(1)),
    };
  }, [summaries, upcomingClassCount, hypotheticalMisses, currentOverall]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Statistical Intelligence
            </span>
            <span className="text-xs text-slate-400">• Rule-Based Weighted Moving Average</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Predictive Attendance Trajectory
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Semester forecast modeling, risk probability forecasting, and interactive what-if scenarios.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#050816] border border-indigo-900/60 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-[#8677FF]" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Engine Confidence</div>
            <div className="text-xs font-bold text-white font-mono">{prediction?.confidence || 88}% Confidence</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Attendance"
          value={`${currentOverall.toFixed(1)}%`}
          subtitle="All subjects combined"
          icon={Calendar}
          glowColor={currentOverall >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="30-Day Forecast"
          value={prediction ? `${prediction.predicted_attendance.toFixed(1)}%` : '—'}
          subtitle={prediction?.trend === 'improving' ? 'Upward momentum' : 'Downward risk'}
          icon={TrendingUp}
          glowColor={prediction?.predicted_attendance && prediction.predicted_attendance >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Predicted Risk Tier"
          value={prediction?.predicted_risk_level || 'LOW'}
          subtitle="By semester conclusion"
          icon={AlertTriangle}
          glowColor={prediction?.predicted_risk_level === 'HIGH' ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Mathematical Trend"
          value={prediction?.trend.toUpperCase() || 'STABLE'}
          subtitle="Recent 10 sessions trajectory"
          icon={Sparkles}
          glowColor="purple"
        />
      </div>

      {/* Explanation & Algorithm Card */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[#8677FF]" />
          <h2 className="text-base font-extrabold text-white tracking-tight">
            How The Prediction Engine Calculates Your Trajectory
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {prediction?.explanation ||
            'The predictive algorithm calculates attendance trajectories using a 70% weighted baseline on recent 10-session logs and a 30% baseline on historical cumulative records, factoring in consecutive absence penalties.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6E63FF]" />
              <span>Weighted Recency (70%)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Recent 10 class sessions have a higher multiplier to capture sudden habit shifts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Historical Baseline (30%)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Semester-wide attendance serves as the anchor baseline against variance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Consecutive Absence Dampener</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Repeated unexcused misses trigger non-linear risk escalation and immediate warning tags.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Sandbox */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#8677FF]" />
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Interactive Attendance Scenario Sandbox
            </h2>
          </div>
          <span className="text-xs text-[#8677FF] bg-[#6E63FF]/15 px-3 py-1 rounded-full border border-[#6E63FF]/30 font-semibold">
            Hypothetical Forecast Tool
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#050816] border border-white/5 space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Number of upcoming lectures to simulate:</span>
                <span className="font-mono text-white font-bold">{upcomingClassCount} classes</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={upcomingClassCount}
                onChange={e => {
                  const val = Number(e.target.value);
                  setUpcomingClassCount(val);
                  if (hypotheticalMisses > val) setHypotheticalMisses(val);
                }}
                className="w-full accent-[#6E63FF] h-2 bg-indigo-950 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Hypothetical absences during this period:</span>
                <span className="font-mono text-rose-400 font-bold">{hypotheticalMisses} missed</span>
              </div>
              <input
                type="range"
                min="0"
                max={upcomingClassCount}
                value={hypotheticalMisses}
                onChange={e => setHypotheticalMisses(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-indigo-950 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1035] border border-white/5 text-[11px] text-slate-400">
              Simulating attending {upcomingClassCount - hypotheticalMisses} of the next {upcomingClassCount} classes.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#050816] border border-indigo-500/20 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-[10px] text-[#B3B8D4] uppercase font-bold tracking-wider">
                Simulated Outcome Prediction
              </div>

              <div className="flex items-baseline gap-3">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    simulatedOutcome.isPassing ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulatedOutcome.rate}%
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    simulatedOutcome.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulatedOutcome.delta >= 0 ? `+${simulatedOutcome.delta}%` : `${simulatedOutcome.delta}%`} from current
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1035] border border-white/5">
                {simulatedOutcome.isPassing ? (
                  <div className="flex items-start gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Eligible for final examinations with {simulatedOutcome.rate}% standing.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Falls below the 75% requirement. You must minimize absences to maintain clearance.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
