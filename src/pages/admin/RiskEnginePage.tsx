import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { riskService } from '../../services/riskService';
import { notificationService } from '../../services/notificationService';
import { RiskAssessment, Student, Class, Subject } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { AttendanceProgress } from '../../components/common/AttendanceProgress';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import {
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  Users,
  TrendingDown,
  Mail,
  Send,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const RiskEnginePage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<Student | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const load = () => {
    setStudents(dataStore.getStudents());
    setRiskAssessments(dataStore.getRiskAssessments());
    setClasses(dataStore.getClasses());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const riskStats = useMemo(() => {
    const total = riskAssessments.length;
    const high = riskAssessments.filter(r => r.risk_level === 'HIGH').length;
    const medium = riskAssessments.filter(r => r.risk_level === 'MEDIUM').length;
    const low = riskAssessments.filter(r => r.risk_level === 'LOW').length;
    return { total, high, medium, low };
  }, [riskAssessments]);

  const combinedData = useMemo(() => {
    return students.map(student => {
      const risk = riskAssessments.find(r => r.student_id === student.id);
      return {
        student,
        risk,
        attendancePercent: risk ? risk.attendance_percentage : 0,
        riskLevel: risk ? risk.risk_level : 'LOW',
        riskScore: risk ? risk.risk_score : 0,
      };
    });
  }, [students, riskAssessments]);

  const filtered = useMemo(() => {
    return combinedData.filter(item => {
      if (selectedClass !== 'all' && item.student.class_id !== selectedClass) return false;
      if (selectedRisk !== 'all' && item.riskLevel !== selectedRisk) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = item.student.profile?.full_name?.toLowerCase() || '';
        const roll = item.student.roll_number.toLowerCase();
        if (!name.includes(query) && !roll.includes(query)) return false;
      }
      return true;
    });
  }, [combinedData, selectedClass, selectedRisk, searchQuery]);

  const handleRecalculateAll = () => {
    const results = riskService.calculateAllStudentsRisk();
    showToast(`Recalculated risk profiles for ${results.length} students`, 'success');
  };

  const handleSendInterventionAlert = () => {
    if (!selectedStudentForAlert) return;
    notificationService.notifyStudentRiskAlert(
      selectedStudentForAlert.id,
      selectedStudentForAlert.profile?.full_name || 'Student',
      alertMessage || 'Formal notice: Your attendance is critically below the statutory 75% threshold.'
    );
    showToast(`Early warning alert dispatched to ${selectedStudentForAlert.profile?.full_name}`, 'success');
    setShowAlertModal(false);
    setAlertMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Risk Detection Engine
            </span>
            <span className="text-xs text-slate-400">• Institutional Intervention Matrix</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Early Absenteeism & Dropout Risk Diagnostic
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Automated multi-factor risk scoring engine evaluating consecutive misses, recency weighting, and statutory boundaries.
          </p>
        </div>

        <button
          onClick={handleRecalculateAll}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Batch Recalculate All</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="High Risk Tier (<75%)"
          value={riskStats.high}
          subtitle="Mandatory intervention required"
          icon={ShieldAlert}
          glowColor="rose"
        />

        <StatCard
          title="Medium Risk Tier (75-84%)"
          value={riskStats.medium}
          subtitle="At risk of falling below bar"
          icon={AlertTriangle}
          glowColor="amber"
        />

        <StatCard
          title="Low Risk Tier (85%+)"
          value={riskStats.low}
          subtitle="Safely above exam eligibility"
          icon={CheckCircle2}
          glowColor="emerald"
        />

        <StatCard
          title="Total Evaluated Roster"
          value={riskStats.total}
          subtitle="Real-time synchronized"
          icon={Users}
          glowColor="blue"
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
                {c.name} ({c.section})
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Risk Table */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050816] text-[#B3B8D4] uppercase tracking-wider font-semibold border-y border-white/10">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Consecutive Misses</th>
                <th className="py-3 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(({ student, risk, attendancePercent, riskLevel, riskScore }) => {
                const studentClass = classes.find(c => c.id === student.class_id);

                return (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.roll_number}`}
                          alt="Avatar"
                          className="w-9 h-9 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">
                            {student.profile?.full_name}
                          </div>
                          <div className="text-[11px] text-[#8677FF] font-mono">
                            {student.roll_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{studentClass?.name || 'Class'}</div>
                      <div className="text-[10px] text-slate-400">{student.department}</div>
                    </td>

                    <td className="py-3.5 px-4 w-44">
                      <AttendanceProgress percentage={attendancePercent} size="sm" showLabel={true} />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      <span className={riskScore > 60 ? 'text-rose-400' : riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                        {riskScore} / 100
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {risk && risk.consecutive_absences > 0 ? (
                        <span className="text-rose-400 font-bold font-mono">
                          {risk.consecutive_absences} missed
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentForAlert(student);
                          setShowAlertModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-[#6E63FF] text-[#8677FF] hover:text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Alert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Alert Modal */}
      {selectedStudentForAlert && (
        <Modal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          title={`Dispatch Risk Alert • ${selectedStudentForAlert.profile?.full_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 space-y-1">
              <div className="font-bold text-white">Target Student: {selectedStudentForAlert.profile?.full_name}</div>
              <div className="text-[11px] text-slate-400 font-mono">Roll: {selectedStudentForAlert.roll_number} • Dept: {selectedStudentForAlert.department}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Intervention Notice Message</label>
              <textarea
                rows={4}
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                placeholder="Enter custom advisory message or leave blank for statutory automated default text..."
                className="w-full p-3 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInterventionAlert}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#6E63FF]/30 cursor-pointer"
              >
                Send Alert Notification
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
