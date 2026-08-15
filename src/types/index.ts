export type UserRole = 'super_admin' | 'administrator' | 'teacher' | 'student' | 'parent';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AttendanceStatus = 'present' | 'absent';
export type TrendDirection = 'improving' | 'declining' | 'stable';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType = 'low_attendance' | 'high_risk' | 'consecutive_absence' | 'declining_trend' | 'prediction_warning';
export type NotificationType =
  | 'alert'
  | 'system'
  | 'attendance'
  | 'attendance_alert'
  | 'report'
  | 'recommendation'
  | 'warning'
  | 'assignment'
  | 'doubt';

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

// ----------------------------------------------------
// Learning Management Module Types
// ----------------------------------------------------

export type MaterialType = 'note' | 'pdf' | 'presentation' | 'document' | 'image' | 'video' | 'link' | 'other';

export interface LearningMaterial {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description: string;
  topic: string;
  material_type: MaterialType;
  file_name?: string;
  file_path?: string;
  file_url?: string;
  file_size?: number; // In bytes
  mime_type?: string;
  external_url?: string;
  content_text?: string;
  is_published: boolean;
  view_count?: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
}

export type AssignmentSubmissionType = 'file' | 'text' | 'both';
export type SubmissionType = AssignmentSubmissionType;
export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface Assignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description: string;
  instructions: string;
  topic?: string;
  attachment_name?: string;
  attachment_path?: string;
  attachment_url?: string;
  attachment_size?: number;
  start_date: string;
  due_date: string; // ISO string with timestamp
  max_marks: number;
  submission_type: AssignmentSubmissionType;
  allowed_formats?: string[];
  is_published?: boolean;
  status: AssignmentStatus;
  allow_resubmission?: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
  submission_count?: number;
  graded_count?: number;
}

export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'late' | 'graded' | 'returned';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_path?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  text_submission?: string;
  comments?: string;
  submitted_at: string;
  status: SubmissionStatus;
  is_late: boolean;
  marks?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  returned_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  student?: Student;
  assignment?: Assignment;
  grader?: Teacher;
}

export type ProblemCategory =
  | 'concept_doubt'
  | 'assignment_problem'
  | 'attendance_issue'
  | 'subject_difficulty'
  | 'technical_issue'
  | 'study_related'
  | 'other';

export type ProblemPriority = 'low' | 'medium' | 'high';
export type ProblemStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface StudentProblem {
  id: string;
  student_id: string;
  teacher_id?: string;
  subject_id: string;
  class_id?: string;
  title: string;
  description: string;
  category: ProblemCategory;
  priority: ProblemPriority;
  topic?: string;
  attachment_name?: string;
  attachment_path?: string;
  attachment_url?: string;
  attachment_size?: number;
  status: ProblemStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // Joined relations
  student?: Student;
  teacher?: Teacher;
  subject?: Subject;
  responses?: ProblemResponse[];
}

export interface ProblemResponse {
  id: string;
  problem_id: string;
  responder_profile_id: string;
  message: string;
  attachment_name?: string;
  attachment_path?: string;
  attachment_url?: string;
  created_at: string;
  responder?: Profile;
}

export type AcademicActivityLevel = 'Healthy' | 'Moderate' | 'Low';

export interface AcademicActivitySummary {
  student_id: string;
  activity_level: AcademicActivityLevel;
  total_assignments: number;
  submitted_assignments: number;
  late_submissions: number;
  unsubmitted_assignments: number;
  graded_assignments: number;
  average_score_pct: number;
  open_problems_count: number;
  resolved_problems_count: number;
  notes_viewed_count: number;
}

export interface DayDistribution {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  absentCount: number;
  presentCount: number;
  absencePercentage: number;
}

export interface StudentAttendanceDNA {
  student_id: string;
  consistency_score: number; // 0 - 100
  trend_momentum: 'improving' | 'declining' | 'stable';
  absenteeism_archetype: string;
  recovery_potential: 'High' | 'Moderate' | 'Critical';
  persona_tag: string;
  affected_subject_id?: string;
  affected_subject_name?: string;
  recommendation_summary: string;
  day_distribution: DayDistribution[];
  morning_absence_rate: number; // % of misses in period 1
  consecutive_risk_score: number;
}

export interface EarlyWarningRecord {
  student_id: string;
  student_name: string;
  roll_number: string;
  class_name: string;
  current_attendance: number;
  recent_attendance: number;
  predicted_attendance: number;
  trend: 'improving' | 'declining' | 'stable';
  consecutive_absences: number;
  warning_severity: 'imminent_breach' | 'downward_spiral' | 'pattern_alert';
  why_flagged: string[];
  recommended_action: string;
  target_intervention_level: 1 | 2 | 3 | 4;
}

export interface SmartIntervention {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  class_name: string;
  level: 1 | 2 | 3 | 4;
  target_audience: 'student' | 'student_parent' | 'teacher_counseling' | 'administrator_escalation';
  status: 'resolved' | 'monitoring' | 'escalated' | 'new';
  initial_attendance: number;
  post_attendance?: number;
  delta?: number;
  is_successful?: boolean;
  issued_at: string;
  evaluated_at?: string;
  action_summary: string;
  trigger_reason: string;
}

export interface AttendanceBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  is_unlocked: boolean;
  unlocked_at?: string;
  progress_pct: number;
  next_milestone_text: string;
}

export interface AssignmentAiAnalysis {
  completeness_score: number; // 0 - 100
  topic_coverage_score: number; // 0 - 100
  structure_grade: 'Excellent' | 'Good' | 'Needs Improvement';
  grammar_quality: 'High' | 'Moderate' | 'Needs Polish';
  missing_sections: string[];
  strengths: string[];
  suggested_improvements: string[];
  overall_feedback: string;
  analyzed_at: string;
}

// ----------------------------------------------------
// AI Absence Risk Predictor Module Types
// ----------------------------------------------------

export type AbsencePredictionOutcome = 'Likely Present' | 'Likely Absent';
export type DayOfWeekName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type ActualOutcomeStatus = 'correct' | 'incorrect' | 'pending';

export interface PredictionFactor {
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface RecoveryPlanData {
  current_attendance: number;
  target_attendance: number; // 75% default
  classes_required: number;
  action_summary: string;
}

export interface AbsencePredictionInput {
  student_id: string;
  student_name?: string;
  roll_number?: string;
  class_id: string;
  subject_id: string;
  target_date: string; // YYYY-MM-DD
  overall_attendance_pct: number; // 0 to 100
  subject_attendance_pct: number; // 0 to 100
  recent_attendance_pct: number; // 0 to 100
  classes_attended: number;
  classes_missed: number;
  total_classes: number;
  absences_last_7_days: number;
  absences_last_14_days: number;
  absences_last_30_days: number;
  consecutive_absences: number;
  recent_streak: number; // consecutive present
  previous_class_status: 'present' | 'absent';
  day_of_week: DayOfWeekName;
  day_of_week_absence_rate: number; // 0 to 100
  trend: 'increasing' | 'stable' | 'declining';
  // Optional behavioral factors
  late_attendance_frequency?: number;
  recent_leave_frequency?: number;
  assignment_completion_rate?: number;
  recent_academic_activity?: 'Healthy' | 'Moderate' | 'Low';
}

export interface AbsencePrediction {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  prediction_date: string; // ISO string
  target_date: string; // YYYY-MM-DD
  absence_probability: number; // 0 - 100
  attendance_probability: number; // 0 - 100 (sum = 100)
  prediction: AbsencePredictionOutcome;
  risk_level: RiskLevel;
  confidence: number; // 0 - 100
  confidence_note: string;
  explanation: string;
  factors: PredictionFactor[];
  recommendation: string;
  algorithm_version: string; // e.g. "rule-based-absence-v1"
  actual_result?: ActualOutcomeStatus;
  evaluated_at?: string;
  actual_attendance_status?: AttendanceStatus;
  created_by?: string;
  created_at: string;
  recovery_plan?: RecoveryPlanData;
  // Joined relation fields
  student?: Student;
  subject?: Subject;
  class?: Class;
}

export interface PredictionPerformanceMetrics {
  total_predictions: number;
  evaluated_predictions: number;
  pending_predictions: number;
  correct_predictions: number;
  incorrect_predictions: number;
  present_predictions: number;
  absent_predictions: number;
  true_positives: number; // Predicted Absent, Actual Absent
  true_negatives: number; // Predicted Present, Actual Present
  false_positives: number; // Predicted Absent, Actual Present
  false_negatives: number; // Predicted Present, Actual Absent
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN)
  f1_score: number; // 2 * (P * R) / (P + R)
  accuracy: number; // (TP + TN) / Evaluated
  has_sufficient_data: boolean;
}



