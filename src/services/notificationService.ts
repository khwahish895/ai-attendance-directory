import { Alert, AlertSeverity, AlertType, Notification, NotificationType } from '../types';
import { dataStore } from '../lib/dataProvider';

export interface AlertGenerationContext {
  studentId: string;
  studentName: string;
  attendancePercentage: number;
  consecutiveAbsences: number;
  predictedAttendance: number;
  trend: 'improving' | 'declining' | 'stable';
  teacherProfileId?: string;
  parentProfileId?: string;
  studentProfileId?: string;
}

/**
 * Automatically evaluates attendance conditions and generates alerts and notifications.
 */
export function generateSystemAlertsAndNotifications(
  context: AlertGenerationContext
): { alerts: Alert[]; notifications: Notification[] } {
  const alerts: Alert[] = [];
  const notifications: Notification[] = [];
  const now = new Date().toISOString();

  const {
    studentId,
    studentName,
    attendancePercentage,
    consecutiveAbsences,
    predictedAttendance,
    trend,
    teacherProfileId,
    parentProfileId,
    studentProfileId,
  } = context;

  // 1. Critical Low Attendance Alert
  if (attendancePercentage < 75.0) {
    alerts.push({
      id: `alert-low-${studentId}-${Date.now()}`,
      student_id: studentId,
      type: 'low_attendance',
      title: 'Critical Low Attendance Warning',
      message: `${studentName}'s attendance has dropped to ${attendancePercentage}%, breaching the minimum 75% requirement.`,
      severity: 'high',
      is_read: false,
      created_at: now,
    });

    if (parentProfileId) {
      notifications.push({
        id: `notif-parent-low-${Date.now()}`,
        recipient_profile_id: parentProfileId,
        title: 'Attendance Alert for Your Child',
        message: `Your child ${studentName}'s attendance is at ${attendancePercentage}%. Immediate attention is advised.`,
        type: 'alert',
        is_read: false,
        created_at: now,
      });
    }

    if (studentProfileId) {
      notifications.push({
        id: `notif-stud-low-${Date.now()}`,
        recipient_profile_id: studentProfileId,
        title: 'Attendance Threshold Warning',
        message: `Your attendance is ${attendancePercentage}%. Attend upcoming lectures to maintain exam eligibility.`,
        type: 'alert',
        is_read: false,
        created_at: now,
      });
    }
  }

  // 2. Consecutive Absences Alert
  if (consecutiveAbsences >= 3) {
    alerts.push({
      id: `alert-cons-${studentId}-${Date.now()}`,
      student_id: studentId,
      type: 'consecutive_absence',
      title: 'Frequent Consecutive Absences',
      message: `${studentName} has missed ${consecutiveAbsences} consecutive class sessions.`,
      severity: consecutiveAbsences >= 4 ? 'high' : 'medium',
      is_read: false,
      created_at: now,
    });

    if (teacherProfileId) {
      notifications.push({
        id: `notif-teacher-cons-${Date.now()}`,
        recipient_profile_id: teacherProfileId,
        title: 'Student Consecutive Absence Check',
        message: `${studentName} has missed ${consecutiveAbsences} consecutive classes. Follow-up recommended.`,
        type: 'alert',
        is_read: false,
        created_at: now,
      });
    }
  }

  // 3. Predicted Attendance Drop Warning
  if (predictedAttendance < 75.0 && attendancePercentage >= 75.0) {
    alerts.push({
      id: `alert-pred-${studentId}-${Date.now()}`,
      student_id: studentId,
      type: 'prediction_warning',
      title: 'Forecasted Attendance Risk',
      message: `Statistical projection indicates ${studentName}'s attendance will drop to ${predictedAttendance}% by semester end.`,
      severity: 'medium',
      is_read: false,
      created_at: now,
    });
  }

  // 4. Declining Trend Alert
  if (trend === 'declining' && attendancePercentage < 82.0) {
    alerts.push({
      id: `alert-trend-${studentId}-${Date.now()}`,
      student_id: studentId,
      type: 'declining_trend',
      title: 'Negative Attendance Velocity',
      message: `Recent attendance velocity for ${studentName} is trending downward.`,
      severity: 'medium',
      is_read: false,
      created_at: now,
    });
  }

  return { alerts, notifications };
}

export const notificationService = {
  generateSystemAlertsAndNotifications,
  notifyStudentRiskAlert: (studentId: string, nameOrRiskData?: any, customMessage?: string) => {
    const student = dataStore.getStudentById(studentId);
    const profile = student?.profile;
    const parent = student?.parent_id ? dataStore.getParentByProfileId(student.parent_id) : undefined;
    const risk = dataStore.getRiskAssessmentForStudent(studentId);

    const studentName = typeof nameOrRiskData === 'string'
      ? nameOrRiskData
      : (profile?.full_name || student?.roll_number || 'Student');

    const riskData = typeof nameOrRiskData === 'object' ? nameOrRiskData : (risk || {});

    const result = generateSystemAlertsAndNotifications({
      studentId,
      studentName,
      attendancePercentage: riskData.attendance_percentage ?? riskData.attendancePercentage ?? (risk?.attendance_percentage || 70),
      consecutiveAbsences: riskData.consecutive_absences ?? riskData.consecutiveAbsences ?? (risk?.consecutive_absences || 0),
      predictedAttendance: riskData.predicted_attendance ?? riskData.predictedAttendance ?? (risk?.predicted_attendance || 70),
      trend: riskData.attendance_trend ?? riskData.trend ?? (risk?.attendance_trend || 'declining'),
      teacherProfileId: 'usr-teacher-1',
      parentProfileId: parent?.profile_id,
      studentProfileId: profile?.id,
    });

    if (customMessage && profile?.id) {
      notificationService.sendCustomNotification({
        recipientProfileId: profile.id,
        title: 'Institutional Attendance Notice',
        message: customMessage,
        type: 'alert',
      });
    }

    return result;
  },
  sendCustomNotification: (data: { recipientProfileId: string; title: string; message: string; type: NotificationType }) => {
    const notif: Notification = {
      id: `notif-custom-${Date.now()}`,
      recipient_profile_id: data.recipientProfileId,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const notifications = dataStore.getNotifications();
    notifications.unshift(notif);
    return notif;
  }
};
