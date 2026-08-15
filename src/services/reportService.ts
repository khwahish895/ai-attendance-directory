import { dataStore } from '../lib/dataProvider';
import { Student, Class, RiskAssessment } from '../types';

export interface StudentReportRow {
  rollNumber: string;
  studentName: string;
  className: string;
  department: string;
  attendancePercentage: number;
  riskLevel: string;
  consecutiveAbsences: number;
  isEligible: boolean;
}

export const reportService = {
  generateEligibilityReport: (classId?: string): StudentReportRow[] => {
    const students = dataStore.getStudents();
    const classes = dataStore.getClasses();
    const risks = dataStore.getRiskAssessments();

    return students
      .filter(s => !classId || s.class_id === classId)
      .map(s => {
        const risk = risks.find(r => r.student_id === s.id);
        const cls = classes.find(c => c.id === s.class_id);
        const pct = risk ? risk.attendance_percentage : 0;
        return {
          rollNumber: s.roll_number,
          studentName: s.profile?.full_name || 'Student',
          className: cls?.name || 'N/A',
          department: s.department,
          attendancePercentage: pct,
          riskLevel: risk?.risk_level || 'LOW',
          consecutiveAbsences: risk?.consecutive_absences || 0,
          isEligible: pct >= 75,
        };
      });
  },
  downloadCSV: (filename: string, rows: any[], headers?: string[]) => {
    if (!rows || rows.length === 0) return;
    const finalHeaders = headers || (Array.isArray(rows[0]) ? [] : Object.keys(rows[0]));
    const formattedRows = rows.map(e => {
      if (Array.isArray(e)) return e.map(v => `"${v ?? ''}"`).join(',');
      return Object.values(e).map(v => `"${v ?? ''}"`).join(',');
    });
    const headerLine = finalHeaders.length > 0 ? [finalHeaders.map(h => `"${h}"`).join(',')] : [];
    const csvContent = 'data:text/csv;charset=utf-8,' + [...headerLine, ...formattedRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadCSV = reportService.downloadCSV;
