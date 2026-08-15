import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  CalendarCheck2,
  ShieldAlert,
  Cpu,
  FileSpreadsheet,
  Settings,
  Bell,
  BookOpen,
  Building2,
  History,
  Lightbulb,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    switch (role) {
      case 'super_admin':
        return [
          { label: 'Overview', to: '/super-admin', icon: LayoutDashboard },
          { label: 'Institutions', to: '/super-admin/institutions', icon: Building2 },
          { label: 'Administrators', to: '/super-admin/users', icon: Users },
          { label: 'System Analytics', to: '/super-admin/analytics', icon: Cpu },
          { label: 'Audit Logs', to: '/super-admin/audit', icon: History },
          { label: 'Settings & Supabase', to: '/super-admin/settings', icon: Settings },
        ];

      case 'administrator':
        return [
          { label: 'Admin Dashboard', to: '/admin', icon: LayoutDashboard },
          { label: 'Students Directory', to: '/admin/students', icon: GraduationCap },
          { label: 'Faculty & Teachers', to: '/admin/teachers', icon: UserCheck },
          { label: 'Parents & Guardians', to: '/admin/parents', icon: Users },
          { label: 'Classes & Sections', to: '/admin/classes', icon: Layers },
          { label: 'Subjects & Curriculum', to: '/admin/subjects', icon: BookOpen },
          { label: 'Attendance Management', to: '/admin/attendance', icon: CalendarCheck2 },
          { label: 'Risk Detection Engine', to: '/admin/risk', icon: ShieldAlert },
          { label: 'Predictive Analytics', to: '/admin/predictions', icon: Cpu },
          { label: 'Reports & Export', to: '/admin/reports', icon: FileSpreadsheet },
          { label: 'Alerts Center', to: '/admin/alerts', icon: Bell },
          { label: 'Settings', to: '/admin/settings', icon: Settings },
        ];

      case 'teacher':
        return [
          { label: 'Teacher Dashboard', to: '/teacher', icon: LayoutDashboard },
          { label: 'Mark Attendance', to: '/teacher/attendance', icon: CalendarCheck2 },
          { label: 'My Assigned Classes', to: '/teacher/classes', icon: Layers },
          { label: 'Attendance History', to: '/teacher/history', icon: History },
          { label: 'Class Students & Risk', to: '/teacher/students', icon: GraduationCap },
          { label: 'Risk Monitoring', to: '/teacher/risk', icon: ShieldAlert },
          { label: 'Class Reports', to: '/teacher/reports', icon: FileSpreadsheet },
        ];

      case 'student':
        return [
          { label: 'Student Dashboard', to: '/student', icon: LayoutDashboard },
          { label: 'My Attendance Logs', to: '/student/attendance', icon: CalendarCheck2 },
          { label: 'Subject Breakdown', to: '/student/subjects', icon: BookOpen },
          { label: 'Attendance History', to: '/student/history', icon: History },
          { label: 'Statistical Prediction', to: '/student/prediction', icon: Cpu },
          { label: 'Risk Diagnostics', to: '/student/risk', icon: ShieldAlert },
          { label: 'AI Recommendations', to: '/student/recommendations', icon: Lightbulb },
          { label: 'Notifications', to: '/student/notifications', icon: Bell },
        ];

      case 'parent':
        return [
          { label: 'Parent Portal', to: '/parent', icon: LayoutDashboard },
          { label: 'Ward Profile & Stats', to: '/parent/student', icon: GraduationCap },
          { label: 'Subject Attendance', to: '/parent/attendance', icon: BookOpen },
          { label: 'Risk Analysis', to: '/parent/risk', icon: ShieldAlert },
          { label: 'Attendance Forecast', to: '/parent/prediction', icon: Cpu },
          { label: 'Recommendations', to: '/parent/recommendations', icon: Lightbulb },
          { label: 'Alerts & Notices', to: '/parent/notifications', icon: Bell },
        ];

      default:
        return [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-[#050816] border-r border-indigo-950/80 flex flex-col h-full overflow-y-auto p-4 shrink-0">
      {/* Role Banner Badge */}
      <div className="mb-4 px-3 py-2.5 rounded-2xl bg-[#0B1035] border border-indigo-500/20 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[#B3B8D4] uppercase font-bold tracking-wider">
            Portal Access
          </div>
          <div className="text-xs font-bold text-white tracking-tight capitalize">
            {role ? role.replace('_', ' ') : 'User'} Space
          </div>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
      </div>

      {/* Nav List */}
      <div className="text-[11px] font-bold text-[#B3B8D4] uppercase tracking-wider px-3 mb-2">
        Navigation Menu
      </div>

      <nav className="space-y-1 flex-1">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#6E63FF] to-[#8677FF] text-white shadow-lg shadow-[#6E63FF]/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0B1035] border border-transparent hover:border-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8677FF]'}`} />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-[#B3B8D4]">
        <div className="p-3 rounded-xl bg-[#0B1035]/60 border border-white/5">
          <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#8677FF]" />
            <span>Statistical Model</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Rule-Based Prediction Engine v1.0 with dynamic confidence scoring.
          </p>
        </div>
      </div>
    </aside>
  );
};
