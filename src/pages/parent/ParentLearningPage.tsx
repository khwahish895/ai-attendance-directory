import React, { useState, useEffect } from 'react';
import {
  FileCode,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Download,
  Eye,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { Assignment, AssignmentSubmission, LearningMaterial } from '../../types';
import { getDeadlineInfo, calculateAssignmentStats } from '../../services/learningService';
import { downloadFile, formatBytes } from '../../services/storageService';
import { FileViewerModal } from '../../components/learning/FileViewerModal';

export const ParentLearningPage: React.FC = () => {
  const { user } = useAuth();
  const allParents = dataStore.getParents();
  const allStudents = dataStore.getStudents();
  const parent = user ? allParents.find(p => p.profile_id === user.id) || allParents[0] : allParents[0];
  const student = allStudents.find(s => s.parent_id === parent?.id) || (parent?.students && parent.students[0]) || allStudents[0];

  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [viewingFile, setViewingFile] = useState<LearningMaterial | null>(null);

  const loadData = () => {
    if (!student) return;
    const mats = dataStore.getLearningMaterials({ classId: student.class_id });
    const asgs = dataStore.getAssignments({ classId: student.class_id });
    const subs = dataStore.getStudentSubmissions(student.id);

    setMaterials(mats);
    setAssignments(asgs);
    setSubmissions(subs);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return () => unsubscribe();
  }, [student?.id, student?.class_id]);

  const stats = calculateAssignmentStats(assignments, submissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
              Ward Academic Monitoring
            </span>
            <span className="text-xs text-muted-foreground">
              Class: <strong>{student?.class?.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {student?.profile?.full_name || 'Ward'}&apos;s Academic & Assignment Progress
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track homework submissions, teacher grading remarks, scores, and class study materials in real-time.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Total Assignments</span>
          <p className="text-xl font-bold text-foreground mt-1">{assignments.length}</p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Submissions Completed</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {submissions.filter(s => s.status !== 'not_started').length} / {assignments.length}
          </p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Graded Submissions</span>
          <p className="text-xl font-bold text-primary mt-1">{stats.gradedCount}</p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Average Evaluation</span>
          <p className="text-xl font-bold text-foreground mt-1">{stats.averageScore} pts</p>
        </div>
      </div>

      {/* Assignments & Performance Table */}
      <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          <span>Coursework & Evaluation Breakdown</span>
        </h2>

        {assignments.length > 0 ? (
          <div className="space-y-3">
            {assignments.map(asg => {
              const submission = submissions.find(s => s.assignment_id === asg.id);
              const deadline = getDeadlineInfo(asg.due_date);
              const isGraded = submission?.status === 'graded';
              const isSubmitted = submission && submission.status !== 'not_started';

              return (
                <div
                  key={asg.id}
                  className="p-4 rounded-xl bg-background border border-border space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {asg.subject?.code} - {asg.subject?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{asg.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{asg.topic}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isGraded ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Score: {submission?.marks} / {asg.max_marks} pts
                          </span>
                        </div>
                      ) : isSubmitted ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {submission?.is_late ? 'Submitted Late' : 'Submitted (Pending Review)'}
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          deadline.isOverdue
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {deadline.timeLeftFormatted}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Qualitative Feedback box */}
                  {isGraded && submission?.feedback && (
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Teacher Feedback:</span>
                      <p className="text-foreground italic">&quot;{submission.feedback}&quot;</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No assignments recorded for this class yet.
          </div>
        )}
      </div>

      {/* Available Study Materials */}
      <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>Class Study Materials & Resources ({materials.length})</span>
        </h2>

        {materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.map(mat => (
              <div
                key={mat.id}
                className="p-4 rounded-xl bg-background border border-border flex flex-col justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {mat.subject?.code}
                  </span>
                  <h3 className="text-xs font-bold text-foreground mt-2 line-clamp-1">{mat.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{mat.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-foreground">
                    {mat.file_size ? formatBytes(mat.file_size) : 'Resource'}
                  </span>
                  <button
                    onClick={() => setViewingFile(mat)}
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No study materials published yet.
          </div>
        )}
      </div>

      {/* File Viewer */}
      {viewingFile && (
        <FileViewerModal
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          title={viewingFile.title}
          fileUrl={viewingFile.file_url}
          fileName={viewingFile.file_name}
          fileSize={viewingFile.file_size}
          mimeType={viewingFile.mime_type}
          contentText={viewingFile.content_text}
          externalUrl={viewingFile.external_url}
          authorName={viewingFile.teacher?.profile?.full_name}
          date={viewingFile.created_at}
        />
      )}
    </div>
  );
};
