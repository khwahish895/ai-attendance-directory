import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { IntelligenceEngine, RecoveryPlanOption } from '../../services/intelligenceEngine';
import { Student, Subject, Attendance } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  BookOpen,
  User,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const { role, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Simulation controls
  const [upcomingClasses, setUpcomingClasses] = useState<number>(15);
  const [hypotheticalMisses, setHypotheticalMisses] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  useEffect(() => {
    const allStudents = dataStore.getStudents();
    const allSubjects = dataStore.getSubjects();
    setStudents(allStudents);
    setSubjects(allSubjects);

    if (role === 'student') {
      const cur = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
      if (cur) setSelectedStudentId(cur.id);
    } else {
      if (allStudents.length > 0) setSelectedStudentId(allStudents[0].id);
    }
  }, [role, user]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const attendanceRecords = useMemo(() => {
    if (!selectedStudent) return [];
    const logs = dataStore.getAttendance().filter(a => a.student_id === selectedStudent.id);
    if (selectedSubjectId === 'all') return logs;
    return logs.filter(a => a.subject_id === selectedSubjectId);
  }, [selectedStudent, selectedSubjectId]);

  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter(a => a.status === 'present').length;
  const currentPercentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) : 80.0;

  // Recovery plans for 75%, 80%, 85%, 90%
  const recoveryPlans = useMemo(() => {
    return IntelligenceEngine.calculateRecoveryPlan(presentClasses, totalClasses);
  }, [presentClasses, totalClasses]);

  // Simulation calculation
  const simulationOutcome = useMemo(() => {
    const attendedUpcoming = Math.max(0, upcomingClasses - hypotheticalMisses);
    const newTotal = totalClasses + upcomingClasses;
    const newPresent = presentClasses + attendedUpcoming;
    const projectedRate = newTotal > 0 ? Number(((newPresent / newTotal) * 100).toFixed(1)) : 0;
    const delta = Number((projectedRate - currentPercentage).toFixed(1));
    const isPassing = projectedRate >= 75.0;

    return {
      projectedRate,
      delta,
      isPassing,
      attendedUpcoming,
      newTotal,
      newPresent,
    };
  }, [totalClasses, presentClasses, upcomingClasses, hypotheticalMisses, currentPercentage]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Interactive Planning Engine
            </span>
            <span className="text-xs text-slate-400">• What-If Forecast & Recovery Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            What-If Attendance Simulator
          </h1>
          <p className="text-xs text-[#B3B8D4] mt-1">
            Model future attendance scenarios, calculate exact classes required to achieve academic thresholds, and build step-by-step recovery plans.
          </p>
        </div>

        {/* Student Selector if Admin / Teacher */}
        {role !== 'student' && (
          <div className="flex items-center gap-2 bg-[#050816] p-2.5 rounded-2xl border border-indigo-900/60">
            <User className="w-4 h-4 text-[#8677FF]" />
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-4"
            >
              {students.map(s => (
                <option key={s.id} value={s.id} className="bg-[#0B1035] text-white">
                  {s.profile?.full_name || 'Student'} ({s.roll_number})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Attendance Standing"
          value={`${currentPercentage}%`}
          subtitle={`${presentClasses} Present / ${totalClasses} Total Lectures`}
          icon={Calendar}
          glowColor={currentPercentage >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Projected Simulation Rate"
          value={`${simulationOutcome.projectedRate}%`}
          subtitle={simulationOutcome.delta >= 0 ? `+${simulationOutcome.delta}% trajectory` : `${simulationOutcome.delta}% trajectory`}
          icon={Sparkles}
          glowColor={simulationOutcome.isPassing ? 'emerald' : 'rose'}
          trend={{
            value: simulationOutcome.isPassing ? 'Cleared' : 'Debarred Risk',
            isPositive: simulationOutcome.isPassing,
          }}
        />

        <StatCard
          title="Classes Needed for 75%"
          value={recoveryPlans[0]?.classesNeeded === 0 ? '0 (Achieved)' : `${recoveryPlans[0]?.classesNeeded} classes`}
          subtitle="Continuous attendance target"
          icon={Target}
          glowColor={recoveryPlans[0]?.classesNeeded === 0 ? 'emerald' : 'amber'}
        />

        <StatCard
          title="85% Elite Club Target"
          value={recoveryPlans[2]?.classesNeeded === 0 ? 'Member' : `${recoveryPlans[2]?.classesNeeded} classes`}
          subtitle="Honors examination status"
          icon={ShieldCheck}
          glowColor="purple"
        />
      </div>

      {/* Main Interactive Simulator & Recovery Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8677FF]" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Simulate Future Lecture Attendance
              </h2>
            </div>
            {/* Subject Filter */}
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
            >
              <option value="all">All Curriculum Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="p-5 rounded-2xl bg-[#050816] border border-white/5 space-y-6 text-xs">
            {/* Slider 1: Total Upcoming Classes */}
            <div>
              <div className="flex justify-between items-center text-slate-300 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#8677FF]" />
                  <span>Number of upcoming lectures to plan for:</span>
                </span>
                <span className="font-mono text-white text-sm font-bold bg-[#6E63FF]/20 px-2.5 py-0.5 rounded-lg border border-[#6E63FF]/30">
                  {upcomingClasses} Lectures
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={upcomingClasses}
                onChange={e => {
                  const val = Number(e.target.value);
                  setUpcomingClasses(val);
                  if (hypotheticalMisses > val) setHypotheticalMisses(val);
                }}
                className="w-full accent-[#6E63FF] h-2.5 bg-indigo-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>5 classes</span>
                <span>30 classes</span>
                <span>60 classes (End of Semester)</span>
              </div>
            </div>

            {/* Slider 2: Hypothetical Absences */}
            <div>
              <div className="flex justify-between items-center text-slate-300 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Hypothetical absences during this upcoming period:</span>
                </span>
                <span className="font-mono text-rose-400 text-sm font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  {hypotheticalMisses} Missed
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={upcomingClasses}
                value={hypotheticalMisses}
                onChange={e => setHypotheticalMisses(Number(e.target.value))}
                className="w-full accent-rose-500 h-2.5 bg-indigo-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0 absences (100% attendance)</span>
                <span>{Math.floor(upcomingClasses / 2)} absences</span>
                <span>{upcomingClasses} absences (All missed)</span>
              </div>
            </div>

            {/* Simulation Mathematical Formula Breakdown */}
            <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/50 space-y-2">
              <div className="font-bold text-white flex items-center justify-between">
                <span className="text-[#8677FF] font-mono uppercase text-[10px]">Mathematical Projection Formula</span>
                <span className="font-mono text-emerald-400 font-bold">{simulationOutcome.projectedRate}% Final</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-[#050816] p-3 rounded-xl border border-white/5 overflow-x-auto">
                = (Current Present ({presentClasses}) + Simulated Present ({simulationOutcome.attendedUpcoming})) ÷ (Current Total ({totalClasses}) + Simulated Total ({upcomingClasses}))
                <br />
                = {simulationOutcome.newPresent} ÷ {simulationOutcome.newTotal} × 100 = <strong className="text-white">{simulationOutcome.projectedRate}%</strong>
              </div>
            </div>
          </div>

          {/* Outcome Status Box */}
          <div
            className={`p-5 rounded-2xl border ${
              simulationOutcome.isPassing
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {simulationOutcome.isPassing ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">
                  {simulationOutcome.isPassing
                    ? `Eligible for Semester Examination (${simulationOutcome.projectedRate}%)`
                    : `Debarred Risk: Below 75% Statutory Requirement (${simulationOutcome.projectedRate}%)`}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simulationOutcome.isPassing
                    ? `Under this plan, attending ${simulationOutcome.attendedUpcoming} of the next ${upcomingClasses} classes elevates your record to ${simulationOutcome.projectedRate}%, securing official examination clearance.`
                    : `Under this plan, missing ${hypotheticalMisses} classes will reduce your standing to ${simulationOutcome.projectedRate}%. You must reduce absences to at least maintain 75.0%.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Target Recovery Roadmap (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-[#8677FF]" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Attendance Recovery Milestones
              </h2>
            </div>
            <p className="text-xs text-[#B3B8D4]">
              Continuous class targets required to achieve key institutional percentages.
            </p>
          </div>

          <div className="space-y-3 flex-1 my-2">
            {recoveryPlans.map(plan => {
              const isMet = currentPercentage >= plan.targetPercentage;
              return (
                <div
                  key={plan.targetPercentage}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMet
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : plan.targetPercentage === 75
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-[#050816] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                          isMet ? 'bg-emerald-500 text-white' : 'bg-[#6E63FF]/20 text-[#8677FF] border border-[#6E63FF]/30'
                        }`}
                      >
                        {plan.targetPercentage}%
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">
                          {plan.targetPercentage === 75
                            ? 'Statutory Minimum (75%)'
                            : plan.targetPercentage === 80
                            ? 'Safe Buffer Zone (80%)'
                            : plan.targetPercentage === 85
                            ? 'Elite Club Tier (85%)'
                            : 'Academic Distinction (90%)'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isMet ? 'Secured in records' : 'Requires continuous presence'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                        isMet
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}
                    >
                      {isMet ? 'Achieved ✓' : `${plan.classesNeeded} classes`}
                    </span>
                  </div>

                  {/* Progress bar towards milestone */}
                  <div className="w-full bg-[#050816] h-2 rounded-full overflow-hidden border border-white/5 my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMet ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#6E63FF] to-[#8677FF]'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (currentPercentage / plan.targetPercentage) * 100))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {plan.recommendation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050816] border border-indigo-900/60 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#8677FF] shrink-0 mt-0.5" />
            <span>
              Calculations assume zero missed sessions during the recovery trajectory. Medical certificates must be countersigned by faculty mentors.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
