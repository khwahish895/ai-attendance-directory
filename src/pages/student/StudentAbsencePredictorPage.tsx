import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { AbsencePrediction, Subject, Student } from '../../types';
import {
  predictAbsenceRisk,
  extractPredictionInputFromDatabase,
} from '../../services/absencePredictionService';
import { AbsencePredictionCard } from '../../components/predictions/AbsencePredictionCard';
import { AttendanceRecoveryModal } from '../../components/predictions/AttendanceRecoveryModal';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Sparkles,
  Target,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Cpu,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const StudentAbsencePredictorPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [predictions, setPredictions] = useState<AbsencePrediction[]>([]);

  // Self-Prediction Selector
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('2026-08-18');
  const [generating, setGenerating] = useState(false);

  // Recovery modal
  const [activeRecoveryPlan, setActiveRecoveryPlan] = useState<AbsencePrediction | null>(null);

  const loadData = () => {
    const students = dataStore.getStudents();
    const me = students.find(s => s.profile_id === user?.id) || students[0];
    setCurrentStudent(me || null);

    const subs = dataStore.getSubjects();
    setSubjects(subs);
    if (subs.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subs[0].id);
    }

    if (me) {
      const preds = dataStore.getAbsencePredictions({ studentId: me.id });
      setPredictions(preds);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, [user]);

  // Handle student running prediction for their upcoming class
  const handleGenerateSelfPrediction = () => {
    if (!currentStudent || !selectedSubjectId) return;

    setGenerating(true);
    setTimeout(() => {
      const input = extractPredictionInputFromDatabase(currentStudent.id, selectedSubjectId, targetDate);
      if (!input) {
        showToast('Could not extract attendance history for this course', 'error');
        setGenerating(false);
        return;
      }

      const result = predictAbsenceRisk(input);
      result.student = currentStudent;
      result.subject = dataStore.getSubjectById(selectedSubjectId);
      result.class = dataStore.getClassById(currentStudent.class_id);

      dataStore.saveAbsencePrediction(result);
      setGenerating(false);
      showToast(`Generated upcoming class prediction: ${result.prediction} (${result.absence_probability}% Risk)`, 'success');
    }, 400);
  };

  // High Risk count
  const atRiskCount = predictions.filter(p => p.risk_level === 'HIGH' || p.prediction === 'Likely Absent').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#6E63FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Student Attendance Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Upcoming Class Absence Risk & Recovery Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Understand your predicted attendance probability for upcoming sessions and use the mathematical recovery planner to stay comfortably above the mandatory 75% semester threshold.
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Projected Classes"
          value={predictions.length}
          icon={Calendar}
          color="purple"
          subValue="Active Forecasts"
        />
        <StatCard
          title="Potential Absence Alerts"
          value={atRiskCount}
          icon={AlertTriangle}
          color={atRiskCount > 0 ? 'red' : 'green'}
          subValue={atRiskCount > 0 ? 'Action Recommended' : 'All Clear'}
        />
        <StatCard
          title="Prediction Engine"
          value="v1.0 Statistical"
          icon={Cpu}
          color="blue"
          subValue="Multi-factor Rule-Based"
        />
      </div>

      {/* Interactive Predictor Box */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/60 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-[#8677FF]" />
            Predict My Upcoming Class Attendance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a subject and date to calculate your absence probability based on real historical data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Subject / Course</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#050816] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Upcoming Class Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#050816] border border-white/10 text-xs text-white focus:outline-none focus:border-[#6E63FF]"
            >
            </input>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateSelfPrediction}
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:from-[#7B71FF] hover:to-[#9689FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? 'Calculating...' : 'Run Statistical Predictor'}
            </button>
          </div>
        </div>
      </div>

      {/* My Predictions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8677FF]" />
          My Upcoming Session Predictions
        </h2>

        {predictions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictions.map(pred => (
              <AbsencePredictionCard
                key={pred.id}
                prediction={pred}
                onOpenRecoveryPlan={p => setActiveRecoveryPlan(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0B1035] rounded-3xl border border-white/10 space-y-3">
            <Target className="w-12 h-12 text-[#8677FF] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white">No Forecasts Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Use the form above to forecast your attendance probability for any upcoming class session.
            </p>
          </div>
        )}
      </div>

      {/* Recovery Modal */}
      {activeRecoveryPlan && (
        <AttendanceRecoveryModal
          prediction={activeRecoveryPlan}
          isOpen={!!activeRecoveryPlan}
          onClose={() => setActiveRecoveryPlan(null)}
        />
      )}
    </div>
  );
};
