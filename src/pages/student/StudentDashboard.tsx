import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { riskService } from '../../services/riskService';
import { predictionService } from '../../services/predictionService';
import { recommendationService } from '../../services/recommendationService';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  CalendarCheck2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Calculator,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Target
} from 'lucide-react';
import { Student, AttendanceSummary, RiskAssessment, Prediction, Recommendation } from '../../types';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  // What-if simulator state
  const [simulateTotalNext, setSimulateTotalNext] = useState<number>(10);
  const [simulateAttendNext, setSimulateAttendNext] = useState<number>(9);

  const loadData = () => {
    const allStudents = dataStore.getStudents();
    // Match by user profile or fallback to first student
    const currentStudent = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
    if (currentStudent) {
      setStudent(currentStudent);

      // Summaries
      const allSummaries = dataStore.getAttendanceSummaries();
      const studentSummaries = allSummaries.filter(s => s.student_id === currentStudent.id);
      setSummaries(studentSummaries);

      // Risk
      const currentRisk = riskService.getRiskAssessment(currentStudent.id);
      setRisk(currentRisk);

      // Prediction
      const currentPrediction = predictionService.getPrediction(currentStudent.id);
      setPrediction(currentPrediction);

      // Recommendations
      const currentRecs = recommendationService.getStudentRecommendations(currentStudent.id);
      setRecommendations(currentRecs);

      // Recent attendance logs
      const allLogs = dataStore.getAttendance();
      const studentLogs = allLogs
        .filter(l => l.student_id === currentStudent.id)
        .sort((a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime())
        .slice(0, 7);
      setRecentAttendance(studentLogs);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, [user]);

  // Overall attendance aggregation
  const overallStats = useMemo(() => {
    const totalClasses = summaries.reduce((acc, curr) => acc + curr.total_classes, 0);
    const presentClasses = summaries.reduce((acc, curr) => acc + curr.present_classes, 0);
    const absentClasses = summaries.reduce((acc, curr) => acc + curr.absent_classes, 0);
    const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    // 75% Requirement Math
    // (Present + X) / (Total + X) = 0.75 => Present + X = 0.75 Total + 0.75 X => 0.25 X = 0.75 Total - Present => X = 3 Total - 4 Present
    // Or if currently above 75%: Present / (Total + Y) = 0.75 => Present = 0.75 Total + 0.75 Y => 0.75 Y = Present - 0.75 Total => Y = (Present - 0.75 Total)/0.75
    let classesToAttend = 0;
    let safeToMiss = 0;

    if (percentage < 75) {
      classesToAttend = Math.max(0, Math.ceil(3 * totalClasses - 4 * presentClasses));
    } else {
      safeToMiss = Math.max(0, Math.floor((presentClasses - 0.75 * totalClasses) / 0.75));
    }

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      percentage: Number(percentage.toFixed(1)),
      classesToAttend,
      safeToMiss,
    };
  }, [summaries]);

  // Simulated Attendance Calculation
  const simulatedPercentage = useMemo(() => {
    const newTotal = overallStats.totalClasses + simulateTotalNext;
    const newPresent = overallStats.presentClasses + simulateAttendNext;
    if (newTotal === 0) return 0;
    return Number(((newPresent / newTotal) * 100).toFixed(1));
  }, [overallStats, simulateTotalNext, simulateAttendNext]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Student Academic Terminal
            </span>
            <span className="text-xs text-slate-400">
              • {student?.profile?.full_name} ({student?.roll_number})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Attendance Trajectory & Goal Planner
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Semester Spring 2026 • Department of {student?.department} • Section {student?.class?.section || 'A'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Institutional Status</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Eligible for Exams
            </div>
          </div>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value={`${overallStats.percentage}%`}
          subtitle={overallStats.percentage >= 75 ? 'Above 75% statutory bar' : 'Below mandatory threshold'}
          icon={CalendarCheck2}
          glowColor={overallStats.percentage >= 75 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Predicted 30-Day Rate"
          value={prediction ? `${prediction.predicted_attendance.toFixed(1)}%` : '—'}
          subtitle={prediction ? `Confidence: ${prediction.confidence}%` : 'Evaluating data...'}
          icon={TrendingUp}
          glowColor="purple"
        />

        <StatCard
          title="Risk Level Classification"
          value={risk ? risk.risk_level : 'LOW'}
          subtitle={risk && risk.risk_level === 'HIGH' ? 'Early alert active' : 'Normal standing'}
          icon={ShieldAlert}
          glowColor={risk?.risk_level === 'HIGH' ? 'rose' : risk?.risk_level === 'MEDIUM' ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Classes Attended / Total"
          value={`${overallStats.presentClasses} / ${overallStats.totalClasses}`}
          subtitle={`${overallStats.absentClasses} recorded missed sessions`}
          icon={BookOpen}
          glowColor="blue"
        />
      </div>

      {/* 75% Statutory Target Analysis Card */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#8677FF]" />
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                75% Statutory Attendance Goal Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time calculation of your buffer margins and required consecutive recovery sessions.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#050816] border border-indigo-900/60 flex items-center gap-3">
            <span className="text-xs text-slate-400">Target Standard:</span>
            <span className="text-sm font-bold text-white font-mono">75.0% Required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Gauge & Math Card */}
          <div className="p-5 rounded-2xl bg-[#050816] border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Current Standing</span>
              <span className={`font-bold font-mono ${overallStats.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overallStats.percentage}% ({overallStats.percentage >= 75 ? 'PASSED' : 'DEFICIT'})
              </span>
            </div>

            <AttendanceProgress percentage={overallStats.percentage} size="lg" showLabel={false} />

            <div className="p-3.5 rounded-xl bg-[#0B1035]/80 border border-white/5">
              {overallStats.percentage >= 75 ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Buffer Margin Available</div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      You can safely miss up to <span className="font-bold text-white font-mono">{overallStats.safeToMiss} class{overallStats.safeToMiss === 1 ? '' : 'es'}</span> without dropping below the 75% semester exam eligibility threshold.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-300">Immediate Recovery Action Required</div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      You must attend the next <span className="font-bold text-white font-mono">{overallStats.classesToAttend} consecutive classes</span> without absence to restore your attendance to 75.0%.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive What-If Simulator */}
          <div className="p-5 rounded-2xl bg-[#050816] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Calculator className="w-4 h-4 text-[#8677FF]" />
                <span>Attendance "What-If" Simulator</span>
              </div>
              <span className="text-[10px] text-[#8677FF] font-semibold">Live Projection</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Upcoming scheduled classes:</span>
                  <span className="font-mono text-white font-bold">{simulateTotalNext} classes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={simulateTotalNext}
                  onChange={e => {
                    const total = Number(e.target.value);
                    setSimulateTotalNext(total);
                    if (simulateAttendNext > total) setSimulateAttendNext(total);
                  }}
                  className="w-full accent-[#6E63FF] h-1.5 bg-indigo-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Classes you plan to attend:</span>
                  <span className="font-mono text-white font-bold">{simulateAttendNext} / {simulateTotalNext}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={simulateTotalNext}
                  value={simulateAttendNext}
                  onChange={e => setSimulateAttendNext(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-indigo-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Simulated Outcome Rate:</div>
                <div className={`text-base font-bold font-mono ${simulatedPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulatedPercentage}%
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400">Projected Change</div>
                <div className={`text-xs font-bold font-mono ${simulatedPercentage >= overallStats.percentage ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulatedPercentage >= overallStats.percentage ? '+' : ''}
                  {(simulatedPercentage - overallStats.percentage).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown & Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Progress (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Subject-Wise Breakdown</h3>
              <p className="text-xs text-[#B3B8D4]">Course-level attendance percentages & session tallies</p>
            </div>
            <button
              onClick={() => navigate('/student/attendance')}
              className="text-xs text-[#8677FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summaries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No course attendance summaries logged yet.
              </div>
            ) : (
              summaries.map(item => {
                const subject = item.subject || dataStore.getSubjects().find(s => s.id === item.subject_id);
                const isBelow = item.attendance_percentage < 75;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#050816] border border-white/5 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-[#8677FF] flex items-center justify-center font-mono font-bold text-xs">
                          {subject?.code.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{subject?.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{subject?.code} • {subject?.credits} Credits</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-bold font-mono text-xs ${isBelow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.attendance_percentage.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.present_classes} / {item.total_classes} attended
                        </div>
                      </div>
                    </div>

                    <AttendanceProgress percentage={item.attendance_percentage} size="sm" showLabel={false} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Session Logs (1 col) */}
        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8677FF]" />
                <span>Recent Roll Calls</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Last 7 Sessions</span>
            </div>

            <div className="space-y-2.5">
              {recentAttendance.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attendance history logged.
                </div>
              ) : (
                recentAttendance.map(log => {
                  const subject = dataStore.getSubjects().find(s => s.id === log.subject_id);

                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-[#050816] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {log.status === 'present' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : log.status === 'absent' ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-white text-[11px] truncate max-w-[130px]">
                            {subject?.name || 'Class'}
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
                })
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/student/attendance')}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all text-center cursor-pointer"
          >
            View Complete Attendance History →
          </button>
        </div>
      </div>

      {/* Personalized AI & Statistical Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#0B1035] to-purple-950/40 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8677FF]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                AI & Statistical Academic Guidance
              </h3>
            </div>
            <span className="text-xs text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30 font-semibold">
              {recommendations.length} Actionable Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 2).map(rec => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-[#050816]/90 border border-indigo-500/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{rec.title}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {rec.category}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{rec.description}</p>
                <div className="space-y-1 pt-1">
                  {rec.actionable_steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#B3B8D4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6E63FF]" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
