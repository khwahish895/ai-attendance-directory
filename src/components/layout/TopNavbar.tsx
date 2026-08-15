import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { Notification } from '../../types';
import {
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  CheckCheck,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifs = () => {
      if (user) {
        setNotifications(dataStore.getNotifications(user.id));
      } else {
        setNotifications(dataStore.getNotifications());
      }
    };
    updateNotifs();
    const unsub = dataStore.subscribe(updateNotifs);
    return unsub;
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead(user?.id);
  };

  const roleLabelMap: Record<string, string> = {
    super_admin: 'Super Admin',
    administrator: 'Administrator',
    teacher: 'Faculty / Teacher',
    student: 'Student',
    parent: 'Parent / Guardian',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050816]/90 backdrop-blur-xl border-b border-indigo-950/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-[#0B1035] text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6E63FF] to-[#8677FF] shadow-lg shadow-[#6E63FF]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                  AI Attendance Predictor
                </span>
                <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6E63FF]/15 text-[#8677FF] border border-[#6E63FF]/30">
                  Risk Engine v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#B3B8D4] hidden sm:block">
                Apex Institute of Technology • AY 2025–2026
              </p>
            </div>
          </div>
        </div>

        {/* Right: Semester indicator, Notification Center & Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0B1035] border border-white/5 text-xs text-[#B3B8D4]">
            <Calendar className="w-3.5 h-3.5 text-[#8677FF]" />
            <span>Sem 4 (Spring 2026)</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-[#0B1035] text-slate-300 hover:text-white border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#0B1035] border border-indigo-500/30 shadow-2xl shadow-black/90 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[11px] text-[#8677FF] hover:text-white transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => dataStore.markNotificationAsRead(n.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          n.is_read
                            ? 'bg-[#050816]/40 border-white/5 opacity-60'
                            : 'bg-[#050816] border-[#6E63FF]/30 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-white">{n.title}</span>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#B3B8D4] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-[#0B1035] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name || 'User'}`}
                alt="Avatar"
                className="w-7 h-7 rounded-xl object-cover border border-indigo-500/30"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white tracking-tight leading-tight">
                  {user?.full_name || 'User'}
                </div>
                <div className="text-[10px] text-[#8677FF] font-medium leading-tight">
                  {role ? roleLabelMap[role] : 'Guest'}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B1035] border border-indigo-500/30 shadow-2xl shadow-black/90 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="text-xs font-bold text-white">{user?.full_name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#6E63FF]/20 text-[#8677FF] border border-[#6E63FF]/30">
                    {role?.replace('_', ' ')}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (role === 'student') navigate('/student');
                    else if (role === 'teacher') navigate('/teacher');
                    else if (role === 'parent') navigate('/parent');
                    else if (role === 'super_admin') navigate('/super-admin');
                    else navigate('/admin');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#8677FF]" />
                  <span>My Portal Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer mt-1 border-t border-white/5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
