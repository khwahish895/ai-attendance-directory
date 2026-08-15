import React, { useState } from 'react';
import { AbsencePrediction, AbsencePredictionInput, DayOfWeekName } from '../../types';
import { RuleBasedPredictionProvider } from '../../services/absencePredictionService';
import { AbsencePredictionCard } from './AbsencePredictionCard';
import {
  Sparkles,
  X,
  Sliders,
  Play,
  RotateCcw,
  Calendar,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';

interface AbsenceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudentName?: string;
  initialSubjectName?: string;
}

export const AbsenceSimulatorModal: React.FC<AbsenceSimulatorModalProps> = ({
  isOpen,
  onClose,
  initialStudentName = 'Demo Student',
  initialSubjectName = 'Data Structures & Algorithms',
}) => {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [subjectName, setSubjectName] = useState(initialSubjectName);
  const [targetDate, setTargetDate] = useState('2026-08-18');
  const [overallAttendance, setOverallAttendance] = useState(72);
  const [recentAttendance, setRecentAttendance] = useState(65);
  const [absencesLast7Days, setAbsencesLast7Days] = useState(2);
  const [consecutiveAbsences, setConsecutiveAbsences] = useState(2);
  const [trend, setTrend] = useState<'increasing' | 'stable' | 'declining'>('declining');
  const [previousStatus, setPreviousStatus] = useState<'present' | 'absent'>('absent');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekName>('Monday');

  const [simulatedPrediction, setSimulatedPrediction] = useState<AbsencePrediction | null>(() => {
    const provider = new RuleBasedPredictionProvider();
    const input: AbsencePredictionInput = {
      student_id: 'stud-sim-1',
      student_name: initialStudentName,
      class_id: 'cls-1',
      subject_id: 'sub-1',
      target_date: '2026-08-18',
      overall_attendance_pct: 72,
      subject_attendance_pct: 70,
      recent_attendance_pct: 65,
      classes_attended: 21,
      classes_missed: 9,
      total_classes: 30,
      absences_last_7_days: 2,
      absences_last_14_days: 3,
      absences_last_30_days: 5,
      consecutive_absences: 2,
      recent_streak: 0,
      previous_class_status: 'absent',
      day_of_week: 'Monday',
      day_of_week_absence_rate: 45,
      trend: 'declining',
    };
    return provider.predict(input);
  });

  if (!isOpen) return null;

  const handleRunSimulation = () => {
    const provider = new RuleBasedPredictionProvider();
    const input: AbsencePredictionInput = {
      student_id: 'stud-sim-custom',
      student_name: studentName,
      class_id: 'cls-sim',
      subject_id: 'sub-sim',
      target_date: targetDate,
      overall_attendance_pct: overallAttendance,
      subject_attendance_pct: overallAttendance,
      recent_attendance_pct: recentAttendance,
      classes_attended: Math.round((overallAttendance / 100) * 30),
      classes_missed: 30 - Math.round((overallAttendance / 100) * 30),
      total_classes: 30,
      absences_last_7_days: absencesLast7Days,
      absences_last_14_days: absencesLast7Days + 1,
      absences_last_30_days: absencesLast7Days + 3,
      consecutive_absences: consecutiveAbsences,
      recent_streak: consecutiveAbsences === 0 ? 3 : 0,
      previous_class_status: previousStatus,
      day_of_week: dayOfWeek,
      day_of_week_absence_rate: dayOfWeek === 'Monday' || dayOfWeek === 'Friday' ? 45 : 20,
      trend,
    };

    const res = provider.predict(input);
    // Attach dummy student & subject for nice rendering
    res.student = {
      id: 'stud-sim',
      profile_id: 'p-sim',
      student_id: 'SIM-999',
      roll_number: 'SIM-01',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: 'p-sim',
        full_name: studentName,
        email: 'sim@apextech.edu',
        role: 'student',
        created_at: '',
        updated_at: '',
      },
    };
    res.subject = {
      id: 'sub-sim',
      name: subjectName,
      code: 'CS401',
      credits: 4,
      department: 'Computer Science',
      semester: 4,
      created_at: '',
      updated_at: '',
    };

    setSimulatedPrediction(res);
  };

  const handleReset = () => {
    setOverallAttendance(72);
    setRecentAttendance(65);
    setAbsencesLast7Days(2);
    setConsecutiveAbsences(2);
    setTrend('declining');
    setPreviousStatus('absent');
    setDayOfWeek('Monday');
    handleRunSimulation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0B1035] border border-indigo-900/70 p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6E63FF] to-[#8677FF] flex items-center justify-center text-white shadow-lg shadow-[#6E63FF]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Mode B: Manual Attendance & Absence Risk Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Adjust attendance patterns, streaks, and trend parameters to observe real-time statistical predictions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Controls */}
          <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-[#050816] border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8677FF]" />
                Input Parameters
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] text-[#8677FF] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Values
              </button>
            </div>

            {/* Student & Subject Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                />
              </div>
            </div>

            {/* Target Date & Day of Week */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sliders: Overall vs Recent */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Overall Attendance:</span>
                  <span className={`font-mono font-bold ${overallAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {overallAttendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overallAttendance}
                  onChange={e => setOverallAttendance(Number(e.target.value))}
                  className="w-full accent-[#6E63FF]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Recent Attendance (Last 8 Sessions):</span>
                  <span className={`font-mono font-bold ${recentAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {recentAttendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={recentAttendance}
                  onChange={e => setRecentAttendance(Number(e.target.value))}
                  className="w-full accent-[#6E63FF]"
                />
              </div>
            </div>

            {/* Absences & Consecutive Misses */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Absences (Last 7 Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={absencesLast7Days}
                  onChange={e => setAbsencesLast7Days(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Consecutive Absences
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={consecutiveAbsences}
                  onChange={e => setConsecutiveAbsences(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1035] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
                />
              </div>
            </div>

            {/* Trend & Previous Status */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Attendance Trend</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['declining', 'stable', 'increasing'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrend(t)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        trend === t
                          ? 'bg-[#6E63FF] text-white border border-[#8677FF]'
                          : 'bg-[#0B1035] text-slate-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Previous Class</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['present', 'absent'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPreviousStatus(s)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        previousStatus === s
                          ? s === 'present'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-rose-500 text-white font-black'
                          : 'bg-[#0B1035] text-slate-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:from-[#7B71FF] hover:to-[#9689FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Recalculate Prediction Output
            </button>
          </div>

          {/* Right Column: Dynamic Prediction Result Card */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {simulatedPrediction ? (
              <AbsencePredictionCard prediction={simulatedPrediction} />
            ) : (
              <div className="p-8 text-center text-slate-400 bg-[#050816] rounded-3xl border border-white/10">
                Click Calculate to generate statistical risk.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
