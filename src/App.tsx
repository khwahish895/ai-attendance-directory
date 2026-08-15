import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth & Splash Pages
import { SplashScreen } from './pages/auth/SplashScreen';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

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
import { AiCommandCenterPage } from './pages/admin/AiCommandCenterPage';
import { AbsenceHeatmapPage } from './pages/admin/AbsenceHeatmapPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { MarkAttendancePage } from './pages/teacher/MarkAttendancePage';
import { AttendanceHistoryPage } from './pages/teacher/AttendanceHistoryPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherDoubtsPage } from './pages/teacher/TeacherDoubtsPage';
import { AbsencePredictorPage } from './pages/teacher/AbsencePredictorPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentPredictionsPage } from './pages/student/StudentPredictionsPage';
import { StudentRiskPage } from './pages/student/StudentRiskPage';
import { StudentRecommendationsPage } from './pages/student/StudentRecommendationsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentLearningHubPage } from './pages/student/StudentLearningHubPage';
import { StudentAbsencePredictorPage } from './pages/student/StudentAbsencePredictorPage';

// Parent Pages
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentLearningPage } from './pages/parent/ParentLearningPage';
import { ParentAbsencePredictorPage } from './pages/parent/ParentAbsencePredictorPage';

// Common Pages
import { ProfilePage } from './pages/common/ProfilePage';
import { NotFoundPage } from './pages/common/NotFoundPage';
import { WhatIfSimulatorPage } from './pages/common/WhatIfSimulatorPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* 1. Splash Screen - The Very First Page (/) */}
            <Route path="/" element={<SplashScreen />} />

            {/* 2. Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 3. Protected Application Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Profile & Common Tools */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/simulator" element={<WhatIfSimulatorPage />} />

              {/* Super Admin Routes */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/institutions"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/users"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <TeachersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <PredictionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/command-center"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AiCommandCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/heatmap"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AbsenceHeatmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <StudentsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <TeachersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parents"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <ParentsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <ClassesManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <SubjectsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/materials"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <TeacherMaterialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <TeacherAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AttendanceHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/risk"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <RiskEnginePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/predictions"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <PredictionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/absence-predictor"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/alerts"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['administrator', 'super_admin']}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/absence-predictor"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <AbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/materials"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherMaterialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/doubts"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDoubtsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <MarkAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/history"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <AttendanceHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/risk"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/learning"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLearningHubPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/subjects"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/history"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/prediction"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/absence-predictor"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/risk"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentRiskPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentRecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notifications"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentNotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Parent Routes */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/learning"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentLearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/student"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/attendance"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/risk"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/prediction"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentAbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/absence-predictor"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentAbsencePredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/notifications"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <StudentNotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
