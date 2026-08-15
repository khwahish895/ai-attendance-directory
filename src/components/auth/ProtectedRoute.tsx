import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { error } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-3 border-[#6E63FF] border-t-transparent rounded-full animate-spin shadow-lg shadow-[#6E63FF]/30" />
        <span className="text-xs text-slate-400 font-mono">Authenticating session...</span>
      </div>
    );
  }

  // 1. Unauthenticated -> Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check -> Prevent unauthorized cross-role access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Determine the safe fallback route for current role
    let safeRoute = '/login';
    if (role === 'super_admin') safeRoute = '/super-admin';
    else if (role === 'administrator') safeRoute = '/admin';
    else if (role === 'teacher') safeRoute = '/teacher';
    else if (role === 'student') safeRoute = '/student';
    else if (role === 'parent') safeRoute = '/parent';

    // Show warning toast once
    setTimeout(() => {
      error(`Access Denied: Your ${role.replace('_', ' ')} profile cannot access this portal area.`);
    }, 100);

    return <Navigate to={safeRoute} replace />;
  }

  return <>{children}</>;
};
