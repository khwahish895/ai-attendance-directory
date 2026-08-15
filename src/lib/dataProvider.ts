import {
  Alert,
  Attendance,
  AttendanceSummary,
  AuditLog,
  Class,
  Enrollment,
  Institution,
  Notification,
  Parent,
  Prediction,
  Profile,
  RiskAssessment,
  Student,
  Subject,
  Teacher,
  TeacherAssignment,
  UserRole,
  LearningMaterial,
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
  StudentProblem,
  ProblemResponse,
  ProblemStatus,
  AcademicActivitySummary,
  AbsencePrediction,
  AttendanceStatus,
  RiskLevel,
} from '../types';
import { computeRiskAssessment } from '../services/riskService';
import { predictStudentAttendance } from '../services/predictionService';
import { generateSystemAlertsAndNotifications } from '../services/notificationService';

const STORAGE_KEY = 'ai_attendance_system_v1_db';

// Realistic Initial Database State
function generateInitialData() {
  const institutions: Institution[] = [
    {
      id: 'inst-1',
      name: 'Apex Institute of Technology & AI',
      code: 'APEX-TECH',
      city: 'San Francisco',
      state: 'CA',
      contact_email: 'admin@apextech.edu',
      student_count: 1420,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'inst-2',
      name: 'Pacific Metropolitan University',
      code: 'PMU-ACAD',
      city: 'Seattle',
      state: 'WA',
      contact_email: 'office@pmu.edu',
      student_count: 2850,
      status: 'active',
      created_at: '2026-01-15T00:00:00Z',
    },
  ];

  const profiles: Profile[] = [
    {
      id: 'usr-superadmin',
      full_name: 'Dr. Eleanor Vance',
      email: 'superadmin@apextech.edu',
      phone: '+1 (555) 019-2834',
      role: 'super_admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Executive Leadership',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-admin',
      full_name: 'Marcus Wright',
      email: 'admin@apextech.edu',
      phone: '+1 (555) 014-9821',
      role: 'administrator',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Academic Operations',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-teacher-1',
      full_name: 'Prof. Alan Turing',
      email: 'turing@apextech.edu',
      phone: '+1 (555) 018-4729',
      role: 'teacher',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-teacher-2',
      full_name: 'Prof. Ada Lovelace',
      email: 'ada@apextech.edu',
      phone: '+1 (555) 017-3819',
      role: 'teacher',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Data Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-parent-1',
      full_name: 'Robert Johnson',
      email: 'robert.johnson@email.com',
      phone: '+1 (555) 012-7643',
      role: 'parent',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-parent-2',
      full_name: 'Elena Rodriguez',
      email: 'elena.rodriguez@email.com',
      phone: '+1 (555) 016-5432',
      role: 'parent',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    // Student Profiles
    {
      id: 'usr-student-1',
      full_name: 'Alex Mercer',
      email: 'alex.mercer@apextech.edu',
      phone: '+1 (555) 019-3321',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-2',
      full_name: 'Sophia Chen',
      email: 'sophia.chen@apextech.edu',
      phone: '+1 (555) 019-8877',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-3',
      full_name: 'Ethan Davis',
      email: 'ethan.davis@apextech.edu',
      phone: '+1 (555) 018-9922',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-4',
      full_name: 'Liam Johnson',
      email: 'liam.johnson@apextech.edu',
      phone: '+1 (555) 012-7644',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-5',
      full_name: 'Mia Rodriguez',
      email: 'mia.rodriguez@apextech.edu',
      phone: '+1 (555) 016-5433',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Computer Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-6',
      full_name: 'Noah Williams',
      email: 'noah.williams@apextech.edu',
      phone: '+1 (555) 014-4321',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Data Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-7',
      full_name: 'Emma Watson',
      email: 'emma.watson@apextech.edu',
      phone: '+1 (555) 015-6789',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Data Science',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-student-8',
      full_name: 'Lucas Miller',
      email: 'lucas.miller@apextech.edu',
      phone: '+1 (555) 017-8901',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      institution_id: 'inst-1',
      department: 'Cyber Security',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const teachers: Teacher[] = [
    {
      id: 'teach-1',
      profile_id: 'usr-teacher-1',
      employee_id: 'EMP-CS-001',
      department: 'Computer Science',
      designation: 'Senior Professor',
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'teach-2',
      profile_id: 'usr-teacher-2',
      employee_id: 'EMP-DS-002',
      department: 'Data Science',
      designation: 'Associate Professor',
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const parents: Parent[] = [
    {
      id: 'parent-1',
      profile_id: 'usr-parent-1',
      relationship: 'Father',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'parent-2',
      profile_id: 'usr-parent-2',
      relationship: 'Mother',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const classes: Class[] = [
    {
      id: 'cls-1',
      name: 'CS-4A',
      section: 'A',
      department: 'Computer Science',
      semester: 4,
      academic_year: '2025-2026',
      class_teacher_id: 'teach-1',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
      student_count: 5,
    },
    {
      id: 'cls-2',
      name: 'DS-4B',
      section: 'B',
      department: 'Data Science',
      semester: 4,
      academic_year: '2025-2026',
      class_teacher_id: 'teach-2',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
      student_count: 2,
    },
    {
      id: 'cls-3',
      name: 'CY-4A',
      section: 'A',
      department: 'Cyber Security',
      semester: 4,
      academic_year: '2025-2026',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
      student_count: 1,
    },
  ];

  const subjects: Subject[] = [
    {
      id: 'sub-1',
      name: 'Artificial Intelligence & ML',
      code: 'CS401',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'sub-2',
      name: 'Database Management Systems',
      code: 'CS402',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'sub-3',
      name: 'Operating Systems & Kernel',
      code: 'CS403',
      department: 'Computer Science',
      semester: 4,
      credits: 3,
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'sub-4',
      name: 'Design & Analysis of Algorithms',
      code: 'CS404',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const teacherAssignments: TeacherAssignment[] = [
    {
      id: 'ta-1',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-1',
      academic_year: '2025-2026',
      semester: 4,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'ta-2',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-2',
      academic_year: '2025-2026',
      semester: 4,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'ta-3',
      teacher_id: 'teach-2',
      class_id: 'cls-2',
      subject_id: 'sub-1',
      academic_year: '2025-2026',
      semester: 4,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'ta-4',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-3',
      academic_year: '2025-2026',
      semester: 4,
      created_at: '2026-01-10T00:00:00Z',
    },
  ];

  const students: Student[] = [
    {
      id: 'stud-1',
      profile_id: 'usr-student-1',
      student_id: 'STU-2024-0101',
      roll_number: 'CS-101',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-2',
      profile_id: 'usr-student-2',
      student_id: 'STU-2024-0102',
      roll_number: 'CS-102',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-3',
      profile_id: 'usr-student-3',
      student_id: 'STU-2024-0103',
      roll_number: 'CS-103',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-4',
      profile_id: 'usr-student-4',
      student_id: 'STU-2024-0104',
      roll_number: 'CS-104',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      parent_id: 'parent-1',
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-5',
      profile_id: 'usr-student-5',
      student_id: 'STU-2024-0105',
      roll_number: 'CS-105',
      class_id: 'cls-1',
      department: 'Computer Science',
      semester: 4,
      admission_year: 2024,
      parent_id: 'parent-2',
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-6',
      profile_id: 'usr-student-6',
      student_id: 'STU-2024-0201',
      roll_number: 'DS-201',
      class_id: 'cls-2',
      department: 'Data Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-7',
      profile_id: 'usr-student-7',
      student_id: 'STU-2024-0202',
      roll_number: 'DS-202',
      class_id: 'cls-2',
      department: 'Data Science',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'stud-8',
      profile_id: 'usr-student-8',
      student_id: 'STU-2024-0301',
      roll_number: 'CY-301',
      class_id: 'cls-3',
      department: 'Cyber Security',
      semester: 4,
      admission_year: 2024,
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const enrollments: Enrollment[] = [];
  students.forEach(s => {
    subjects.forEach(sub => {
      enrollments.push({
        id: `enr-${s.id}-${sub.id}`,
        student_id: s.id,
        class_id: s.class_id,
        subject_id: sub.id,
        academic_year: '2025-2026',
        semester: s.semester,
        created_at: '2026-01-10T00:00:00Z',
      });
    });
  });

  // Generate 35 realistic calendar dates across the past 2 months
  const dates: string[] = [];
  const baseDate = new Date('2026-06-01');
  for (let i = 0; i < 45; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    // Monday to Friday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }

  // Generate Attendance records with distinct patterns for realistic demonstration:
  // stud-1 (Alex Mercer): 94% present (LOW Risk)
  // stud-2 (Sophia Chen): 88% present (LOW Risk)
  // stud-3 (Ethan Davis): 79% present (MEDIUM Risk)
  // stud-4 (Liam Johnson): 67% present (HIGH Risk - low attendance)
  // stud-5 (Mia Rodriguez): 62% present + 4 consecutive absences at the end (HIGH Risk)
  // stud-6 (Noah Williams): 77% present with declining trend (MEDIUM Risk)
  // stud-7 (Emma Watson): 92% present (LOW Risk)
  // stud-8 (Lucas Miller): 58% critical (HIGH Risk)

  const attendance: Attendance[] = [];

  students.forEach(student => {
    dates.forEach((dateStr, idx) => {
      let isPresent = true;
      const isRecent = idx >= dates.length - 8;
      const isVeryRecent = idx >= dates.length - 4;

      if (student.id === 'stud-1') {
        // High 94%
        isPresent = idx % 17 !== 0;
      } else if (student.id === 'stud-2') {
        // Healthy 88%
        isPresent = idx % 9 !== 0;
      } else if (student.id === 'stud-3') {
        // Borderline 79%
        isPresent = idx % 5 !== 0;
      } else if (student.id === 'stud-4') {
        // High Risk 67%
        isPresent = idx % 3 !== 0;
      } else if (student.id === 'stud-5') {
        // 4 Consecutive Absences at end + sporadic absences
        if (isVeryRecent) {
          isPresent = false;
        } else {
          isPresent = idx % 3 !== 0;
        }
      } else if (student.id === 'stud-6') {
        // Declining Trend: high attendance early, missed most recent classes
        if (isRecent) {
          isPresent = idx % 2 === 0;
        } else {
          isPresent = idx % 10 !== 0;
        }
      } else if (student.id === 'stud-7') {
        // 92%
        isPresent = idx % 12 !== 0;
      } else if (student.id === 'stud-8') {
        // 58% Critical
        isPresent = idx % 2 === 0;
      }

      // Default subject is sub-1 (AI & ML)
      attendance.push({
        id: `att-${student.id}-sub1-${dateStr}`,
        student_id: student.id,
        class_id: student.class_id,
        subject_id: 'sub-1',
        teacher_id: 'teach-1',
        attendance_date: dateStr,
        status: isPresent ? 'present' : 'absent',
        remarks: isPresent ? 'Present in lecture' : 'Unexcused absence',
        created_at: `${dateStr}T09:00:00Z`,
        updated_at: `${dateStr}T09:00:00Z`,
      });

      // Subject 2 (DBMS) on alternating dates
      if (idx % 2 === 0) {
        attendance.push({
          id: `att-${student.id}-sub2-${dateStr}`,
          student_id: student.id,
          class_id: student.class_id,
          subject_id: 'sub-2',
          teacher_id: 'teach-1',
          attendance_date: dateStr,
          status: isPresent ? 'present' : 'absent',
          remarks: isPresent ? 'Attended lab session' : 'Absent from lab',
          created_at: `${dateStr}T11:00:00Z`,
          updated_at: `${dateStr}T11:00:00Z`,
        });
      }
    });
  });

  // Calculate summaries, risk assessments, and predictions for each student
  const attendanceSummaries: AttendanceSummary[] = [];
  const riskAssessments: RiskAssessment[] = [];
  const predictions: Prediction[] = [];
  const alerts: Alert[] = [];
  const notifications: Notification[] = [];

  students.forEach(student => {
    const studentRecords = attendance.filter(a => a.student_id === student.id);
    const presentCount = studentRecords.filter(a => a.status === 'present').length;
    const totalCount = studentRecords.length;
    const overallPct = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 0;

    // Overall summary
    attendanceSummaries.push({
      id: `sum-${student.id}-all`,
      student_id: student.id,
      total_classes: totalCount,
      present_classes: presentCount,
      absent_classes: totalCount - presentCount,
      attendance_percentage: overallPct,
      updated_at: new Date().toISOString(),
    });

    // Subject breakdown
    subjects.forEach(sub => {
      const subRecords = studentRecords.filter(a => a.subject_id === sub.id);
      if (subRecords.length > 0) {
        const subPresent = subRecords.filter(a => a.status === 'present').length;
        attendanceSummaries.push({
          id: `sum-${student.id}-${sub.id}`,
          student_id: student.id,
          subject_id: sub.id,
          total_classes: subRecords.length,
          present_classes: subPresent,
          absent_classes: subRecords.length - subPresent,
          attendance_percentage: Number(((subPresent / subRecords.length) * 100).toFixed(1)),
          updated_at: new Date().toISOString(),
        });
      }
    });

    // Compute Prediction
    const predictionResult = predictStudentAttendance(studentRecords);
    predictions.push({
      id: `pred-${student.id}`,
      student_id: student.id,
      prediction_period: 'Semester End',
      predicted_attendance: predictionResult.predictedAttendance,
      confidence: predictionResult.confidence,
      predicted_risk_level: predictionResult.predictedRiskLevel,
      algorithm_version: predictionResult.algorithmVersion,
      trend: predictionResult.trend,
      explanation: predictionResult.explanation,
      created_at: new Date().toISOString(),
    });

    // Compute Risk Assessment
    const riskData = computeRiskAssessment(student.id, studentRecords, predictionResult.predictedAttendance);
    riskAssessments.push({
      id: `risk-${student.id}`,
      student_id: student.id,
      attendance_percentage: riskData.attendancePercentage,
      recent_attendance_percentage: riskData.recentAttendancePercentage,
      recent_absences: riskData.recentAbsences,
      consecutive_absences: riskData.consecutiveAbsences,
      attendance_trend: riskData.attendanceTrend,
      predicted_attendance: riskData.predictedAttendance,
      risk_score: riskData.riskScore,
      risk_level: riskData.riskLevel,
      reasons: riskData.reasons,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Generate alerts & notifications
    const studentProfile = profiles.find(p => p.id === student.profile_id);
    const parent = parents.find(p => p.id === student.parent_id);
    const generated = generateSystemAlertsAndNotifications({
      studentId: student.id,
      studentName: studentProfile?.full_name || student.roll_number,
      attendancePercentage: riskData.attendancePercentage,
      consecutiveAbsences: riskData.consecutiveAbsences,
      predictedAttendance: riskData.predictedAttendance,
      trend: riskData.attendanceTrend,
      teacherProfileId: 'usr-teacher-1',
      parentProfileId: parent ? parent.profile_id : undefined,
      studentProfileId: student.profile_id,
    });

    alerts.push(...generated.alerts);
    notifications.push(...generated.notifications);
  });

  const learningMaterials: LearningMaterial[] = [
    {
      id: 'mat-1',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-1',
      title: 'Unit 3: Supervised Learning & Support Vector Machines (SVM)',
      description: 'Comprehensive lecture slides and mathematical derivations for Support Vector Classifiers, Hyperplane margins, and Kernel tricks (Polynomial & RBF).',
      topic: 'Unit 3 - Supervised Learning & Optimization',
      material_type: 'pdf',
      file_name: 'CS401_Unit3_SVM_Lecture_Notes.pdf',
      file_path: 'notes/CS401_Unit3_SVM_Lecture_Notes.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 3450000,
      mime_type: 'application/pdf',
      is_published: true,
      view_count: 38,
      created_at: '2026-08-10T10:00:00Z',
      updated_at: '2026-08-10T10:00:00Z',
    },
    {
      id: 'mat-2',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-2',
      title: 'Unit 4: Balanced Binary Search Trees & AVL Rotations',
      description: 'Step-by-step visual animation slides covering single (LL, RR) and double (LR, RL) AVL tree rotations with asymptotic balance factor proofs.',
      topic: 'Unit 4 - Advanced Trees & Graphs',
      material_type: 'presentation',
      file_name: 'CS402_AVL_Trees_and_Rotations.pptx',
      file_path: 'notes/CS402_AVL_Trees_and_Rotations.pptx',
      file_url: 'https://file-examples.com/storage/fe885b512c668d2f5ee6665/2017/10/file_example_PPTX_250kB.pptx',
      file_size: 5820000,
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      is_published: true,
      view_count: 42,
      created_at: '2026-08-11T14:30:00Z',
      updated_at: '2026-08-11T14:30:00Z',
    },
    {
      id: 'mat-3',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-3',
      title: 'Unit 2: CPU Scheduling & Banker\'s Algorithm for Deadlocks',
      description: 'Detailed algorithmic breakdown and safety algorithm sample calculation tables for non-preemptive Banker\'s Resource Allocation Matrix.',
      topic: 'Unit 2 - CPU Scheduling & Concurrency',
      material_type: 'document',
      file_name: 'CS403_Deadlock_Avoidance_Bankers_Algorithm.docx',
      file_path: 'notes/CS403_Deadlock_Avoidance_Bankers_Algorithm.docx',
      file_url: 'https://file-examples.com/storage/fe885b512c668d2f5ee6665/2017/02/file-sample_100kB.docx',
      file_size: 1240000,
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      is_published: true,
      view_count: 29,
      created_at: '2026-08-12T09:00:00Z',
      updated_at: '2026-08-12T09:00:00Z',
    },
    {
      id: 'mat-4',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-1',
      title: 'Interactive Neural Network Playground & Backpropagation Visualizer',
      description: 'Official browser-based neural network sandbox for testing activation functions (ReLU, Sigmoid), learning rates, and feature interactions.',
      topic: 'Unit 1 - Foundations of AI & ML',
      material_type: 'link',
      external_url: 'https://playground.tensorflow.org',
      is_published: true,
      view_count: 55,
      created_at: '2026-08-13T11:00:00Z',
      updated_at: '2026-08-13T11:00:00Z',
    },
    {
      id: 'mat-5',
      teacher_id: 'teach-2',
      class_id: 'cls-2',
      subject_id: 'sub-1',
      title: 'Gradient Descent Optimization Cheat Sheet & Formulas',
      description: 'Quick revision notes on Batch vs Mini-batch vs Stochastic Gradient Descent with convergence proofs.',
      topic: 'Unit 2 - Optimization Algorithms',
      material_type: 'note',
      content_text: 'Gradient Descent update rule: θ := θ - α * ∇J(θ). For mini-batch gradient descent, calculate gradients over subsets of size B (typically 32 or 64). Remember to scale learning rate with momentum or Adam optimizer.',
      is_published: true,
      view_count: 19,
      created_at: '2026-08-14T08:30:00Z',
      updated_at: '2026-08-14T08:30:00Z',
    },
  ];

  const assignments: Assignment[] = [
    {
      id: 'asg-1',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-1',
      title: 'Assignment 1: Gradient Descent & Linear Regression from Scratch',
      description: 'Implement multi-variable linear regression from scratch in Python or C++ without high-level ML framework libraries (such as Scikit-Learn).',
      instructions: '1. Write vectorized cost function computation.\n2. Implement gradient descent loop with learning rate decay.\n3. Plot loss curves across 1000 epochs.\n4. Submit source code and a 2-page PDF summary report.',
      topic: 'Unit 2 - Linear Models & Regression',
      attachment_name: 'Assignment1_Specification_and_Datasets.pdf',
      attachment_path: 'assignments/Assignment1_Specification_and_Datasets.pdf',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachment_size: 1450000,
      start_date: '2026-08-10T00:00:00Z',
      due_date: '2026-08-20T23:59:59Z',
      max_marks: 100,
      submission_type: 'both',
      status: 'published',
      allow_resubmission: true,
      created_at: '2026-08-10T08:00:00Z',
      updated_at: '2026-08-10T08:00:00Z',
    },
    {
      id: 'asg-2',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-2',
      title: 'Assignment 2: Self-Balancing AVL Search Tree Benchmark',
      description: 'Construct a self-balancing AVL search tree and benchmark insertion and lookup times against an unbalanced BST on 100,000 synthetic random keys.',
      instructions: '1. Implement Left-Rotate and Right-Rotate primitives.\n2. Track balance factor at every insertion step.\n3. Package your source code and benchmarking timing logs.',
      topic: 'Unit 4 - Trees & Balanced Structures',
      attachment_name: 'AVL_Benchmark_Starter_Code.zip',
      attachment_path: 'assignments/AVL_Benchmark_Starter_Code.zip',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachment_size: 2100000,
      start_date: '2026-08-12T00:00:00Z',
      due_date: '2026-08-18T23:59:59Z',
      max_marks: 50,
      submission_type: 'file',
      status: 'published',
      allow_resubmission: true,
      created_at: '2026-08-12T09:00:00Z',
      updated_at: '2026-08-12T09:00:00Z',
    },
    {
      id: 'asg-3',
      teacher_id: 'teach-1',
      class_id: 'cls-1',
      subject_id: 'sub-3',
      title: 'Assignment 3: Banker\'s Algorithm Deadlock Avoidance Simulator',
      description: 'Build a deadlock detection and avoidance engine simulating multiple concurrent process resource allocation requests.',
      instructions: '1. Validate safe state transitions.\n2. Output safe sequence vectors.\n3. Handle edge cases with unfulfillable requests.',
      topic: 'Unit 3 - Concurrency & Deadlocks',
      attachment_name: 'Bankers_Alg_Problem_Set.pdf',
      attachment_path: 'assignments/Bankers_Alg_Problem_Set.pdf',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachment_size: 980000,
      start_date: '2026-08-01T00:00:00Z',
      due_date: '2026-08-14T23:59:59Z',
      max_marks: 100,
      submission_type: 'file',
      status: 'closed',
      allow_resubmission: false,
      created_at: '2026-08-01T08:00:00Z',
      updated_at: '2026-08-14T23:59:59Z',
    },
    {
      id: 'asg-4',
      teacher_id: 'teach-2',
      class_id: 'cls-2',
      subject_id: 'sub-1',
      title: 'Assignment 1: Exploratory Data Analysis & Outlier Imputation',
      description: 'Perform complete exploratory data analysis (EDA), correlation heatmap generation, and outlier cleaning on real-world datasets.',
      instructions: 'Submit your completed Jupyter Notebook (.ipynb or PDF export) along with key findings in the submission text box.',
      topic: 'Unit 1 - Data Preparation & Cleaning',
      start_date: '2026-08-14T00:00:00Z',
      due_date: '2026-08-25T23:59:59Z',
      max_marks: 50,
      submission_type: 'both',
      status: 'published',
      allow_resubmission: true,
      created_at: '2026-08-14T10:00:00Z',
      updated_at: '2026-08-14T10:00:00Z',
    },
  ];

  const assignmentSubmissions: AssignmentSubmission[] = [
    {
      id: 'subm-1',
      assignment_id: 'asg-1',
      student_id: 'stud-1',
      file_name: 'Alex_Chen_Linear_Regression_Report.pdf',
      file_path: 'student-submissions/Alex_Chen_Linear_Regression_Report.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 1850000,
      mime_type: 'application/pdf',
      text_submission: 'Implemented vectorized cost computation and batch gradient descent. The algorithm achieved minimum squared error at epoch 450 with learning rate 0.01.',
      comments: 'Please find attached the experimental evaluation and loss graphs.',
      submitted_at: '2026-08-16T14:30:00Z',
      status: 'graded',
      is_late: false,
      marks: 96,
      feedback: 'Outstanding implementation! Clean vectorized mathematical formulation, excellent loss curves, and clear documentation of hyperparameter effects.',
      graded_by: 'teach-1',
      graded_at: '2026-08-17T10:00:00Z',
      created_at: '2026-08-16T14:30:00Z',
      updated_at: '2026-08-17T10:00:00Z',
    },
    {
      id: 'subm-2',
      assignment_id: 'asg-1',
      student_id: 'stud-2',
      file_name: 'Sarah_Jenkins_Assignment1.pdf',
      file_path: 'student-submissions/Sarah_Jenkins_Assignment1.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 2100000,
      mime_type: 'application/pdf',
      text_submission: 'Completed gradient descent with learning rate comparison experiments for values 0.1, 0.01, and 0.001.',
      comments: 'Ready for evaluation.',
      submitted_at: '2026-08-17T11:20:00Z',
      status: 'submitted',
      is_late: false,
      created_at: '2026-08-17T11:20:00Z',
      updated_at: '2026-08-17T11:20:00Z',
    },
    {
      id: 'subm-3',
      assignment_id: 'asg-1',
      student_id: 'stud-3',
      file_name: 'Michael_Brown_A1_Final.pdf',
      file_path: 'student-submissions/Michael_Brown_A1_Final.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 1400000,
      mime_type: 'application/pdf',
      text_submission: 'Regression pipeline with gradient clipping.',
      comments: 'Submitted after testing on local machine.',
      submitted_at: '2026-08-21T02:15:00Z',
      status: 'late',
      is_late: true,
      created_at: '2026-08-21T02:15:00Z',
      updated_at: '2026-08-21T02:15:00Z',
    },
    {
      id: 'subm-4',
      assignment_id: 'asg-2',
      student_id: 'stud-1',
      file_name: 'Alex_Chen_AVL_Tree_Benchmark.zip',
      file_path: 'student-submissions/Alex_Chen_AVL_Tree_Benchmark.zip',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 3200000,
      mime_type: 'application/zip',
      text_submission: 'Source code in C++ with chrono microsecond timing log reports. AVL lookup remained bounded within O(log N) operations even with sorted inputs.',
      submitted_at: '2026-08-15T18:00:00Z',
      status: 'submitted',
      is_late: false,
      created_at: '2026-08-15T18:00:00Z',
      updated_at: '2026-08-15T18:00:00Z',
    },
    {
      id: 'subm-5',
      assignment_id: 'asg-3',
      student_id: 'stud-1',
      file_name: 'Alex_Chen_Bankers_Trace.pdf',
      file_path: 'student-submissions/Alex_Chen_Bankers_Trace.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 1200000,
      mime_type: 'application/pdf',
      text_submission: 'Safety algorithm matrix simulation trace verifying process allocation sequence <P1, P3, P4, P0, P2>.',
      submitted_at: '2026-08-13T16:00:00Z',
      status: 'graded',
      is_late: false,
      marks: 98,
      feedback: 'Very thorough verification matrix. Step-by-step trace demonstrates complete mastery of resource allocation state safety.',
      graded_by: 'teach-1',
      graded_at: '2026-08-14T11:00:00Z',
      created_at: '2026-08-13T16:00:00Z',
      updated_at: '2026-08-14T11:00:00Z',
    },
  ];

  const studentProblems: StudentProblem[] = [
    {
      id: 'prob-1',
      student_id: 'stud-1',
      teacher_id: 'teach-1',
      subject_id: 'sub-1',
      title: 'Clarification on Kernel Trick in Non-linear Support Vector Machines',
      description: 'Could you clarify how the RBF Gaussian kernel projects infinite-dimensional features without explicit coordinate calculation? Is Mercer\'s Theorem strictly required for polynomial kernels as well?',
      category: 'concept_doubt',
      priority: 'medium',
      topic: 'Unit 3 - Support Vector Machines & Kernels',
      attachment_name: 'Kernel_Doubt_Formulation.pdf',
      attachment_path: 'student-submissions/Kernel_Doubt_Formulation.pdf',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'in_progress',
      created_at: '2026-08-13T14:00:00Z',
      updated_at: '2026-08-14T09:30:00Z',
    },
    {
      id: 'prob-2',
      student_id: 'stud-3',
      teacher_id: 'teach-1',
      subject_id: 'sub-2',
      title: 'Runtime recursion depth limit exceeded in AVL Tree rebalance rotation',
      description: 'When inserting sorted sequential keys into my AVL implementation, I am hitting a maximum recursion depth error during Left-Right (LR) double rotations. Could you review my rotation logic?',
      category: 'assignment_problem',
      priority: 'high',
      topic: 'Unit 4 - AVL Trees',
      status: 'open',
      created_at: '2026-08-14T16:20:00Z',
      updated_at: '2026-08-14T16:20:00Z',
    },
    {
      id: 'prob-3',
      student_id: 'stud-2',
      teacher_id: 'teach-1',
      subject_id: 'sub-3',
      title: 'Safe state determination with multiple concurrent resource instances',
      description: 'Under what conditions does Banker\'s algorithm fail to detect livelock between two non-preemptive threads?',
      category: 'concept_doubt',
      priority: 'low',
      topic: 'Unit 3 - Deadlocks & Concurrency',
      status: 'resolved',
      created_at: '2026-08-10T11:00:00Z',
      updated_at: '2026-08-11T15:00:00Z',
      resolved_at: '2026-08-11T15:00:00Z',
    },
  ];

  const problemResponses: ProblemResponse[] = [
    {
      id: 'resp-1',
      problem_id: 'prob-1',
      responder_profile_id: 'usr-student-1',
      message: 'Prof. Turing, I went through the Unit 3 lecture slides on slide 14, but I want to verify if computing K(x_i, x_j) guarantees convex optimization in the dual Lagrangian formulation.',
      created_at: '2026-08-13T14:00:00Z',
    },
    {
      id: 'resp-2',
      problem_id: 'prob-1',
      responder_profile_id: 'usr-teacher-1',
      message: 'Great observation, Alex! Mercer\'s Condition ensures that any continuous symmetric kernel function corresponds to an inner product in a Reproducing Kernel Hilbert Space (RKHS). Because the dual formulation only ever depends on the dot products between sample pairs, we never have to calculate the high-dimensional coordinates directly. I have added supplementary notes in Unit 3 for you to review!',
      created_at: '2026-08-14T09:30:00Z',
    },
    {
      id: 'resp-3',
      problem_id: 'prob-3',
      responder_profile_id: 'usr-student-2',
      message: 'Could you explain why Banker\'s algorithm is considered conservative in active operating system design?',
      created_at: '2026-08-10T11:00:00Z',
    },
    {
      id: 'resp-4',
      problem_id: 'prob-3',
      responder_profile_id: 'usr-teacher-1',
      message: 'Banker\'s Algorithm assumes worst-case maximum resource requests by every thread before releasing resources. Thus, it avoids all unsafe states even if in practice deadlock might not have materialized. This answers your doubt, marking as resolved.',
      created_at: '2026-08-11T15:00:00Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      user_id: 'usr-admin',
      user_name: 'Marcus Wright',
      user_role: 'administrator',
      action: 'System Seed Initialized',
      entity: 'Database',
      entity_id: 'sys',
      details: 'Populated initial academic classes, students, and 2-month attendance history.',
      created_at: '2026-06-01T08:00:00Z',
    },
    {
      id: 'log-2',
      user_id: 'usr-teacher-1',
      user_name: 'Prof. Alan Turing',
      user_role: 'teacher',
      action: 'Attendance Batch Marked',
      entity: 'Attendance',
      entity_id: 'cls-1',
      details: 'Recorded attendance for Class CS-4A (Subject: AI & ML).',
      created_at: '2026-08-10T09:30:00Z',
    },
    {
      id: 'log-3',
      user_id: 'usr-admin',
      user_name: 'Marcus Wright',
      user_role: 'administrator',
      action: 'Teacher Assigned to Class',
      entity: 'TeacherAssignment',
      entity_id: 'ta-1',
      details: 'Assigned Prof. Alan Turing to CS-4A for CS401 Artificial Intelligence.',
      created_at: '2026-08-12T10:00:00Z',
    },
  ];

  // Realistic Initial AI Absence Predictions (Historical evaluated & Upcoming)
  const absencePredictions: AbsencePrediction[] = [
    {
      id: 'pred-abs-eval-1',
      student_id: 'stud-4', // Liam Johnson (High Risk)
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-01T08:30:00Z',
      target_date: '2026-08-03',
      absence_probability: 78,
      attendance_probability: 22,
      prediction: 'Likely Absent',
      risk_level: 'HIGH',
      confidence: 86,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High absence probability (78%) driven by declining attendance, recent misses, and previous absent record.',
      factors: [
        { text: 'Attendance is below 75% (67.2%)', impact: 'negative', weight: 8.2 },
        { text: 'Recent attendance dropped to 60%', impact: 'negative', weight: 8.0 },
        { text: '2 absences in the last 7 days', impact: 'negative', weight: 6.6 },
        { text: 'Attendance trend is declining recently', impact: 'negative', weight: 8.8 },
        { text: 'Previous class attendance was absent', impact: 'negative', weight: 4.2 },
      ],
      recommendation: 'High absence probability detected. Consider contacting the student before the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'absent',
      evaluated_at: '2026-08-03T18:00:00Z',
      created_at: '2026-08-01T08:30:00Z',
      recovery_plan: {
        current_attendance: 67.2,
        target_attendance: 75,
        classes_required: 8,
        action_summary: 'Attend next 8 consecutive classes without unexcused absences to restore standing to >= 75%.',
      },
    },
    {
      id: 'pred-abs-eval-2',
      student_id: 'stud-5', // Mia Rodriguez (High Risk)
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-01T08:30:00Z',
      target_date: '2026-08-03',
      absence_probability: 84,
      attendance_probability: 16,
      prediction: 'Likely Absent',
      risk_level: 'HIGH',
      confidence: 88,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High absence probability (84%) driven by consecutive absences and declining attendance trajectory.',
      factors: [
        { text: 'Attendance is below 75% (62.0%)', impact: 'negative', weight: 9.5 },
        { text: 'Recent attendance dropped to 50%', impact: 'negative', weight: 10.0 },
        { text: '4 consecutive absences leading into this class', impact: 'negative', weight: 15.0 },
        { text: 'Previous class attendance was absent', impact: 'negative', weight: 4.2 },
      ],
      recommendation: 'Immediate parental notification advised. High likelihood of missing scheduled lecture.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'absent',
      evaluated_at: '2026-08-03T18:00:00Z',
      created_at: '2026-08-01T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-3',
      student_id: 'stud-1', // Alex Mercer (Healthy)
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-01T08:30:00Z',
      target_date: '2026-08-03',
      absence_probability: 8,
      attendance_probability: 92,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 90,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High probability of attendance (92%) supported by solid attendance patterns and positive session consistency.',
      factors: [
        { text: 'Overall attendance is strong and healthy (94.0%)', impact: 'positive', weight: 1.5 },
        { text: 'Recent session consistency is high (100%)', impact: 'positive', weight: 0 },
        { text: 'Zero absences in the past 7 days', impact: 'positive', weight: 0 },
        { text: 'Active present streak of 6 sessions', impact: 'positive', weight: 0 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'present',
      evaluated_at: '2026-08-03T18:00:00Z',
      created_at: '2026-08-01T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-4',
      student_id: 'stud-2', // Sophia Chen (Healthy)
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-01T08:30:00Z',
      target_date: '2026-08-03',
      absence_probability: 14,
      attendance_probability: 86,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 86,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High probability of attendance (86%) supported by solid attendance patterns.',
      factors: [
        { text: 'Overall attendance is strong and healthy (88.0%)', impact: 'positive', weight: 3.0 },
        { text: 'Zero absences in the past 7 days', impact: 'positive', weight: 0 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'present',
      evaluated_at: '2026-08-03T18:00:00Z',
      created_at: '2026-08-01T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-5',
      student_id: 'stud-6', // Noah Williams (Medium/Declining)
      subject_id: 'sub-1',
      class_id: 'cls-2',
      prediction_date: '2026-08-01T08:30:00Z',
      target_date: '2026-08-03',
      absence_probability: 54,
      attendance_probability: 46,
      prediction: 'Likely Absent',
      risk_level: 'MEDIUM',
      confidence: 80,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Moderate-high probability of absence (54%) detected based on recent attendance volatility.',
      factors: [
        { text: 'Recent attendance dropped to 65%', impact: 'negative', weight: 7.0 },
        { text: 'Attendance trend is declining recently', impact: 'negative', weight: 8.8 },
      ],
      recommendation: 'The student recent attendance pattern shows moderate absence risk. Regular attendance is recommended.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'incorrect', // False Positive (Predicted Absent, but student showed up!)
      actual_attendance_status: 'present',
      evaluated_at: '2026-08-03T18:00:00Z',
      created_at: '2026-08-01T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-6',
      student_id: 'stud-3', // Ethan Davis (Borderline)
      subject_id: 'sub-2',
      class_id: 'cls-1',
      prediction_date: '2026-08-05T08:30:00Z',
      target_date: '2026-08-07',
      absence_probability: 44,
      attendance_probability: 56,
      prediction: 'Likely Present',
      risk_level: 'MEDIUM',
      confidence: 82,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Projected to attend (56%), though recent trends should be monitored to maintain good standing.',
      factors: [
        { text: 'Overall attendance is satisfactory (79.0%)', impact: 'neutral', weight: 5.2 },
        { text: 'Attendance trend remains stable', impact: 'neutral', weight: 3.5 },
      ],
      recommendation: 'The student recent attendance pattern shows moderate absence risk. Regular attendance is recommended.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'present',
      evaluated_at: '2026-08-07T18:00:00Z',
      created_at: '2026-08-05T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-7',
      student_id: 'stud-8', // Lucas Miller (Critical)
      subject_id: 'sub-3',
      class_id: 'cls-3',
      prediction_date: '2026-08-05T08:30:00Z',
      target_date: '2026-08-07',
      absence_probability: 88,
      attendance_probability: 12,
      prediction: 'Likely Absent',
      risk_level: 'HIGH',
      confidence: 90,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Critical absence risk (88%). Student missed frequent sessions across all subjects.',
      factors: [
        { text: 'Attendance is below 75% (58.0%)', impact: 'negative', weight: 10.5 },
        { text: '3 absences in the last 7 days', impact: 'negative', weight: 9.9 },
        { text: 'Previous class attendance was absent', impact: 'negative', weight: 4.2 },
      ],
      recommendation: 'Immediate formal intervention required. Critical risk of failing credit requirement.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'absent',
      evaluated_at: '2026-08-07T18:00:00Z',
      created_at: '2026-08-05T08:30:00Z',
    },
    {
      id: 'pred-abs-eval-8',
      student_id: 'stud-7', // Emma Watson
      subject_id: 'sub-2',
      class_id: 'cls-2',
      prediction_date: '2026-08-05T08:30:00Z',
      target_date: '2026-08-07',
      absence_probability: 12,
      attendance_probability: 88,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 88,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High probability of attendance (88%) supported by solid attendance patterns.',
      factors: [
        { text: 'Overall attendance is strong and healthy (92.0%)', impact: 'positive', weight: 2.0 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'correct',
      actual_attendance_status: 'present',
      evaluated_at: '2026-08-07T18:00:00Z',
      created_at: '2026-08-05T08:30:00Z',
    },
    // Upcoming Active Predictions (Tomorrow & Next Week)
    {
      id: 'pred-abs-live-1',
      student_id: 'stud-4', // Liam Johnson
      subject_id: 'sub-1', // AI & ML
      class_id: 'cls-1',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18', // Monday
      absence_probability: 76,
      attendance_probability: 24,
      prediction: 'Likely Absent',
      risk_level: 'HIGH',
      confidence: 86,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High absence probability (76%) detected on upcoming Monday session with declining trajectory.',
      factors: [
        { text: 'Attendance is below 75% (67.2%)', impact: 'negative', weight: 8.2 },
        { text: 'Recent attendance dropped to 62.5%', impact: 'negative', weight: 7.5 },
        { text: '2 absences in the last 7 days', impact: 'negative', weight: 6.6 },
        { text: 'Monday historically has high absence frequency (40% miss rate)', impact: 'negative', weight: 2.0 },
        { text: 'Attendance trend is declining recently', impact: 'negative', weight: 8.8 },
      ],
      recommendation: 'High absence probability detected. Consider contacting the student before the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
      recovery_plan: {
        current_attendance: 67.2,
        target_attendance: 75,
        classes_required: 8,
        action_summary: 'Attend next 8 consecutive classes without unexcused absences to restore standing to >= 75%.',
      },
    },
    {
      id: 'pred-abs-live-2',
      student_id: 'stud-5', // Mia Rodriguez
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18',
      absence_probability: 82,
      attendance_probability: 18,
      prediction: 'Likely Absent',
      risk_level: 'HIGH',
      confidence: 88,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Critical absence risk (82%). 4 consecutive absences logged leading into next session.',
      factors: [
        { text: 'Attendance is below 75% (62.0%)', impact: 'negative', weight: 9.5 },
        { text: 'Recent attendance dropped to 50%', impact: 'negative', weight: 10.0 },
        { text: '4 consecutive absences leading into this class', impact: 'negative', weight: 15.0 },
        { text: 'Previous class attendance was absent', impact: 'negative', weight: 4.2 },
      ],
      recommendation: 'High absence probability detected. Consider contacting the student and parent before the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
      recovery_plan: {
        current_attendance: 62.0,
        target_attendance: 75,
        classes_required: 12,
        action_summary: 'Attend next 12 consecutive classes without unexcused absences to restore standing to >= 75%.',
      },
    },
    {
      id: 'pred-abs-live-3',
      student_id: 'stud-6', // Noah Williams
      subject_id: 'sub-1',
      class_id: 'cls-2',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18',
      absence_probability: 58,
      attendance_probability: 42,
      prediction: 'Likely Absent',
      risk_level: 'MEDIUM',
      confidence: 82,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Moderate-high probability of absence (58%) detected based on recent attendance volatility.',
      factors: [
        { text: 'Recent attendance dropped to 62.5%', impact: 'negative', weight: 7.5 },
        { text: 'Attendance trend is declining recently', impact: 'negative', weight: 8.8 },
      ],
      recommendation: "The student's recent attendance pattern shows moderate absence risk. Regular attendance is recommended.",
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
    },
    {
      id: 'pred-abs-live-4',
      student_id: 'stud-3', // Ethan Davis
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18',
      absence_probability: 38,
      attendance_probability: 62,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 82,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'Projected to attend (62%), though borderline overall standing warrants attention.',
      factors: [
        { text: 'Overall attendance is satisfactory (79.0%)', impact: 'neutral', weight: 5.2 },
        { text: 'Attended the immediately preceding class', impact: 'positive', weight: 0.6 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
    },
    {
      id: 'pred-abs-live-5',
      student_id: 'stud-1', // Alex Mercer
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18',
      absence_probability: 6,
      attendance_probability: 94,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 92,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High probability of attendance (94%) supported by solid attendance patterns.',
      factors: [
        { text: 'Overall attendance is strong and healthy (94.0%)', impact: 'positive', weight: 1.5 },
        { text: 'Recent session consistency is high (100%)', impact: 'positive', weight: 0 },
        { text: 'Zero absences in the past 7 days', impact: 'positive', weight: 0 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
    },
    {
      id: 'pred-abs-live-6',
      student_id: 'stud-2', // Sophia Chen
      subject_id: 'sub-1',
      class_id: 'cls-1',
      prediction_date: '2026-08-15T09:00:00Z',
      target_date: '2026-08-18',
      absence_probability: 12,
      attendance_probability: 88,
      prediction: 'Likely Present',
      risk_level: 'LOW',
      confidence: 88,
      confidence_note: 'Confidence is based on the amount and consistency of available historical attendance data.',
      explanation: 'High probability of attendance (88%) supported by solid attendance patterns.',
      factors: [
        { text: 'Overall attendance is strong and healthy (88.0%)', impact: 'positive', weight: 3.0 },
      ],
      recommendation: 'The student has a strong attendance pattern and is likely to attend the upcoming class.',
      algorithm_version: 'rule-based-absence-v1',
      actual_result: 'pending',
      created_at: '2026-08-15T09:00:00Z',
    },
  ];

  return {
    institutions,
    profiles,
    teachers,
    parents,
    classes,
    subjects,
    students,
    enrollments,
    teacherAssignments,
    attendance,
    attendanceSummaries,
    riskAssessments,
    predictions,
    alerts,
    notifications,
    auditLogs,
    learningMaterials,
    assignments,
    assignmentSubmissions,
    studentProblems,
    problemResponses,
    absencePredictions,
  };
}

export type DatabaseSchema = ReturnType<typeof generateInitialData>;

class DataStore {
  private data: DatabaseSchema;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseSchema {
    const initial = generateInitialData();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initial,
          ...parsed,
          learningMaterials: parsed.learningMaterials && parsed.learningMaterials.length > 0 ? parsed.learningMaterials : initial.learningMaterials,
          assignments: parsed.assignments && parsed.assignments.length > 0 ? parsed.assignments : initial.assignments,
          assignmentSubmissions: parsed.assignmentSubmissions && parsed.assignmentSubmissions.length > 0 ? parsed.assignmentSubmissions : initial.assignmentSubmissions,
          studentProblems: parsed.studentProblems && parsed.studentProblems.length > 0 ? parsed.studentProblems : initial.studentProblems,
          problemResponses: parsed.problemResponses && parsed.problemResponses.length > 0 ? parsed.problemResponses : initial.problemResponses,
          absencePredictions: parsed.absencePredictions && parsed.absencePredictions.length > 0 ? parsed.absencePredictions : initial.absencePredictions,
        };
      }
    } catch (e) {
      console.warn('Failed to parse stored database state, initializing fresh data.', e);
    }
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: DatabaseSchema) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage(this.data);
    this.listeners.forEach(cb => cb());
  }

  public resetToDefault(): void {
    this.data = generateInitialData();
    this.notify();
  }

  // Read Queries
  public getInstitutions(): Institution[] {
    return [...this.data.institutions];
  }

  public getProfiles(): Profile[] {
    return [...this.data.profiles];
  }

  public getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    return this.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  public getStudents(): Student[] {
    return this.data.students.map(s => ({
      ...s,
      profile: this.data.profiles.find(p => p.id === s.profile_id),
      class: this.data.classes.find(c => c.id === s.class_id),
      parent: this.data.parents.find(p => p.id === s.parent_id),
    }));
  }

  public getStudentById(id: string): Student | undefined {
    const s = this.data.students.find(st => st.id === id || st.profile_id === id);
    if (!s) return undefined;
    return {
      ...s,
      profile: this.data.profiles.find(p => p.id === s.profile_id),
      class: this.data.classes.find(c => c.id === s.class_id),
      parent: this.data.parents.find(p => p.id === s.parent_id),
    };
  }

  public getStudentByProfileId(profileId: string): Student | undefined {
    const s = this.data.students.find(st => st.profile_id === profileId || st.id === profileId);
    if (!s) return undefined;
    return {
      ...s,
      profile: this.data.profiles.find(p => p.id === s.profile_id),
      class: this.data.classes.find(c => c.id === s.class_id),
      parent: this.data.parents.find(p => p.id === s.parent_id),
    };
  }

  public getStudentsByClass(classId: string): Student[] {
    return this.data.students
      .filter(s => s.class_id === classId)
      .map(s => ({
        ...s,
        profile: this.data.profiles.find(p => p.id === s.profile_id),
        class: this.data.classes.find(c => c.id === s.class_id),
        parent: this.data.parents.find(p => p.id === s.parent_id),
      }));
  }

  public getTeachers(): Teacher[] {
    return this.data.teachers.map(t => ({
      ...t,
      profile: this.data.profiles.find(p => p.id === t.profile_id),
    }));
  }

  public getTeacherById(id: string): Teacher | undefined {
    const t = this.data.teachers.find(tch => tch.id === id || tch.profile_id === id);
    if (!t) return undefined;
    return {
      ...t,
      profile: this.data.profiles.find(p => p.id === t.profile_id),
    };
  }

  public getTeacherByProfileId(profileId: string): Teacher | undefined {
    const t = this.data.teachers.find(tch => tch.profile_id === profileId);
    if (!t) return undefined;
    return {
      ...t,
      profile: this.data.profiles.find(p => p.id === t.profile_id),
    };
  }

  public getParents(): Parent[] {
    return this.data.parents.map(p => ({
      ...p,
      profile: this.data.profiles.find(pr => pr.id === p.profile_id),
      students: this.data.students
        .filter(s => s.parent_id === p.id)
        .map(s => ({
          ...s,
          profile: this.data.profiles.find(pr => pr.id === s.profile_id),
          class: this.data.classes.find(c => c.id === s.class_id),
        })),
    }));
  }

  public getParentById(id: string): Parent | undefined {
    const p = this.data.parents.find(pr => pr.id === id || pr.profile_id === id);
    if (!p) return undefined;
    return {
      ...p,
      profile: this.data.profiles.find(pr => pr.id === p.profile_id),
      students: this.data.students
        .filter(s => s.parent_id === p.id)
        .map(s => ({
          ...s,
          profile: this.data.profiles.find(pr => pr.id === s.profile_id),
          class: this.data.classes.find(c => c.id === s.class_id),
        })),
    };
  }

  public getParentByProfileId(profileId: string): Parent | undefined {
    const p = this.data.parents.find(pr => pr.profile_id === profileId);
    if (!p) return undefined;
    return {
      ...p,
      profile: this.data.profiles.find(pr => pr.id === p.profile_id),
      students: this.data.students
        .filter(s => s.parent_id === p.id)
        .map(s => ({
          ...s,
          profile: this.data.profiles.find(pr => pr.id === s.profile_id),
          class: this.data.classes.find(c => c.id === s.class_id),
        })),
    };
  }

  public getClasses(): Class[] {
    return this.data.classes.map(c => {
      const teacher = this.data.teachers.find(t => t.id === c.class_teacher_id);
      return {
        ...c,
        student_count: this.data.students.filter(s => s.class_id === c.id).length,
        class_teacher: teacher ? {
          ...teacher,
          profile: this.data.profiles.find(p => p.id === teacher.profile_id),
        } : undefined,
      };
    });
  }

  public getClassById(id: string): Class | undefined {
    const c = this.data.classes.find(cls => cls.id === id);
    if (!c) return undefined;
    const teacher = this.data.teachers.find(t => t.id === c.class_teacher_id);
    return {
      ...c,
      student_count: this.data.students.filter(s => s.class_id === c.id).length,
      class_teacher: teacher ? {
        ...teacher,
        profile: this.data.profiles.find(p => p.id === teacher.profile_id),
      } : undefined,
    };
  }

  public getSubjects(): Subject[] {
    return [...this.data.subjects];
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.data.subjects.find(s => s.id === id);
  }

  public incrementMaterialView(materialId: string): void {
    const m = this.data.learningMaterials?.find(item => item.id === materialId);
    if (m) {
      m.view_count = (m.view_count || 0) + 1;
      this.notify();
    }
  }

  public getStudentSubmissions(studentId: string): AssignmentSubmission[] {
    const list = (this.data.assignmentSubmissions || []).filter(s => s.student_id === studentId);
    return list.map(s => ({
      ...s,
      student: this.getStudentById(s.student_id),
      assignment: this.getAssignmentById(s.assignment_id),
    }));
  }

  public getSubmissionsForAssignment(assignmentId: string): AssignmentSubmission[] {
    const list = (this.data.assignmentSubmissions || []).filter(s => s.assignment_id === assignmentId);
    return list.map(s => ({
      ...s,
      student: this.getStudentById(s.student_id),
      assignment: this.getAssignmentById(s.assignment_id),
    }));
  }

  public getTeacherAssignments(teacherId?: string): TeacherAssignment[] {
    let assignments = this.data.teacherAssignments;
    if (teacherId) {
      assignments = assignments.filter(ta => ta.teacher_id === teacherId);
    }
    return assignments.map(ta => ({
      ...ta,
      teacher: this.data.teachers.find(t => t.id === ta.teacher_id),
      class: this.data.classes.find(c => c.id === ta.class_id),
      subject: this.data.subjects.find(s => s.id === ta.subject_id),
    }));
  }

  public getAttendance(filter?: {
    studentId?: string;
    classId?: string;
    subjectId?: string;
    date?: string;
  }): Attendance[] {
    let records = this.data.attendance;
    if (filter?.studentId) {
      records = records.filter(a => a.student_id === filter.studentId);
    }
    if (filter?.classId) {
      records = records.filter(a => a.class_id === filter.classId);
    }
    if (filter?.subjectId) {
      records = records.filter(a => a.subject_id === filter.subjectId);
    }
    if (filter?.date) {
      records = records.filter(a => a.attendance_date === filter.date);
    }

    return records.map(a => ({
      ...a,
      student: this.getStudentById(a.student_id),
      subject: this.data.subjects.find(s => s.id === a.subject_id),
      class: this.data.classes.find(c => c.id === a.class_id),
    }));
  }

  public getRiskAssessments(): RiskAssessment[] {
    return this.data.riskAssessments.map(r => ({
      ...r,
      student: this.getStudentById(r.student_id),
    }));
  }

  public getRiskAssessmentForStudent(studentId: string): RiskAssessment | undefined {
    const r = this.data.riskAssessments.find(ra => ra.student_id === studentId);
    if (!r) return undefined;
    return {
      ...r,
      student: this.getStudentById(r.student_id),
    };
  }

  public getPredictions(): Prediction[] {
    return this.data.predictions.map(p => ({
      ...p,
      student: this.getStudentById(p.student_id),
    }));
  }

  public getPredictionForStudent(studentId: string): Prediction | undefined {
    const p = this.data.predictions.find(pr => pr.student_id === studentId);
    if (!p) return undefined;
    return {
      ...p,
      student: this.getStudentById(p.student_id),
    };
  }

  public getAlerts(studentId?: string): Alert[] {
    let list = this.data.alerts;
    if (studentId) {
      list = list.filter(a => a.student_id === studentId);
    }
    return list
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(a => ({
        ...a,
        student: this.getStudentById(a.student_id),
      }));
  }

  public getNotifications(recipientProfileId?: string): Notification[] {
    let list = this.data.notifications;
    if (recipientProfileId) {
      list = list.filter(n => n.recipient_profile_id === recipientProfileId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Mutations
  public markAttendanceBatch(
    items: {
      studentId: string;
      classId: string;
      subjectId: string;
      teacherId: string;
      attendanceDate: string;
      status: 'present' | 'absent';
      remarks?: string;
    }[],
    actor?: { id: string; name: string; role: UserRole }
  ): { success: boolean; count: number; message: string } {
    const now = new Date().toISOString();
    const affectedStudentIds = new Set<string>();

    for (const item of items) {
      affectedStudentIds.add(item.studentId);
      // Check for existing record to enforce unique constraint (student_id + class_id + subject_id + attendance_date)
      const existingIdx = this.data.attendance.findIndex(
        a =>
          a.student_id === item.studentId &&
          a.class_id === item.classId &&
          a.subject_id === item.subjectId &&
          a.attendance_date === item.attendanceDate
      );

      if (existingIdx >= 0) {
        // Edit existing record
        this.data.attendance[existingIdx] = {
          ...this.data.attendance[existingIdx],
          status: item.status,
          remarks: item.remarks ?? this.data.attendance[existingIdx].remarks,
          updated_at: now,
        };
      } else {
        // Insert new record
        this.data.attendance.push({
          id: `att-${item.studentId}-${item.subjectId}-${item.attendanceDate}-${Date.now()}`,
          student_id: item.studentId,
          class_id: item.classId,
          subject_id: item.subjectId,
          teacher_id: item.teacherId,
          attendance_date: item.attendanceDate,
          status: item.status,
          remarks: item.remarks,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // Recalculate summaries, risks, predictions, and alerts for affected students
    affectedStudentIds.forEach(studId => {
      this.recalculateStudentAnalytics(studId);
    });

    // Add Audit Log
    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Submitted/Updated Attendance',
        'Attendance',
        items[0]?.classId,
        `Recorded attendance for ${items.length} students on ${items[0]?.attendanceDate}.`
      );
    }

    this.notify();
    return { success: true, count: items.length, message: 'Attendance recorded and analytics recalculated successfully.' };
  }

  public recalculateStudentAnalytics(studentId: string): void {
    const records = this.data.attendance.filter(a => a.student_id === studentId);
    const presentCount = records.filter(a => a.status === 'present').length;
    const totalCount = records.length;
    const overallPct = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 0;

    // Update summary
    const sumIdx = this.data.attendanceSummaries.findIndex(s => s.student_id === studentId && !s.subject_id);
    if (sumIdx >= 0) {
      this.data.attendanceSummaries[sumIdx] = {
        ...this.data.attendanceSummaries[sumIdx],
        total_classes: totalCount,
        present_classes: presentCount,
        absent_classes: totalCount - presentCount,
        attendance_percentage: overallPct,
        updated_at: new Date().toISOString(),
      };
    } else {
      this.data.attendanceSummaries.push({
        id: `sum-${studentId}-all`,
        student_id: studentId,
        total_classes: totalCount,
        present_classes: presentCount,
        absent_classes: totalCount - presentCount,
        attendance_percentage: overallPct,
        updated_at: new Date().toISOString(),
      });
    }

    // Prediction
    const predResult = predictStudentAttendance(records);
    const predIdx = this.data.predictions.findIndex(p => p.student_id === studentId);
    if (predIdx >= 0) {
      this.data.predictions[predIdx] = {
        ...this.data.predictions[predIdx],
        predicted_attendance: predResult.predictedAttendance,
        confidence: predResult.confidence,
        predicted_risk_level: predResult.predictedRiskLevel,
        trend: predResult.trend,
        explanation: predResult.explanation,
        created_at: new Date().toISOString(),
      };
    } else {
      this.data.predictions.push({
        id: `pred-${studentId}`,
        student_id: studentId,
        prediction_period: 'Semester End',
        predicted_attendance: predResult.predictedAttendance,
        confidence: predResult.confidence,
        predicted_risk_level: predResult.predictedRiskLevel,
        algorithm_version: predResult.algorithmVersion,
        trend: predResult.trend,
        explanation: predResult.explanation,
        created_at: new Date().toISOString(),
      });
    }

    // Risk Assessment
    const riskData = computeRiskAssessment(studentId, records, predResult.predictedAttendance);
    const riskIdx = this.data.riskAssessments.findIndex(r => r.student_id === studentId);
    if (riskIdx >= 0) {
      this.data.riskAssessments[riskIdx] = {
        ...this.data.riskAssessments[riskIdx],
        attendance_percentage: riskData.attendancePercentage,
        recent_attendance_percentage: riskData.recentAttendancePercentage,
        recent_absences: riskData.recentAbsences,
        consecutive_absences: riskData.consecutiveAbsences,
        attendance_trend: riskData.attendanceTrend,
        predicted_attendance: riskData.predictedAttendance,
        risk_score: riskData.riskScore,
        risk_level: riskData.riskLevel,
        reasons: riskData.reasons,
        updated_at: new Date().toISOString(),
      };
    } else {
      this.data.riskAssessments.push({
        id: `risk-${studentId}`,
        student_id: studentId,
        attendance_percentage: riskData.attendancePercentage,
        recent_attendance_percentage: riskData.recentAttendancePercentage,
        recent_absences: riskData.recentAbsences,
        consecutive_absences: riskData.consecutiveAbsences,
        attendance_trend: riskData.attendanceTrend,
        predicted_attendance: riskData.predictedAttendance,
        risk_score: riskData.riskScore,
        risk_level: riskData.riskLevel,
        reasons: riskData.reasons,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Generate alerts and notifications if critical
    const student = this.data.students.find(s => s.id === studentId);
    const profile = student ? this.data.profiles.find(p => p.id === student.profile_id) : undefined;
    const parent = student?.parent_id ? this.data.parents.find(p => p.id === student.parent_id) : undefined;

    if (student && profile) {
      const generated = generateSystemAlertsAndNotifications({
        studentId,
        studentName: profile.full_name,
        attendancePercentage: riskData.attendancePercentage,
        consecutiveAbsences: riskData.consecutiveAbsences,
        predictedAttendance: riskData.predictedAttendance,
        trend: riskData.attendanceTrend,
        teacherProfileId: 'usr-teacher-1',
        parentProfileId: parent?.profile_id,
        studentProfileId: profile.id,
      });

      this.data.alerts.push(...generated.alerts);
      this.data.notifications.push(...generated.notifications);
    }
  }

  // Student CRUD
  public addStudent(data: {
    fullName: string;
    email: string;
    phone?: string;
    rollNumber: string;
    studentId: string;
    classId: string;
    department: string;
    semester: number;
    parentId?: string;
  }, actor?: { id: string; name: string; role: UserRole }): Student {
    const profileId = `usr-stud-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'student',
      department: data.department,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.profiles.push(newProfile);

    const newStudent: Student = {
      id: `stud-${Date.now()}`,
      profile_id: profileId,
      student_id: data.studentId,
      roll_number: data.rollNumber,
      class_id: data.classId,
      department: data.department,
      semester: data.semester,
      admission_year: new Date().getFullYear(),
      parent_id: data.parentId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.students.push(newStudent);

    // Initial empty analytics
    this.recalculateStudentAnalytics(newStudent.id);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Created Student',
        'Student',
        newStudent.id,
        `Enrolled student ${data.fullName} (${data.rollNumber}) in class.`
      );
    }

    this.notify();
    return this.getStudentById(newStudent.id)!;
  }

  public updateStudent(
    studentId: string,
    updates: Partial<Student> & { fullName?: string; email?: string; phone?: string },
    actor?: { id: string; name: string; role: UserRole }
  ): boolean {
    const idx = this.data.students.findIndex(s => s.id === studentId);
    if (idx === 0 || idx > 0) {
      const s = this.data.students[idx];
      this.data.students[idx] = {
        ...s,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.fullName || updates.email || updates.phone) {
        const pIdx = this.data.profiles.findIndex(p => p.id === s.profile_id);
        if (pIdx >= 0) {
          this.data.profiles[pIdx] = {
            ...this.data.profiles[pIdx],
            full_name: updates.fullName ?? this.data.profiles[pIdx].full_name,
            email: updates.email ?? this.data.profiles[pIdx].email,
            phone: updates.phone ?? this.data.profiles[pIdx].phone,
            updated_at: new Date().toISOString(),
          };
        }
      }

      if (actor) {
        this.logAuditAction(
          actor.id,
          actor.name,
          actor.role,
          'Updated Student',
          'Student',
          studentId,
          `Modified details for ${updates.fullName || s.roll_number}`
        );
      }

      this.notify();
      return true;
    }
    return false;
  }

  public deleteStudent(studentId: string, actor?: { id: string; name: string; role: UserRole }): boolean {
    const idx = this.data.students.findIndex(s => s.id === studentId);
    if (idx >= 0) {
      const s = this.data.students[idx];
      this.data.students.splice(idx, 1);
      this.data.attendance = this.data.attendance.filter(a => a.student_id !== studentId);
      this.data.attendanceSummaries = this.data.attendanceSummaries.filter(a => a.student_id !== studentId);
      this.data.riskAssessments = this.data.riskAssessments.filter(r => r.student_id !== studentId);
      this.data.predictions = this.data.predictions.filter(p => p.student_id !== studentId);

      if (actor) {
        this.logAuditAction(
          actor.id,
          actor.name,
          actor.role,
          'Deleted/Deactivated Student',
          'Student',
          studentId,
          `Removed student ${s.roll_number} and purged associated logs.`
        );
      }

      this.notify();
      return true;
    }
    return false;
  }

  // Teacher CRUD
  public addTeacher(data: {
    fullName: string;
    email: string;
    phone?: string;
    employeeId: string;
    department: string;
    designation: string;
  }, actor?: { id: string; name: string; role: UserRole }): Teacher {
    const profileId = `usr-teach-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'teacher',
      department: data.department,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.profiles.push(newProfile);

    const newTeacher: Teacher = {
      id: `teach-${Date.now()}`,
      profile_id: profileId,
      employee_id: data.employeeId,
      department: data.department,
      designation: data.designation,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.teachers.push(newTeacher);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Added Faculty Member',
        'Teacher',
        newTeacher.id,
        `Added teacher ${data.fullName} (${data.employeeId}) to ${data.department}.`
      );
    }

    this.notify();
    return { ...newTeacher, profile: newProfile };
  }

  // Class CRUD
  public addClass(data: {
    name: string;
    section: string;
    department: string;
    semester: number;
    academicYear: string;
    classTeacherId?: string;
  }, actor?: { id: string; name: string; role: UserRole }): Class {
    const newClass: Class = {
      id: `cls-${Date.now()}`,
      name: data.name,
      section: data.section,
      department: data.department,
      semester: data.semester,
      academic_year: data.academicYear,
      class_teacher_id: data.classTeacherId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_count: 0,
    };
    this.data.classes.push(newClass);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Created Class',
        'Class',
        newClass.id,
        `Created class ${data.name} (Section ${data.section}).`
      );
    }

    this.notify();
    return newClass;
  }

  // Subject CRUD
  public addSubject(data: {
    name: string;
    code: string;
    department: string;
    semester: number;
    credits: number;
  }, actor?: { id: string; name: string; role: UserRole }): Subject {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: data.name,
      code: data.code,
      department: data.department,
      semester: data.semester,
      credits: data.credits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.subjects.push(newSubject);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Created Subject',
        'Subject',
        newSubject.id,
        `Created subject ${data.name} (${data.code}).`
      );
    }

    this.notify();
    return newSubject;
  }

  // Teacher Assignment CRUD
  public assignTeacherToClassSubject(data: {
    teacherId: string;
    classId: string;
    subjectId: string;
    academicYear: string;
    semester: number;
  }, actor?: { id: string; name: string; role: UserRole }): TeacherAssignment {
    const newAssignment: TeacherAssignment = {
      id: `ta-${Date.now()}`,
      teacher_id: data.teacherId,
      class_id: data.classId,
      subject_id: data.subjectId,
      academic_year: data.academicYear,
      semester: data.semester,
      created_at: new Date().toISOString(),
    };
    this.data.teacherAssignments.push(newAssignment);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Assigned Teacher to Class',
        'TeacherAssignment',
        newAssignment.id,
        `Assigned teacher to class and subject.`
      );
    }

    this.notify();
    return newAssignment;
  }

  // Notification actions
  public markNotificationAsRead(id: string): void {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.is_read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(recipientProfileId?: string): void {
    this.data.notifications.forEach(n => {
      if (!recipientProfileId || n.recipient_profile_id === recipientProfileId) {
        n.is_read = true;
      }
    });
    this.notify();
  }

  public getAttendanceSummaries(): AttendanceSummary[] {
    return [...this.data.attendanceSummaries];
  }

  public getAttendanceSummaryForStudent(studentId: string): AttendanceSummary | undefined {
    return this.data.attendanceSummaries.find(s => s.student_id === studentId && !s.subject_id);
  }

  public addParent(data: {
    fullName: string;
    email: string;
    phone?: string;
    relationship: 'Father' | 'Mother' | 'Guardian' | string;
    address?: string;
    studentId?: string;
  }, actor?: { id: string; name: string; role: UserRole }): Parent {
    const profileId = `usr-parent-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'parent',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.profiles.push(newProfile);

    const rel = (data.relationship === 'Father' || data.relationship === 'Mother' || data.relationship === 'Guardian')
      ? data.relationship
      : 'Guardian';

    const newParent: Parent = {
      id: `parent-${Date.now()}`,
      profile_id: profileId,
      relationship: rel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.parents.push(newParent);

    if (data.studentId) {
      const stud = this.data.students.find(s => s.id === data.studentId);
      if (stud) {
        stud.parent_id = newParent.id;
      }
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Added Guardian Account',
        'Parent',
        newParent.id,
        `Added parent ${data.fullName} for ward.`
      );
    }

    this.notify();
    return { ...newParent, profile: newProfile };
  }

  public addInstitution(inst: Institution, actor?: { id: string; name: string; role: UserRole }): Institution {
    this.data.institutions.push(inst);
    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Onboarded Institution Tenant',
        'Institution',
        inst.id,
        `Provisioned tenant ${inst.name} (${inst.code}).`
      );
    }
    this.notify();
    return inst;
  }

  public resetData(): void {
    this.resetToDefault();
  }

  public markAlertRead(id: string): void {
    this.markAlertAsRead(id);
  }

  public markNotificationRead(id: string): void {
    this.markNotificationAsRead(id);
  }

  public markAlertAsRead(id: string): void {
    const a = this.data.alerts.find(item => item.id === id);
    if (a) {
      a.is_read = true;
      this.notify();
    }
  }

  public logAuditAction(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    entity: string,
    entityId: string = '',
    details: string = ''
  ): void {
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      entity,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // LEARNING MATERIALS METHODS
  // --------------------------------------------------------------------------

  public getLearningMaterials(filters?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    studentId?: string;
    publishedOnly?: boolean;
    search?: string;
    topic?: string;
  }): LearningMaterial[] {
    let list = [...(this.data.learningMaterials || [])];

    if (filters?.classId) {
      list = list.filter(m => m.class_id === filters.classId);
    }
    if (filters?.subjectId) {
      list = list.filter(m => m.subject_id === filters.subjectId);
    }
    if (filters?.teacherId) {
      list = list.filter(m => m.teacher_id === filters.teacherId);
    }
    if (filters?.publishedOnly) {
      list = list.filter(m => m.is_published);
    }
    if (filters?.topic) {
      list = list.filter(m => m.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.topic.toLowerCase().includes(q) ||
          m.file_name?.toLowerCase().includes(q)
      );
    }

    // Attach joined entities
    return list
      .map(m => ({
        ...m,
        teacher: this.getTeacherById(m.teacher_id),
        subject: this.getSubjectById(m.subject_id),
        class: this.getClassById(m.class_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getLearningMaterialById(id: string): LearningMaterial | undefined {
    const m = this.data.learningMaterials?.find(item => item.id === id);
    if (!m) return undefined;
    return {
      ...m,
      teacher: this.getTeacherById(m.teacher_id),
      subject: this.getSubjectById(m.subject_id),
      class: this.getClassById(m.class_id),
    };
  }

  public createLearningMaterial(
    data: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'>,
    actor?: { id: string; name: string; role: UserRole }
  ): LearningMaterial {
    const id = `mat-${Date.now()}`;
    const now = new Date().toISOString();
    const newMaterial: LearningMaterial = {
      ...data,
      id,
      view_count: 0,
      created_at: now,
      updated_at: now,
    };

    if (!this.data.learningMaterials) this.data.learningMaterials = [];
    this.data.learningMaterials.unshift(newMaterial);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Created Learning Material',
        'LearningMaterial',
        id,
        `Uploaded material "${newMaterial.title}" (${newMaterial.material_type}).`
      );
    }

    // Generate notifications for enrolled students if published
    if (newMaterial.is_published) {
      const enrolledStudents = this.getStudentsByClass(newMaterial.class_id);
      const subject = this.getSubjectById(newMaterial.subject_id);
      enrolledStudents.forEach(st => {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          recipient_profile_id: st.profile_id,
          title: `New Study Material: ${subject?.name || 'Class'}`,
          message: `New note "${newMaterial.title}" was published for ${newMaterial.topic}.`,
          type: 'recommendation',
          is_read: false,
          created_at: now,
          link: `/student/materials`,
        });
      });
    }

    this.notify();
    return this.getLearningMaterialById(id)!;
  }

  public updateLearningMaterial(
    id: string,
    updates: Partial<LearningMaterial>,
    actor?: { id: string; name: string; role: UserRole }
  ): LearningMaterial | undefined {
    const index = this.data.learningMaterials?.findIndex(m => m.id === id);
    if (index === undefined || index === -1) return undefined;

    const existing = this.data.learningMaterials[index];
    const updated: LearningMaterial = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.learningMaterials[index] = updated;

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Updated Learning Material',
        'LearningMaterial',
        id,
        `Modified material "${updated.title}".`
      );
    }

    this.notify();
    return this.getLearningMaterialById(id);
  }

  public deleteLearningMaterial(id: string, actor?: { id: string; name: string; role: UserRole }): boolean {
    if (!this.data.learningMaterials) return false;
    const index = this.data.learningMaterials.findIndex(m => m.id === id);
    if (index === -1) return false;

    const deleted = this.data.learningMaterials[index];
    this.data.learningMaterials.splice(index, 1);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Deleted Learning Material',
        'LearningMaterial',
        id,
        `Deleted material "${deleted.title}".`
      );
    }

    this.notify();
    return true;
  }

  public recordMaterialView(materialId: string, studentId?: string): void {
    const mat = this.data.learningMaterials?.find(m => m.id === materialId);
    if (mat) {
      mat.view_count = (mat.view_count || 0) + 1;
      this.notify();
    }
  }

  // --------------------------------------------------------------------------
  // ASSIGNMENT MANAGEMENT METHODS
  // --------------------------------------------------------------------------

  public getAssignments(filters?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    studentId?: string;
    status?: string;
    search?: string;
  }): Assignment[] {
    let list = [...(this.data.assignments || [])];

    if (filters?.classId) {
      list = list.filter(a => a.class_id === filters.classId);
    }
    if (filters?.subjectId) {
      list = list.filter(a => a.subject_id === filters.subjectId);
    }
    if (filters?.teacherId) {
      list = list.filter(a => a.teacher_id === filters.teacherId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.topic && a.topic.toLowerCase().includes(q))
      );
    }

    return list
      .map(a => {
        const subs = (this.data.assignmentSubmissions || []).filter(s => s.assignment_id === a.id);
        const graded = subs.filter(s => s.status === 'graded');
        return {
          ...a,
          teacher: this.getTeacherById(a.teacher_id),
          subject: this.getSubjectById(a.subject_id),
          class: this.getClassById(a.class_id),
          submission_count: subs.length,
          graded_count: graded.length,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAssignmentById(id: string): Assignment | undefined {
    const a = this.data.assignments?.find(item => item.id === id);
    if (!a) return undefined;
    const subs = (this.data.assignmentSubmissions || []).filter(s => s.assignment_id === a.id);
    const graded = subs.filter(s => s.status === 'graded');
    return {
      ...a,
      teacher: this.getTeacherById(a.teacher_id),
      subject: this.getSubjectById(a.subject_id),
      class: this.getClassById(a.class_id),
      submission_count: subs.length,
      graded_count: graded.length,
    };
  }

  public createAssignment(
    data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>,
    actor?: { id: string; name: string; role: UserRole }
  ): Assignment {
    const id = `asg-${Date.now()}`;
    const now = new Date().toISOString();
    const newAssignment: Assignment = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

    if (!this.data.assignments) this.data.assignments = [];
    this.data.assignments.unshift(newAssignment);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Created Assignment',
        'Assignment',
        id,
        `Created assignment "${newAssignment.title}" with max marks ${newAssignment.max_marks}.`
      );
    }

    // Auto-notify enrolled students and parents if published
    if (newAssignment.status === 'published') {
      const enrolledStudents = this.getStudentsByClass(newAssignment.class_id);
      const subject = this.getSubjectById(newAssignment.subject_id);
      const formattedDueDate = new Date(newAssignment.due_date).toLocaleDateString();

      enrolledStudents.forEach(st => {
        // Notify Student
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          recipient_profile_id: st.profile_id,
          title: `New Assignment: ${subject?.name || 'Class'}`,
          message: `"${newAssignment.title}" is due on ${formattedDueDate}. Max marks: ${newAssignment.max_marks}.`,
          type: 'warning',
          is_read: false,
          created_at: now,
          link: `/student/assignments`,
        });

        // Notify Parent if linked
        if (st.parent_id) {
          const parent = this.getParentById(st.parent_id);
          if (parent) {
            this.data.notifications.unshift({
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              recipient_profile_id: parent.profile_id,
              title: `New Homework Assigned for Ward`,
              message: `Your ward has a new assignment "${newAssignment.title}" for ${subject?.name || 'Subject'} due ${formattedDueDate}.`,
              type: 'system',
              is_read: false,
              created_at: now,
              link: `/parent/assignments`,
            });
          }
        }
      });
    }

    this.notify();
    return this.getAssignmentById(id)!;
  }

  public updateAssignment(
    id: string,
    updates: Partial<Assignment>,
    actor?: { id: string; name: string; role: UserRole }
  ): Assignment | undefined {
    const index = this.data.assignments?.findIndex(a => a.id === id);
    if (index === undefined || index === -1) return undefined;

    const existing = this.data.assignments[index];
    const updated: Assignment = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.assignments[index] = updated;

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Updated Assignment',
        'Assignment',
        id,
        `Updated assignment "${updated.title}".`
      );
    }

    this.notify();
    return this.getAssignmentById(id);
  }

  public deleteAssignment(id: string, actor?: { id: string; name: string; role: UserRole }): boolean {
    if (!this.data.assignments) return false;
    const index = this.data.assignments.findIndex(a => a.id === id);
    if (index === -1) return false;

    const deleted = this.data.assignments[index];
    this.data.assignments.splice(index, 1);

    // Also remove associated submissions
    if (this.data.assignmentSubmissions) {
      this.data.assignmentSubmissions = this.data.assignmentSubmissions.filter(s => s.assignment_id !== id);
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Deleted Assignment',
        'Assignment',
        id,
        `Deleted assignment "${deleted.title}".`
      );
    }

    this.notify();
    return true;
  }

  // --------------------------------------------------------------------------
  // SUBMISSION & GRADING METHODS
  // --------------------------------------------------------------------------

  public getSubmissions(filters?: {
    assignmentId?: string;
    studentId?: string;
    classId?: string;
    status?: string;
    isLate?: boolean;
    search?: string;
  }): AssignmentSubmission[] {
    let list = [...(this.data.assignmentSubmissions || [])];

    if (filters?.assignmentId) {
      list = list.filter(s => s.assignment_id === filters.assignmentId);
    }
    if (filters?.studentId) {
      list = list.filter(s => s.student_id === filters.studentId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(s => s.status === filters.status);
    }
    if (filters?.isLate !== undefined) {
      list = list.filter(s => s.is_late === filters.isLate);
    }

    return list
      .map(s => ({
        ...s,
        student: this.getStudentById(s.student_id),
        assignment: this.getAssignmentById(s.assignment_id),
        grader: s.graded_by ? this.getTeacherById(s.graded_by) : undefined,
      }))
      .filter(s => {
        if (filters?.classId && s.assignment?.class_id !== filters.classId) return false;
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          const studentName = s.student?.profile?.full_name?.toLowerCase() || '';
          const roll = s.student?.roll_number?.toLowerCase() || '';
          const title = s.assignment?.title?.toLowerCase() || '';
          return studentName.includes(q) || roll.includes(q) || title.includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public getSubmissionById(id: string): AssignmentSubmission | undefined {
    const s = this.data.assignmentSubmissions?.find(item => item.id === id);
    if (!s) return undefined;
    return {
      ...s,
      student: this.getStudentById(s.student_id),
      assignment: this.getAssignmentById(s.assignment_id),
      grader: s.graded_by ? this.getTeacherById(s.graded_by) : undefined,
    };
  }

  public getSubmissionForStudentAndAssignment(
    studentId: string,
    assignmentId: string
  ): AssignmentSubmission | undefined {
    const s = this.data.assignmentSubmissions?.find(
      item => item.student_id === studentId && item.assignment_id === assignmentId
    );
    if (!s) return undefined;
    return this.getSubmissionById(s.id);
  }

  public submitAssignment(
    data: {
      assignmentId: string;
      studentId: string;
      filePath?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      textSubmission?: string;
      comments?: string;
    },
    actor?: { id: string; name: string; role: UserRole }
  ): AssignmentSubmission {
    const assignment = this.getAssignmentById(data.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const now = new Date();
    const nowIso = now.toISOString();
    const isLate = now > new Date(assignment.due_date);
    const status: SubmissionStatus = isLate ? 'late' : 'submitted';

    // Check if existing submission to update/resubmit
    const existingIndex = this.data.assignmentSubmissions?.findIndex(
      s => s.assignment_id === data.assignmentId && s.student_id === data.studentId
    );

    let submission: AssignmentSubmission;

    if (existingIndex !== undefined && existingIndex !== -1) {
      const existing = this.data.assignmentSubmissions[existingIndex];
      submission = {
        ...existing,
        file_path: data.filePath || existing.file_path,
        file_url: data.fileUrl || existing.file_url,
        file_name: data.fileName || existing.file_name,
        file_size: data.fileSize !== undefined ? data.fileSize : existing.file_size,
        mime_type: data.mimeType || existing.mime_type,
        text_submission: data.textSubmission !== undefined ? data.textSubmission : existing.text_submission,
        comments: data.comments !== undefined ? data.comments : existing.comments,
        submitted_at: nowIso,
        status,
        is_late: isLate,
        updated_at: nowIso,
      };
      this.data.assignmentSubmissions[existingIndex] = submission;
    } else {
      submission = {
        id: `subm-${Date.now()}`,
        assignment_id: data.assignmentId,
        student_id: data.studentId,
        file_path: data.filePath,
        file_url: data.fileUrl,
        file_name: data.fileName,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        text_submission: data.textSubmission,
        comments: data.comments,
        submitted_at: nowIso,
        status,
        is_late: isLate,
        created_at: nowIso,
        updated_at: nowIso,
      };
      if (!this.data.assignmentSubmissions) this.data.assignmentSubmissions = [];
      this.data.assignmentSubmissions.unshift(submission);
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Submitted Assignment Work',
        'AssignmentSubmission',
        submission.id,
        `Student submitted work for "${assignment.title}" (${isLate ? 'LATE' : 'ON-TIME'}).`
      );
    }

    // Notify Teacher about student submission
    const teacher = this.getTeacherById(assignment.teacher_id);
    const student = this.getStudentById(data.studentId);
    if (teacher) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        recipient_profile_id: teacher.profile_id,
        title: `Work Submitted: ${assignment.title}`,
        message: `${student?.profile?.full_name || 'Student'} (${student?.roll_number}) submitted work${isLate ? ' (LATE)' : ''}.`,
        type: 'attendance_alert',
        is_read: false,
        created_at: nowIso,
        link: `/teacher/assignments/${assignment.id}/submissions`,
      });
    }

    this.notify();
    return this.getSubmissionById(submission.id)!;
  }

  public gradeSubmission(
    submissionId: string,
    gradeData: {
      marks: number;
      feedback: string;
      gradedByTeacherId: string;
    },
    actor?: { id: string; name: string; role: UserRole }
  ): AssignmentSubmission {
    const index = this.data.assignmentSubmissions?.findIndex(s => s.id === submissionId);
    if (index === undefined || index === -1) throw new Error('Submission not found');

    const now = new Date().toISOString();
    const existing = this.data.assignmentSubmissions[index];
    const assignment = this.getAssignmentById(existing.assignment_id);

    const updated: AssignmentSubmission = {
      ...existing,
      marks: gradeData.marks,
      feedback: gradeData.feedback,
      graded_by: gradeData.gradedByTeacherId,
      graded_at: now,
      status: 'graded',
      updated_at: now,
    };

    this.data.assignmentSubmissions[index] = updated;

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Graded Student Submission',
        'AssignmentSubmission',
        submissionId,
        `Awarded ${gradeData.marks}/${assignment?.max_marks || 100} for "${assignment?.title}".`
      );
    }

    // Notify Student & Parent about graded work
    const student = this.getStudentById(existing.student_id);
    if (student) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        recipient_profile_id: student.profile_id,
        title: `Assignment Graded: ${assignment?.title}`,
        message: `Your score: ${gradeData.marks}/${assignment?.max_marks || 100}. Feedback: "${gradeData.feedback.slice(0, 80)}..."`,
        type: 'recommendation',
        is_read: false,
        created_at: now,
        link: `/student/assignments`,
      });

      if (student.parent_id) {
        const parent = this.getParentById(student.parent_id);
        if (parent) {
          this.data.notifications.unshift({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            recipient_profile_id: parent.profile_id,
            title: `Assignment Evaluated for Ward`,
            message: `Score for ${assignment?.title}: ${gradeData.marks}/${assignment?.max_marks || 100}.`,
            type: 'system',
            is_read: false,
            created_at: now,
            link: `/parent/assignments`,
          });
        }
      }
    }

    this.notify();
    return this.getSubmissionById(submissionId)!;
  }

  public returnSubmission(
    submissionId: string,
    feedback: string,
    actor?: { id: string; name: string; role: UserRole }
  ): AssignmentSubmission {
    const index = this.data.assignmentSubmissions?.findIndex(s => s.id === submissionId);
    if (index === undefined || index === -1) throw new Error('Submission not found');

    const now = new Date().toISOString();
    const existing = this.data.assignmentSubmissions[index];
    const assignment = this.getAssignmentById(existing.assignment_id);

    const updated: AssignmentSubmission = {
      ...existing,
      feedback,
      status: 'returned',
      returned_at: now,
      updated_at: now,
    };

    this.data.assignmentSubmissions[index] = updated;

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Returned Submission for Revision',
        'AssignmentSubmission',
        submissionId,
        `Returned work for "${assignment?.title}" with request for revision.`
      );
    }

    const student = this.getStudentById(existing.student_id);
    if (student) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        recipient_profile_id: student.profile_id,
        title: `Assignment Returned for Revision: ${assignment?.title}`,
        message: `Teacher comments: "${feedback}". Please update and resubmit.`,
        type: 'warning',
        is_read: false,
        created_at: now,
        link: `/student/assignments`,
      });
    }

    this.notify();
    return this.getSubmissionById(submissionId)!;
  }

  // --------------------------------------------------------------------------
  // STUDENT DOUBTS & PROBLEMS
  // --------------------------------------------------------------------------

  public getStudentProblems(filters?: {
    studentId?: string;
    teacherId?: string;
    subjectId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): StudentProblem[] {
    let list = [...(this.data.studentProblems || [])];

    if (filters?.studentId) {
      list = list.filter(p => p.student_id === filters.studentId);
    }
    if (filters?.teacherId) {
      list = list.filter(p => p.teacher_id === filters.teacherId);
    }
    if (filters?.subjectId) {
      list = list.filter(p => p.subject_id === filters.subjectId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter(p => p.priority === filters.priority);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.topic && p.topic.toLowerCase().includes(q))
      );
    }

    return list
      .map(p => {
        const responses = (this.data.problemResponses || [])
          .filter(r => r.problem_id === p.id)
          .map(r => ({
            ...r,
            responder: this.getProfileById(r.responder_profile_id),
          }))
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return {
          ...p,
          student: this.getStudentById(p.student_id),
          teacher: this.getTeacherById(p.teacher_id),
          subject: this.getSubjectById(p.subject_id),
          responses,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getProblemById(id: string): StudentProblem | undefined {
    const p = this.data.studentProblems?.find(item => item.id === id);
    if (!p) return undefined;
    const responses = (this.data.problemResponses || [])
      .filter(r => r.problem_id === p.id)
      .map(r => ({
        ...r,
        responder: this.getProfileById(r.responder_profile_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      ...p,
      student: this.getStudentById(p.student_id),
      teacher: this.getTeacherById(p.teacher_id),
      subject: this.getSubjectById(p.subject_id),
      responses,
    };
  }

  public createStudentProblem(
    data: Omit<StudentProblem, 'id' | 'created_at' | 'updated_at'>,
    actor?: { id: string; name: string; role: UserRole }
  ): StudentProblem {
    const id = `prob-${Date.now()}`;
    const now = new Date().toISOString();
    const newProblem: StudentProblem = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

    if (!this.data.studentProblems) this.data.studentProblems = [];
    this.data.studentProblems.unshift(newProblem);

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Submitted Doubt/Problem',
        'StudentProblem',
        id,
        `Raised doubt "${newProblem.title}" for subject.`
      );
    }

    // Notify Teacher
    const teacher = this.getTeacherById(newProblem.teacher_id);
    const student = this.getStudentById(newProblem.student_id);
    if (teacher) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        recipient_profile_id: teacher.profile_id,
        title: `New Student Doubt (${newProblem.priority.toUpperCase()})`,
        message: `${student?.profile?.full_name || 'Student'}: "${newProblem.title}"`,
        type: 'warning',
        is_read: false,
        created_at: now,
        link: `/teacher/problems`,
      });
    }

    this.notify();
    return this.getProblemById(id)!;
  }

  public updateProblemStatus(
    problemId: string,
    status: ProblemStatus,
    actor?: { id: string; name: string; role: UserRole }
  ): StudentProblem | undefined {
    const index = this.data.studentProblems?.findIndex(p => p.id === problemId);
    if (index === undefined || index === -1) return undefined;

    const now = new Date().toISOString();
    const existing = this.data.studentProblems[index];
    const updated: StudentProblem = {
      ...existing,
      status,
      updated_at: now,
      resolved_at: status === 'resolved' || status === 'closed' ? now : undefined,
    };

    this.data.studentProblems[index] = updated;

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Updated Doubt Status',
        'StudentProblem',
        problemId,
        `Changed doubt status to ${status.toUpperCase()}.`
      );
    }

    this.notify();
    return this.getProblemById(problemId);
  }

  public addProblemResponse(
    data: {
      problemId: string;
      responderProfileId: string;
      message: string;
      attachmentName?: string;
      attachmentUrl?: string;
    },
    actor?: { id: string; name: string; role: UserRole }
  ): ProblemResponse {
    const now = new Date().toISOString();
    const newResponse: ProblemResponse = {
      id: `resp-${Date.now()}`,
      problem_id: data.problemId,
      responder_profile_id: data.responderProfileId,
      message: data.message,
      attachment_name: data.attachmentName,
      attachment_url: data.attachmentUrl,
      created_at: now,
    };

    if (!this.data.problemResponses) this.data.problemResponses = [];
    this.data.problemResponses.push(newResponse);

    // Update parent problem timestamp and status
    const problem = this.getProblemById(data.problemId);
    if (problem) {
      const problemIndex = this.data.studentProblems.findIndex(p => p.id === data.problemId);
      if (problemIndex !== -1) {
        this.data.studentProblems[problemIndex].updated_at = now;
        if (this.data.studentProblems[problemIndex].status === 'open') {
          this.data.studentProblems[problemIndex].status = 'in_progress';
        }
      }

      // Notify the other party
      const isTeacherReplying = actor?.role === 'teacher' || actor?.role === 'administrator';
      if (isTeacherReplying && problem.student) {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          recipient_profile_id: problem.student.profile_id,
          title: `Teacher Replied to Your Doubt`,
          message: `Prof. replied: "${data.message.slice(0, 80)}..."`,
          type: 'recommendation',
          is_read: false,
          created_at: now,
          link: `/student/problems`,
        });
      } else if (!isTeacherReplying && problem.teacher) {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          recipient_profile_id: problem.teacher.profile_id,
          title: `New Reply on Doubt: ${problem.title}`,
          message: `${problem.student?.profile?.full_name || 'Student'}: "${data.message.slice(0, 80)}..."`,
          type: 'system',
          is_read: false,
          created_at: now,
          link: `/teacher/problems`,
        });
      }
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Replied to Doubt',
        'ProblemResponse',
        newResponse.id,
        `Replied on doubt thread #${data.problemId}.`
      );
    }

    this.notify();
    return {
      ...newResponse,
      responder: this.getProfileById(data.responderProfileId),
    };
  }

  // --------------------------------------------------------------------------
  // ACADEMIC ACTIVITY ANALYTICS
  // --------------------------------------------------------------------------

  public getAcademicActivitySummary(studentId: string): AcademicActivitySummary {
    const student = this.getStudentById(studentId);
    const classId = student?.class_id;

    // Get all published assignments applicable to this student's class
    const assignments = (this.data.assignments || []).filter(
      a => (!classId || a.class_id === classId) && a.status !== 'draft'
    );
    const submissions = (this.data.assignmentSubmissions || []).filter(s => s.student_id === studentId);
    const problems = (this.data.studentProblems || []).filter(p => p.student_id === studentId);

    const totalAssignments = assignments.length;
    const submittedCount = submissions.filter(s => s.status !== 'not_started').length;
    const lateCount = submissions.filter(s => s.is_late || s.status === 'late').length;
    const unsubmittedCount = Math.max(0, totalAssignments - submittedCount);

    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.marks !== undefined);
    let avgScorePct = 0;
    if (gradedSubmissions.length > 0) {
      const totalScoreEarned = gradedSubmissions.reduce((acc, s) => {
        const asg = assignments.find(a => a.id === s.assignment_id);
        const maxMarks = asg?.max_marks || 100;
        return acc + ((s.marks || 0) / maxMarks) * 100;
      }, 0);
      avgScorePct = Number((totalScoreEarned / gradedSubmissions.length).toFixed(1));
    }

    const openProblems = problems.filter(p => p.status === 'open' || p.status === 'in_progress').length;
    const resolvedProblems = problems.filter(p => p.status === 'resolved' || p.status === 'closed').length;

    // Determine Academic Activity Level (Healthy, Moderate, Low)
    let activityLevel: 'Healthy' | 'Moderate' | 'Low' = 'Healthy';
    const completionRate = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : 100;

    if (completionRate < 50 || (totalAssignments > 1 && unsubmittedCount >= 2)) {
      activityLevel = 'Low';
    } else if (completionRate < 80 || lateCount >= 2) {
      activityLevel = 'Moderate';
    }

    return {
      student_id: studentId,
      activity_level: activityLevel,
      total_assignments: totalAssignments,
      submitted_assignments: submittedCount,
      late_submissions: lateCount,
      unsubmitted_assignments: unsubmittedCount,
      graded_assignments: gradedSubmissions.length,
      average_score_pct: avgScorePct,
      open_problems_count: openProblems,
      resolved_problems_count: resolvedProblems,
      notes_viewed_count: 14,
    };
  }

  public getAllAcademicActivitySummaries(): AcademicActivitySummary[] {
    return this.getStudents().map(st => this.getAcademicActivitySummary(st.id));
  }

  // --------------------------------------------------------------------------
  // AI ABSENCE RISK PREDICTION METHODS
  // --------------------------------------------------------------------------

  public getAbsencePredictions(filters?: {
    studentId?: string;
    classId?: string;
    subjectId?: string;
    riskLevel?: RiskLevel;
    prediction?: 'Likely Present' | 'Likely Absent';
    targetDate?: string;
    actualResult?: string;
    search?: string;
  }): AbsencePrediction[] {
    let list = [...(this.data.absencePredictions || [])];

    if (filters?.studentId) {
      list = list.filter(p => p.student_id === filters.studentId);
    }
    if (filters?.classId && filters.classId !== 'all') {
      list = list.filter(p => p.class_id === filters.classId);
    }
    if (filters?.subjectId && filters.subjectId !== 'all') {
      list = list.filter(p => p.subject_id === filters.subjectId);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'ALL' as any) {
      list = list.filter(p => p.risk_level === filters.riskLevel);
    }
    if (filters?.prediction && filters.prediction !== 'ALL' as any) {
      list = list.filter(p => p.prediction === filters.prediction);
    }
    if (filters?.targetDate) {
      list = list.filter(p => p.target_date === filters.targetDate);
    }
    if (filters?.actualResult && filters.actualResult !== 'all') {
      list = list.filter(p => p.actual_result === filters.actualResult);
    }

    return list
      .map(p => ({
        ...p,
        student: this.getStudentById(p.student_id),
        subject: this.getSubjectById(p.subject_id),
        class: this.getClassById(p.class_id),
      }))
      .filter(p => {
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          const name = p.student?.profile?.full_name?.toLowerCase() || '';
          const roll = p.student?.roll_number?.toLowerCase() || '';
          const subName = p.subject?.name?.toLowerCase() || '';
          return name.includes(q) || roll.includes(q) || subName.includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAbsencePredictionById(id: string): AbsencePrediction | undefined {
    const p = this.data.absencePredictions?.find(item => item.id === id);
    if (!p) return undefined;
    return {
      ...p,
      student: this.getStudentById(p.student_id),
      subject: this.getSubjectById(p.subject_id),
      class: this.getClassById(p.class_id),
    };
  }

  public saveAbsencePrediction(
    prediction: AbsencePrediction,
    actor?: { id: string; name: string; role: UserRole }
  ): AbsencePrediction {
    if (!this.data.absencePredictions) this.data.absencePredictions = [];

    // Replace if exact match for student + subject + target_date, or push new
    const existingIdx = this.data.absencePredictions.findIndex(
      p =>
        p.student_id === prediction.student_id &&
        p.subject_id === prediction.subject_id &&
        p.target_date === prediction.target_date
    );

    if (existingIdx >= 0) {
      this.data.absencePredictions[existingIdx] = {
        ...this.data.absencePredictions[existingIdx],
        ...prediction,
      };
    } else {
      this.data.absencePredictions.unshift(prediction);
    }

    // Auto-generate notification if HIGH risk (>= 70%)
    if (prediction.risk_level === 'HIGH' || prediction.absence_probability >= 70) {
      const student = this.getStudentById(prediction.student_id);
      const subject = this.getSubjectById(prediction.subject_id);
      const studentName = student?.profile?.full_name || 'Student';
      const subjectName = subject?.name || 'Class';

      // Notification for Student
      if (student?.profile_id) {
        this.data.notifications.unshift({
          id: `notif-pred-stud-${Date.now()}`,
          recipient_profile_id: student.profile_id,
          title: `Absence Risk Alert for ${subjectName}`,
          message: `Predictor calculated a ${prediction.absence_probability}% probability of missing class on ${prediction.target_date}. Please plan to attend.`,
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString(),
          link: '/student/absence-predictor',
        });
      }

      // Notification for Parent
      if (student?.parent?.profile_id) {
        this.data.notifications.unshift({
          id: `notif-pred-parent-${Date.now()}`,
          recipient_profile_id: student.parent.profile_id,
          title: `Upcoming Attendance Risk: ${studentName}`,
          message: `Statistical model projects high absence probability (${prediction.absence_probability}%) for ${studentName} on ${prediction.target_date} (${subjectName}).`,
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString(),
          link: '/parent/prediction',
        });
      }

      // System alert
      this.data.alerts.unshift({
        id: `alert-pred-${Date.now()}`,
        student_id: prediction.student_id,
        type: 'prediction_warning',
        severity: 'high',
        title: `High Absence Probability: ${studentName}`,
        message: `Projected ${prediction.absence_probability}% probability of absence on ${prediction.target_date} for ${subjectName}.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Generated Absence Prediction',
        'AbsencePrediction',
        prediction.id,
        `Ran statistical absence prediction for ${prediction.student_id} on ${prediction.target_date}. Result: ${prediction.prediction} (${prediction.absence_probability}%).`
      );
    }

    this.notify();
    return this.getAbsencePredictionById(prediction.id)!;
  }

  public batchSaveAbsencePredictions(
    predictions: AbsencePrediction[],
    actor?: { id: string; name: string; role: UserRole }
  ): { success: boolean; count: number } {
    if (!this.data.absencePredictions) this.data.absencePredictions = [];

    predictions.forEach(pred => {
      const existingIdx = this.data.absencePredictions.findIndex(
        p =>
          p.student_id === pred.student_id &&
          p.subject_id === pred.subject_id &&
          p.target_date === pred.target_date
      );

      if (existingIdx >= 0) {
        this.data.absencePredictions[existingIdx] = {
          ...this.data.absencePredictions[existingIdx],
          ...pred,
        };
      } else {
        this.data.absencePredictions.unshift(pred);
      }
    });

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Batch Absence Predictions Generated',
        'AbsencePrediction',
        predictions[0]?.class_id,
        `Generated ${predictions.length} absence predictions for class ${predictions[0]?.class_id} on ${predictions[0]?.target_date}.`
      );
    }

    this.notify();
    return { success: true, count: predictions.length };
  }

  public evaluateAbsencePrediction(
    id: string,
    actualStatus: AttendanceStatus,
    actor?: { id: string; name: string; role: UserRole }
  ): AbsencePrediction | undefined {
    const pred = this.getAbsencePredictionById(id);
    if (!pred) return undefined;

    const isActualAbsent = actualStatus === 'absent';
    const isPredictedAbsent = pred.prediction === 'Likely Absent';
    const isCorrect =
      (isPredictedAbsent && isActualAbsent) || (!isPredictedAbsent && !isActualAbsent);

    const idx = this.data.absencePredictions.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.absencePredictions[idx] = {
        ...this.data.absencePredictions[idx],
        actual_result: isCorrect ? 'correct' : 'incorrect',
        actual_attendance_status: actualStatus,
        evaluated_at: new Date().toISOString(),
      };
    }

    if (actor) {
      this.logAuditAction(
        actor.id,
        actor.name,
        actor.role,
        'Evaluated Absence Prediction',
        'AbsencePrediction',
        id,
        `Evaluated prediction #${id}: Actual=${actualStatus}, Predicted=${pred.prediction} => Result: ${isCorrect ? 'Correct' : 'Incorrect'}.`
      );
    }

    this.notify();
    return this.getAbsencePredictionById(id);
  }
}

export const dataStore = new DataStore();


