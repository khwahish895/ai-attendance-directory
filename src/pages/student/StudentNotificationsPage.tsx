import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { Notification } from '../../types';
import { Bell, CheckCheck, Clock, ShieldAlert, Sparkles, Trash2, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const StudentNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = () => {
    const all = dataStore.getNotifications();
    if (user) {
      setNotifications(all.filter(n => n.recipient_profile_id === user.id || n.recipient_profile_id === 'all'));
    } else {
      setNotifications(all);
    }
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, [user]);

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      dataStore.markNotificationRead(n.id);
    });
    showToast('All notifications marked as read', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Activity Stream
            </span>
            <span className="text-xs text-slate-400">• {notifications.length} Total Notices</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Notifications & System Alerts
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Real-time updates regarding roll calls, risk threshold changes, and faculty communications.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 rounded-2xl bg-[#050816] hover:bg-white/5 border border-indigo-900/60 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl bg-[#0B1035] border border-indigo-900/40 p-6 shadow-xl space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => dataStore.markNotificationRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-[#050816]/40 border-white/5 opacity-80'
                  : 'bg-[#050816] border-indigo-500/30 shadow-md shadow-[#6E63FF]/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'alert'
                      ? 'bg-rose-500/10 text-rose-400'
                      : notif.type === 'attendance'
                      ? 'bg-indigo-500/10 text-[#8677FF]'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {notif.type === 'alert' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{notif.title}</span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#6E63FF]" />
                    )}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
