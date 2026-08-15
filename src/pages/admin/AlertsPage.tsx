import React, { useState, useEffect, useMemo } from 'react';
import { dataStore } from '../../lib/dataProvider';
import { Alert, Student } from '../../types';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Send,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AlertsPage: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const load = () => {
    setAlerts(dataStore.getAlerts());
    setStudents(dataStore.getStudents());
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
      if (searchQuery) {
        const student = students.find(s => s.id === a.student_id);
        const name = student?.profile?.full_name?.toLowerCase() || '';
        const title = a.title.toLowerCase();
        const q = searchQuery.toLowerCase();
        if (!name.includes(q) && !title.includes(q)) return false;
      }
      return true;
    });
  }, [alerts, selectedSeverity, searchQuery, students]);

  const handleMarkAllRead = () => {
    alerts.forEach(a => dataStore.markAlertRead(a.id));
    showToast('All alerts marked as read', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Alerts Dispatch Center
            </span>
            <span className="text-xs text-slate-400">• {alerts.length} Total Alerts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Institutional Attendance & Absenteeism Alerts
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Review system-generated risk escalations, consecutive absence notices, and parent advisories.
          </p>
        </div>

        {alerts.some(a => !a.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 rounded-2xl bg-[#050816] hover:bg-white/5 border border-indigo-900/60 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0B1035] border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title or student name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#6E63FF]"
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#050816] border border-indigo-900/60 text-white text-xs focus:outline-none focus:border-[#6E63FF]"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity (Critical)</option>
          <option value="medium">Medium Severity (Warning)</option>
          <option value="low">Low Severity (Info)</option>
        </select>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B1035] border border-indigo-900/40 text-slate-400 text-xs">
            No active alerts matching the selected criteria.
          </div>
        ) : (
          filtered.map(alert => {
            const student = students.find(s => s.id === alert.student_id);

            return (
              <div
                key={alert.id}
                onClick={() => dataStore.markAlertRead(alert.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.is_read
                    ? 'bg-[#0B1035]/60 border-white/5 opacity-80'
                    : 'bg-[#0B1035] border-indigo-500/30 shadow-lg shadow-[#6E63FF]/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : alert.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {alert.severity === 'high' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{alert.title}</span>
                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#6E63FF]" />
                      )}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="font-semibold text-white">{student?.profile?.full_name}</span>
                      <span>•</span>
                      <span className="font-mono text-[#8677FF]">{student?.roll_number}</span>
                      <span>•</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                      alert.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : alert.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {alert.severity} Priority
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
