import React, { useState, useEffect } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { AbsencePrediction, Student } from '../../types';
import { AbsencePredictionCard } from '../../components/predictions/AbsencePredictionCard';
import { AttendanceRecoveryModal } from '../../components/predictions/AttendanceRecoveryModal';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

export const ParentAbsencePredictorPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [predictions, setPredictions] = useState<AbsencePrediction[]>([]);
  const [activeRecoveryPlan, setActiveRecoveryPlan] = useState<AbsencePrediction | null>(null);

  const loadData = () => {
    // Look for student associated with parent
    const students = dataStore.getStudents();
    // Default to a student (e.g. Rahul Sharma or first student with parent)
    const linkedStudent = students.find(s => s.parent?.profile_id === user?.id) || students[3] || students[0];
    setStudent(linkedStudent || null);

    if (linkedStudent) {
      const preds = dataStore.getAbsencePredictions({ studentId: linkedStudent.id });
      setPredictions(preds);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStore.subscribe(loadData);
    return unsub;
  }, [user]);

  const atRiskCount = predictions.filter(p => p.risk_level === 'HIGH' || p.prediction === 'Likely Absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#6E63FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Parent Guardian Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Upcoming Attendance Risk & Forecast for {student?.profile?.full_name || 'Ward'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Transparent insights into upcoming class attendance likelihood. Designed to help you proactively support your child before attendance falls below institutional requirements.
          </p>
        </div>
      </div>

      {/* Ward Info Card */}
      {student && (
        <div className="p-4 rounded-2xl bg-[#050816] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6E63FF]/20 border border-[#6E63FF]/30 flex items-center justify-center font-bold text-white text-base">
              {student.profile?.full_name?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{student.profile?.full_name}</div>
              <div className="text-slate-400 text-[11px]">
                Roll No: {student.roll_number} • Class: {student.class?.name} ({student.class?.section})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Opening direct message with class advisor...', 'info')}
              className="px-3.5 py-2 rounded-xl bg-[#6E63FF]/20 hover:bg-[#6E63FF]/30 text-[#8677FF] hover:text-white border border-[#6E63FF]/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message Class Advisor
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monitored Upcoming Classes"
          value={predictions.length}
          icon={Calendar}
          color="purple"
          subValue="Active Forecasts"
        />
        <StatCard
          title="Absence Risk Alerts"
          value={atRiskCount}
          icon={AlertTriangle}
          color={atRiskCount > 0 ? 'red' : 'green'}
          subValue={atRiskCount > 0 ? 'Proactive Attention Advised' : 'Good Standing'}
        />
        <StatCard
          title="Prediction Engine"
          value="Transparent Stats"
          icon={ShieldCheck}
          color="blue"
          subValue="Rule-Based v1.0"
        />
      </div>

      {/* Predictions list */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#8677FF]" />
          Upcoming Class Forecasts
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
          <div className="p-12 text-center bg-[#0B1035] rounded-3xl border border-white/10 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Absence Risks Detected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your ward's attendance patterns are currently steady with no projected absence alerts.
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
