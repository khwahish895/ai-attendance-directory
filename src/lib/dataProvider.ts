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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored database state, initializing fresh data.', e);
    }
    const initial = generateInitialData();
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

  public getTeachers(): Teacher[] {
    return this.data.teachers.map(t => ({
      ...t,
      profile: this.data.profiles.find(p => p.id === t.profile_id),
    }));
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

  public getSubjects(): Subject[] {
    return [...this.data.subjects];
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
}

export const dataStore = new DataStore();
