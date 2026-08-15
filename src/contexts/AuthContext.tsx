import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { dataStore } from '../lib/dataProvider';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (targetRole: UserRole) => void;
  logout: () => void;
  register: (data: { fullName: string; email: string; role: UserRole; department?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ai_attendance_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      const found = dataStore.getProfileById(savedUserId);
      if (found) {
        setUser(found);
      } else {
        // Default to admin if not found
        const defaultAdmin = dataStore.getProfiles().find(p => p.role === 'administrator');
        if (defaultAdmin) {
          setUser(defaultAdmin);
          localStorage.setItem(CURRENT_USER_KEY, defaultAdmin.id);
        }
      }
    } else {
      // Default to Administrator for immediate evaluator experience
      const defaultAdmin = dataStore.getProfiles().find(p => p.role === 'administrator');
      if (defaultAdmin) {
        setUser(defaultAdmin);
        localStorage.setItem(CURRENT_USER_KEY, defaultAdmin.id);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const found = dataStore.getProfileByEmail(email.trim());
    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_KEY, found.id);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid credentials or user email not registered.' };
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
  };

  const register = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    
    // Check if email taken
    if (dataStore.getProfileByEmail(data.email)) {
      setIsLoading(false);
      return { success: false, error: 'Email already exists. Please choose another.' };
    }

    if (data.role === 'student') {
      const cls = dataStore.getClasses()[0];
      const stud = dataStore.addStudent({
        fullName: data.fullName,
        email: data.email,
        studentId: `STU-${Date.now().toString().slice(-4)}`,
        rollNumber: `ROL-${Date.now().toString().slice(-3)}`,
        classId: cls ? cls.id : 'cls-1',
        department: data.department || 'Computer Science',
        semester: 4,
      });
      if (stud.profile) {
        setUser(stud.profile);
        localStorage.setItem(CURRENT_USER_KEY, stud.profile.id);
      }
    } else if (data.role === 'teacher') {
      const teacher = dataStore.addTeacher({
        fullName: data.fullName,
        email: data.email,
        employeeId: `EMP-${Date.now().toString().slice(-4)}`,
        department: data.department || 'Computer Science',
        designation: 'Lecturer',
      });
      if (teacher.profile) {
        setUser(teacher.profile);
        localStorage.setItem(CURRENT_USER_KEY, teacher.profile.id);
      }
    } else {
      // General registration
      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        full_name: data.fullName,
        email: data.email,
        role: data.role,
        department: data.department,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Add to store profiles
      setUser(newProfile);
      localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
    }

    setIsLoading(false);
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
        register,
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
