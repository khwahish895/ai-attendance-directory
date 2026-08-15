import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { dataStore } from '../lib/dataProvider';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (targetRole: UserRole) => void;
  logout: () => void;
  registerStudent: (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    studentId: string;
    rollNumber: string;
    department: string;
    classId?: string;
    semester: number;
  }) => Promise<{ success: boolean; error?: string }>;
  registerParent: (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    relationship: 'Father' | 'Mother' | 'Guardian';
    wardRollNumber?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ai_attendance_auth_user_id';
const REMEMBER_SESSION_KEY = 'ai_attendance_remember_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage or sessionStorage
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      const found = dataStore.getProfileById(savedUserId);
      if (found) {
        setUser(found);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password?: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const cleanEmail = email.trim().toLowerCase();
    const found = dataStore.getProfiles().find(p => p.email.toLowerCase() === cleanEmail);

    if (!found) {
      setIsLoading(false);
      return { success: false, error: 'Invalid email or user not found in institutional directory.' };
    }

    // Check account status if present
    if ((found as any).status === 'disabled' || (found as any).status === 'suspended') {
      setIsLoading(false);
      return { success: false, error: 'Your account has been disabled. Please contact administrator.' };
    }

    // Set session
    setUser(found);
    if (remember) {
      localStorage.setItem(CURRENT_USER_KEY, found.id);
      localStorage.setItem(REMEMBER_SESSION_KEY, 'true');
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, found.id);
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    setIsLoading(false);
    return { success: true };
  };

  const loginAsRole = (targetRole: UserRole) => {
    setIsLoading(true);
    const profiles = dataStore.getProfiles();
    const profile = profiles.find(p => p.role === targetRole);
    if (profile) {
      setUser(profile);
      localStorage.setItem(CURRENT_USER_KEY, profile.id);
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(REMEMBER_SESSION_KEY);
  };

  const registerStudent = async (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    studentId: string;
    rollNumber: string;
    department: string;
    classId?: string;
    semester: number;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const cleanEmail = data.email.trim().toLowerCase();
    if (dataStore.getProfiles().some(p => p.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const defaultClass = dataStore.getClasses()[0];
    const newStudent = dataStore.addStudent({
      fullName: data.fullName.trim(),
      email: cleanEmail,
      studentId: data.studentId.trim() || `STU-${Date.now().toString().slice(-4)}`,
      rollNumber: data.rollNumber.trim() || `ROL-${Date.now().toString().slice(-3)}`,
      classId: data.classId || (defaultClass ? defaultClass.id : 'cls-1'),
      department: data.department || 'Computer Science',
      semester: data.semester || 4,
    });

    if (newStudent.profile) {
      setUser(newStudent.profile);
      localStorage.setItem(CURRENT_USER_KEY, newStudent.profile.id);
    }

    setIsLoading(false);
    return { success: true };
  };

  const registerParent = async (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    relationship: 'Father' | 'Mother' | 'Guardian';
    wardRollNumber?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const cleanEmail = data.email.trim().toLowerCase();
    if (dataStore.getProfiles().some(p => p.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Try linking with student if roll number given
    let studentId = '';
    if (data.wardRollNumber) {
      const studentMatch = dataStore.getStudents().find(
        s =>
          s.roll_number.toLowerCase() === data.wardRollNumber?.toLowerCase().trim() ||
          s.student_id.toLowerCase() === data.wardRollNumber?.toLowerCase().trim()
      );
      if (studentMatch) {
        studentId = studentMatch.id;
      }
    }

    // If no specific match found, attach to first student as sample link
    if (!studentId && dataStore.getStudents().length > 0) {
      studentId = dataStore.getStudents()[0].id;
    }

    const newParent = dataStore.addParent({
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      studentId: studentId || 'stu-1',
      relationship: data.relationship,
    });

    if (newParent.profile) {
      setUser(newParent.profile);
      localStorage.setItem(CURRENT_USER_KEY, newParent.profile.id);
    }

    setIsLoading(false);
    return { success: true };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = data.email.trim().toLowerCase();
    if (dataStore.getProfiles().some(p => p.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'Email already exists. Please choose another.' };
    }

    if (data.role === 'student') {
      return registerStudent({
        fullName: data.fullName,
        email: cleanEmail,
        phone: '555-0100',
        studentId: `STU-${Date.now().toString().slice(-4)}`,
        rollNumber: `ROL-${Date.now().toString().slice(-3)}`,
        department: data.department || 'Computer Science',
        semester: 4,
      });
    } else if (data.role === 'parent') {
      return registerParent({
        fullName: data.fullName,
        email: cleanEmail,
        phone: '555-0199',
        relationship: 'Guardian',
      });
    } else {
      // General user profile creation
      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        full_name: data.fullName,
        email: cleanEmail,
        role: data.role,
        department: data.department,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataStore.getProfiles().push(newProfile);
      setUser(newProfile);
      localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
      setIsLoading(false);
      return { success: true };
    }
  };

  const resetPassword = async (
    email: string,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const cleanEmail = email.trim().toLowerCase();
    const found = dataStore.getProfiles().find(p => p.email.toLowerCase() === cleanEmail);
    setIsLoading(false);
    if (!found) {
      return { success: false, error: 'No account registered with this email address.' };
    }
    return { success: true };
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsRole,
        logout,
        registerStudent,
        registerParent,
        register,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
