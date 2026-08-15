import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsManagementPage } from './pages/admin/StudentsManagementPage';
import { TeachersManagementPage } from './pages/admin/TeachersManagementPage';
import { ParentsManagementPage } from './pages/admin/ParentsManagementPage';
import { ClassesManagementPage } from './pages/admin/ClassesManagementPage';
import { SubjectsManagementPage } from './pages/admin/SubjectsManagementPage';
import { RiskEnginePage } from './pages/admin/RiskEnginePage';
import { PredictionsPage } from './pages/admin/PredictionsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AlertsPage } from './pages/admin/AlertsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { MarkAttendancePage } from './pages/teacher/MarkAttendancePage';
import { AttendanceHistoryPage } from './pages/teacher/AttendanceHistoryPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherDoubtsPage } from './pages/teacher/TeacherDoubtsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentPredictionsPage } from './pages/student/StudentPredictionsPage';
import { StudentRiskPage } from './pages/student/StudentRiskPage';
import { StudentRecommendationsPage } from './pages/student/StudentRecommendationsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentLearningHubPage } from './pages/student/StudentLearningHubPage';

// Parent Pages
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentLearningPage } from './pages/parent/ParentLearningPage';

// Common Pages
import { ProfilePage } from './pages/common/ProfilePage';
import { NotFoundPage } from './pages/common/NotFoundPage';

// Role-based Root Redirect
const RootRedirector: React.FC = () => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#6E63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'super_admin':
      return <Navigate to="/super-admin" replace />;
    case 'administrator':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    case 'parent':
      return <Navigate to="/parent" replace />;
    default:
      return <Navigate to="/admin" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Application Layout */}
            <Route element={<AppLayout />}>
              {/* Root redirector */}
              <Route path="/" element={<RootRedirector />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Super Admin Routes */}
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/institutions" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/users" element={<TeachersManagementPage />} />
              <Route path="/super-admin/analytics" element={<PredictionsPage />} />
              <Route path="/super-admin/audit" element={<ReportsPage />} />
              <Route path="/super-admin/settings" element={<AdminSettingsPage />} />

              {/* Administrator Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsManagementPage />} />
              <Route path="/admin/teachers" element={<TeachersManagementPage />} />
              <Route path="/admin/parents" element={<ParentsManagementPage />} />
              <Route path="/admin/classes" element={<ClassesManagementPage />} />
              <Route path="/admin/subjects" element={<SubjectsManagementPage />} />
              <Route path="/admin/materials" element={<TeacherMaterialsPage />} />
              <Route path="/admin/assignments" element={<TeacherAssignmentsPage />} />
              <Route path="/admin/attendance" element={<AttendanceHistoryPage />} />
              <Route path="/admin/risk" element={<RiskEnginePage />} />
              <Route path="/admin/predictions" element={<PredictionsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/alerts" element={<AlertsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />

              {/* Teacher Routes */}
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/materials" element={<TeacherMaterialsPage />} />
              <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
              <Route path="/teacher/doubts" element={<TeacherDoubtsPage />} />
              <Route path="/teacher/attendance" element={<MarkAttendancePage />} />
              <Route path="/teacher/classes" element={<TeacherDashboard />} />
              <Route path="/teacher/history" element={<AttendanceHistoryPage />} />
              <Route path="/teacher/students" element={<TeacherStudentsPage />} />
              <Route path="/teacher/risk" element={<TeacherStudentsPage />} />
              <Route path="/teacher/reports" element={<ReportsPage />} />

              {/* Student Routes */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/learning" element={<StudentLearningHubPage />} />
              <Route path="/student/attendance" element={<StudentAttendancePage />} />
              <Route path="/student/subjects" element={<StudentAttendancePage />} />
              <Route path="/student/history" element={<StudentAttendancePage />} />
              <Route path="/student/prediction" element={<StudentPredictionsPage />} />
              <Route path="/student/risk" element={<StudentRiskPage />} />
              <Route path="/student/recommendations" element={<StudentRecommendationsPage />} />
              <Route path="/student/notifications" element={<StudentNotificationsPage />} />

              {/* Parent Routes */}
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/learning" element={<ParentLearningPage />} />
              <Route path="/parent/student" element={<ParentDashboard />} />
              <Route path="/parent/attendance" element={<ParentDashboard />} />
              <Route path="/parent/risk" element={<ParentDashboard />} />
              <Route path="/parent/prediction" element={<ParentDashboard />} />
              <Route path="/parent/recommendations" element={<ParentDashboard />} />
              <Route path="/parent/notifications" element={<StudentNotificationsPage />} />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
