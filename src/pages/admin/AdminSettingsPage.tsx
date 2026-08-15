import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Mail, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { dataStore } from '../../lib/dataProvider';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  const [warningThreshold, setWarningThreshold] = useState(85);
  const [consecutiveAbsenceTrigger, setConsecutiveAbsenceTrigger] = useState(3);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableParentSMS, setEnableParentSMS] = useState(true);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [currentSemester, setCurrentSemester] = useState('Spring 2026');

  const handleSave = () => {
    showToast('Institutional policy settings saved successfully', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all mock databases to default initial state?')) {
      dataStore.resetData();
      showToast('Database reset to baseline state', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              System Policy
            </span>
            <span className="text-xs text-slate-400">• Institutional Parameters</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Rules & Risk Engine Configuration
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Configure minimum statutory thresholds, consecutive absence triggers, and automated notification channels.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Attendance Thresholds */}
        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Shield className="w-5 h-5 text-[#8677FF]" />
            <h2 className="text-base font-bold text-white tracking-tight">Statutory Thresholds</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Minimum Exam Eligibility Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="90"
                value={minAttendancePercent}
                onChange={e => setMinAttendancePercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono focus:outline-none focus:border-[#6E63FF]"
              />
              <p className="text-[10px] text-slate-500 mt-1">Students below this percentage are classified as High Risk / Ineligible.</p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Early Warning Threshold (%)
              </label>
              <input
                type="number"
                min="60"
                max="95"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono focus:outline-none focus:border-[#6E63FF]"
              />
              <p className="text-[10px] text-slate-500 mt-1">Students between minimum and warning are flagged as Medium Risk.</p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Consecutive Absence Trigger (Classes)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={consecutiveAbsenceTrigger}
                onChange={e => setConsecutiveAbsenceTrigger(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono focus:outline-none focus:border-[#6E63FF]"
              />
              <p className="text-[10px] text-slate-500 mt-1">Triggers immediate automated SMS and risk escalation.</p>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Bell className="w-5 h-5 text-[#8677FF]" />
            <h2 className="text-base font-bold text-white tracking-tight">Notification Channels</h2>
          </div>

          <div className="space-y-4 pt-1">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050816] border border-white/5 cursor-pointer">
              <div>
                <div className="font-bold text-white">Automated Student Email Notices</div>
                <div className="text-[10px] text-slate-400">Send instant email when risk score rises</div>
              </div>
              <input
                type="checkbox"
                checked={enableEmailAlerts}
                onChange={e => setEnableEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#6E63FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050816] border border-white/5 cursor-pointer">
              <div>
                <div className="font-bold text-white">Parent / Guardian WhatsApp & SMS Alerts</div>
                <div className="text-[10px] text-slate-400">Notify guardians upon consecutive 3 absences</div>
              </div>
              <input
                type="checkbox"
                checked={enableParentSMS}
                onChange={e => setEnableParentSMS(e.target.checked)}
                className="w-4 h-4 accent-[#6E63FF] rounded cursor-pointer"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Semester Name</label>
                <input
                  type="text"
                  value={currentSemester}
                  onChange={e => setCurrentSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database Management & Diagnostics */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Database className="w-5 h-5 text-[#8677FF]" />
            <h2 className="text-base font-bold text-white tracking-tight">Database & Persistence Diagnostic</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#050816] border border-white/5">
            <div>
              <div className="font-bold text-white text-xs">Reset Local Mock Data Store</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Re-seeds initial classes, teachers, students, attendance logs, and risk assessments.
              </p>
            </div>

            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Mock Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
