export type UserRole = 'super_admin' | 'administrator' | 'teacher' | 'student' | 'parent';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AttendanceStatus = 'present' | 'absent';
export type TrendDirection = 'improving' | 'declining' | 'stable';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType = 'low_attendance' | 'high_risk' | 'consecutive_absence' | 'declining_trend' | 'prediction_warning';
export type NotificationType = 'alert' | 'system' | 'attendance' | 'report';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  institution_id?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  contact_email: string;
  student_count: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  student_id: string;
  roll_number: string;
  class_id: string;
  department: string;
  semester: number;
  admission_year: number;
  parent_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // Joined relation fields
  profile?: Profile;
  class?: Class;
  parent?: Parent;
}

export interface Teacher {
  id: string;
  profile_id: string;
  employee_id: string;
  department: string;
  designation: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Parent {
  id: string;
  profile_id: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  created_at: string;
  updated_at: string;
  profile?: Profile;
  students?: Student[];
}

export interface Class {
  id: string;
  name: string;
  section: string;
  department: string;
  semester: number;
  academic_year: string;
  class_teacher_id?: string;
  created_at: string;
  updated_at: string;
  class_teacher?: Teacher;
  student_count?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  semester: number;
  created_at: string;
  student?: Student;
  subject?: Subject;
  class?: Class;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  semester: number;
  created_at: string;
  teacher?: Teacher;
  class?: Class;
  subject?: Subject;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  subject?: Subject;
  class?: Class;
  teacher?: Teacher;
}

export interface AttendanceSummary {
  id: string;
  student_id: string;
  subject_id?: string;
  total_classes: number;
  present_classes: number;
  absent_classes: number;
  attendance_percentage: number;
  updated_at: string;
  subject?: Subject;
}

export interface RiskAssessment {
  id: string;
  student_id: string;
  attendance_percentage: number;
  recent_attendance_percentage: number;
  recent_absences: number;
  consecutive_absences: number;
  attendance_trend: TrendDirection;
  predicted_attendance: number;
  risk_score: number; // 0 to 100
  risk_level: RiskLevel;
  reasons: string[];
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface Prediction {
  id: string;
  student_id: string;
  prediction_period: string; // e.g. "Next 30 Days" or "Semester End"
  predicted_attendance: number;
  confidence: number; // 0 to 100
  predicted_risk_level: RiskLevel;
  algorithm_version: string; // "rule-based-v1"
  trend: TrendDirection;
  explanation: string;
  created_at: string;
  student?: Student;
}

export interface Alert {
  id: string;
  student_id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  created_at: string;
  student?: Student;
}

export interface Notification {
  id: string;
  recipient_profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  student_id: string;
  category: 'academic' | 'intervention' | 'attendance' | 'counseling';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  actionable_steps: string[];
  target_audience: 'student' | 'teacher' | 'parent' | 'admin';
}
