import { Assignment, AssignmentSubmission, LearningMaterial, StudentProblem } from '../types';

export interface DeadlineInfo {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // within 48 hours
  timeLeftFormatted: string;
  badgeVariant: 'danger' | 'warning' | 'primary' | 'neutral';
}

/**
 * Calculates human-readable deadline time left and status flags.
 */
export function getDeadlineInfo(dueDateIso: string): DeadlineInfo {
  const now = new Date().getTime();
  const due = new Date(dueDateIso).getTime();
  const diffMs = due - now;

  if (diffMs <= 0) {
    const hoursAgo = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);
    const label = daysAgo > 0 ? `${daysAgo}d ago` : `${hoursAgo}h ago`;
    return {
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      timeLeftFormatted: `Overdue by ${label}`,
      badgeVariant: 'danger',
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  if (hoursLeft < 24) {
    return {
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      timeLeftFormatted: hoursLeft === 0 ? 'Due in <1 hour' : `Due in ${hoursLeft}h`,
      badgeVariant: 'danger',
    };
  }

  if (daysLeft <= 2) {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      timeLeftFormatted: `Due in ${daysLeft}d ${hoursLeft % 24}h`,
      badgeVariant: 'warning',
    };
  }

  return {
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
    timeLeftFormatted: `Due in ${daysLeft} days`,
    badgeVariant: 'primary',
  };
}

/**
 * Maps material type to human label, badge color, and icon hint.
 */
export function getMaterialTypeMeta(type: string): { label: string; bg: string; text: string; iconType: string } {
  switch (type) {
    case 'pdf':
      return { label: 'PDF Document', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-600 dark:text-rose-400', iconType: 'file-text' };
    case 'presentation':
      return { label: 'Presentation (PPT)', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', iconType: 'presentation' };
    case 'document':
      return { label: 'Word Document', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', iconType: 'file' };
    case 'image':
      return { label: 'Image Diagram', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', iconType: 'image' };
    case 'video':
      return { label: 'Video Lecture', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', iconType: 'video' };
    case 'link':
      return { label: 'Web Link', bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', iconType: 'link' };
    case 'note':
    default:
      return { label: 'Lecture Note', bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', iconType: 'book-open' };
  }
}

/**
 * Maps problem category to human title.
 */
export function formatProblemCategory(category: string): string {
  switch (category) {
    case 'concept_doubt':
      return 'Conceptual Doubt';
    case 'assignment_problem':
      return 'Assignment Issue';
    case 'attendance_issue':
      return 'Attendance Discrepancy';
    case 'subject_difficulty':
      return 'Subject Difficulty';
    case 'technical_issue':
      return 'Technical Issue';
    case 'study_related':
      return 'Study Strategy';
    default:
      return 'General Query';
  }
}

/**
 * Calculates submission completion statistics.
 */
export function calculateAssignmentStats(assignments: Assignment[], submissions: AssignmentSubmission[]) {
  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const graded = submissions.filter(s => s.status === 'graded');
  const late = submissions.filter(s => s.is_late || s.status === 'late');
  
  const avgScore = graded.length > 0
    ? Number((graded.reduce((acc, s) => acc + (s.marks || 0), 0) / graded.length).toFixed(1))
    : 0;

  return {
    totalAssignments,
    totalSubmissions,
    gradedCount: graded.length,
    lateCount: late.length,
    averageScore: avgScore,
  };
}
