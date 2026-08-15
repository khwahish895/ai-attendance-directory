import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { IntelligenceEngine } from '../../services/intelligenceEngine';
import { StudentAttendanceDNA, AttendanceBadge } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import {
  Dna,
  Award,
  Flame,
  Target,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentDnaPage: React.FC = () => {
  const { user } = useAuth();
  const students = dataStore.getStudents();
  const currentStudent = students.find(s => s.profile_id === user?.id) || students[0];

  const dna: StudentAttendanceDNA = useMemo(() => {
    return IntelligenceEngine.calculateStudentDNA(currentStudent?.id || 's1');
  }, [currentStudent]);

  const badges: AttendanceBadge[] = useMemo(() => {
    return IntelligenceEngine.getStudentBadges(currentStudent?.id || 's1');
  }, [currentStudent]);

  const dayChartData = dna.day_distribution.map(d => ({
    day: d.day.slice(0, 3),
    absentRate: d.absencePercentage,
    present: d.presentCount,
  }));

  const unlockedCount = badges.filter(b => b.is_unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30 flex items-center gap-1">
              <Dna className="w-3.5 h-3.5" />
              <span>Behavioral Fingerprint Engine</span>
            </span>
            <span className="text-xs text-slate-400">• Student Attendance DNA & Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Attendance DNA & Academic Milestones
          </h1>
          <p className="text-xs text-[#B3B8D4] mt-1">
            Interpretable behavioral profiling, temporal absence patterns, streak tracking, and institutional honor badges.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#050816] p-3 rounded-2xl border border-indigo-900/60">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="font-bold text-white">{unlockedCount} of {badges.length} Badges</div>
            <div className="text-[10px] text-slate-400 font-mono">Academic Honors</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consistency Index"
          value={`${dna.consistency_score} / 100`}
          subtitle="Mathematical regularity metric"
          icon={Dna}
          glowColor={dna.consistency_score >= 75 ? 'emerald' : 'amber'}
        />

        <StatCard
          title="Behavioral Archetype"
          value={dna.absenteeism_archetype}
          subtitle={dna.persona_tag}
          icon={Sparkles}
          glowColor="purple"
        />

        <StatCard
          title="Trend Velocity"
          value={dna.trend_momentum.toUpperCase()}
          subtitle="Recent 10-class momentum"
          icon={dna.trend_momentum === 'improving' ? TrendingUp : TrendingDown}
          glowColor={dna.trend_momentum === 'improving' ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Period 1 Morning Drop"
          value={`${dna.morning_absence_rate}%`}
          subtitle="08:30 AM Lecture presence"
          icon={Clock}
          glowColor={dna.morning_absence_rate <= 20 ? 'emerald' : 'rose'}
        />
      </div>

      {/* DNA Behavioral Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: DNA Behavioral Radar & Analysis (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-[#8677FF]" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Attendance Behavioral Profile Breakdown
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#6E63FF]/20 text-[#8677FF] border border-[#6E63FF]/30">
              {dna.persona_tag}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#050816] border border-white/5 space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Strategic Behavioral Assessment</h3>
              <p className="text-slate-300 leading-relaxed">
                {dna.recommendation_summary}
              </p>
            </div>

            {dna.affected_subject_name && (
              <div className="p-3.5 rounded-xl bg-[#0B1035] border border-indigo-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8677FF]">Most Affected Curriculum Area</span>
                  <div className="font-bold text-white text-xs">{dna.affected_subject_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Target for Recovery
                </span>
              </div>
            )}

            {/* Day of week chart */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Weekday Absence Rate Distribution (%):
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="day" stroke="#B3B8D4" fontSize={10} />
                    <YAxis stroke="#B3B8D4" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#050816', borderColor: '#6E63FF', borderRadius: 10 }}
                    />
                    <Bar dataKey="absentRate" name="Absence Rate (%)" fill="#6E63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Academic Milestones & Badges (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Academic Badges & Streaks
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Active Streak
            </span>
          </div>

          <div className="space-y-3">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  badge.is_unlocked
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-[#050816] border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{badge.name}</span>
                        {badge.is_unlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar towards unlock */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-[#050816] h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${
                        badge.is_unlocked ? 'bg-amber-400' : 'bg-[#6E63FF]'
                      }`}
                      style={{ width: `${badge.progress_pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#8677FF] font-mono">
                    {badge.next_milestone_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
