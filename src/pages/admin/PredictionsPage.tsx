import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { predictionService } from '../../services/predictionService';
import { Prediction, Student, Class } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  Users,
  BarChart3,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const PredictionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTrend, setSelectedTrend] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const load = () => {
    setStudents(dataStore.getStudents());
    setPredictions(dataStore.getPredictions());
    setClasses(dataStore.getClasses());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const stats = useMemo(() => {
    if (predictions.length === 0) return { avgForecast: 0, improving: 0, declining: 0, highRisk: 0 };
    const avg = predictions.reduce((acc, c) => acc + c.predicted_attendance, 0) / predictions.length;
    const improving = predictions.filter(p => p.trend === 'improving').length;
    const declining = predictions.filter(p => p.trend === 'declining').length;
    const highRisk = predictions.filter(p => p.predicted_risk_level === 'HIGH').length;

    return {
      avgForecast: Number(avg.toFixed(1)),
      improving,
      declining,
      highRisk,
    };
  }, [predictions]);

  const combined = useMemo(() => {
    return predictions.map(p => {
      const student = students.find(s => s.id === p.student_id);
      return {
        prediction: p,
        student,
      };
    });
  }, [predictions, students]);

  const filtered = useMemo(() => {
    return combined.filter(item => {
      if (selectedClass !== 'all' && item.student?.class_id !== selectedClass) return false;
      if (selectedTrend !== 'all' && item.prediction.trend !== selectedTrend) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = item.student?.profile?.full_name?.toLowerCase() || '';
        const roll = item.student?.roll_number?.toLowerCase() || '';
        if (!name.includes(q) && !roll.includes(q)) return false;
      }
      return true;
    });
  }, [combined, selectedClass, selectedTrend, searchQuery]);

  const handleRecalculateAll = () => {
    const res = predictionService.calculateAllPredictions();
    showToast(`Updated predictive trajectories for ${res.length} students`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Predictive Modeling
            </span>
            <span className="text-xs text-slate-400">• Semester Trajectory Forecast</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Institutional Attendance Projections & Trend Modeling
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Forecasting end-of-semester attendance rates using dynamic decay weighting and trend indicators.
          </p>
        </div>

        <button
          onClick={handleRecalculateAll}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate Forecasts</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Predicted Institutional Average"
          value={`${stats.avgForecast}%`}
          subtitle="Forecasted semester rate"
          icon={TrendingUp}
          glowColor={stats.avgForecast >= 80 ? 'emerald' : 'amber'}
        />

        <StatCard
          title="Forecasted Deficit Cohort"
          value={stats.highRisk}
          subtitle="Predicted to end <75%"
          icon={TrendingDown}
          glowColor="rose"
        />

        <StatCard
          title="Upward Momentum"
          value={stats.improving}
          subtitle="Students improving attendance"
          icon={Sparkles}
          glowColor="emerald"
        />

        <StatCard
          title="Downward Trajectory"
          value={stats.declining}
          subtitle="Students declining attendance"
          icon={TrendingDown}
          glowColor="rose"
        />
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student by name or roll number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTrend}
            onChange={e => setSelectedTrend(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Trends</option>
            <option value="improving">Improving Momentum</option>
            <option value="declining">Declining Momentum</option>
            <option value="stable">Stable Momentum</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Forecasted Attendance</th>
                <th className="py-3 px-4">Momentum Trend</th>
                <th className="py-3 px-4">Model Confidence</th>
                <th className="py-3 px-4">Predicted Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(({ prediction, student }) => {
                const studentClass = classes.find(c => c.id === student?.class_id);

                return (
                  <tr key={prediction.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student?.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student?.roll_number}`}
                          alt="Avatar"
                          className="w-9 h-9 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">
                            {student?.profile?.full_name || 'Student'}
                          </div>
                          <div className="text-[11px] text-[#8677FF] font-mono">
                            {student?.roll_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{studentClass?.name || 'Class'}</div>
                      <div className="text-[10px] text-slate-400">{student?.department}</div>
                    </td>

                    <td className="py-3.5 px-4 w-44">
                      <AttendanceProgress
                        percentage={prediction.predicted_attendance}
                        size="sm"
                        showLabel={true}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      {prediction.trend === 'improving' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
                          <TrendingUp className="w-3 h-3" /> Improving
                        </span>
                      ) : prediction.trend === 'declining' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 text-[11px]">
                          <TrendingDown className="w-3 h-3" /> Declining
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-300 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20 text-[11px]">
                          <Sparkles className="w-3 h-3" /> Stable
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      {prediction.confidence}%
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={prediction.predicted_risk_level} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
