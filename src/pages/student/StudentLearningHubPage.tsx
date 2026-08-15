import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCode,
  HelpCircle,
  Calendar as CalendarIcon,
  Search,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Plus,
  Send,
  MessageSquare,
  Paperclip,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  FileText,
  Presentation,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import {
  LearningMaterial,
  Assignment,
  AssignmentSubmission,
  StudentProblem,
  Subject,
  ProblemCategory,
  ProblemPriority,
} from '../../types';
import { getDeadlineInfo, getMaterialTypeMeta, formatProblemCategory } from '../../services/learningService';
import { downloadFile, formatBytes, uploadFile } from '../../services/storageService';
import { FileViewerModal } from '../../components/learning/FileViewerModal';
import { StudentSubmitModal } from '../../components/learning/StudentSubmitModal';
import { ProblemThreadModal } from '../../components/learning/ProblemThreadModal';
import { AssignmentCalendarModal } from '../../components/learning/AssignmentCalendarModal';

export const StudentLearningHubPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'problems' | 'calendar'>('assignments');

  // Data state
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [problems, setProblems] = useState<StudentProblem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter states
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'overdue'>('all');

  // Modals
  const [viewingFile, setViewingFile] = useState<{
    isOpen: boolean;
    title: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    contentText?: string;
    externalUrl?: string;
    authorName?: string;
    date?: string;
  }>({ isOpen: false, title: '' });

  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<StudentProblem | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNewProblemModalOpen, setIsNewProblemModalOpen] = useState(false);

  // New problem form
  const [newProblemData, setNewProblemData] = useState({
    title: '',
    description: '',
    subject_id: '',
    category: 'concept_doubt' as ProblemCategory,
    priority: 'medium' as ProblemPriority,
  });
  const [problemAttachment, setProblemAttachment] = useState<File | null>(null);
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);
  const [problemError, setProblemError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const student = user ? dataStore.getStudentByProfileId(user.id) : undefined;
  const studentClassId = student?.class_id;

  const loadData = () => {
    if (!student) return;

    // Load materials for student's class
    const mats = dataStore.getLearningMaterials({
      classId: studentClassId,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
      search: searchQuery || undefined,
    });
    setMaterials(mats);

    // Load assignments for student's class
    const asgs = dataStore.getAssignments({
      classId: studentClassId,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
      search: searchQuery || undefined,
    });
    setAssignments(asgs);

    // Load student's submissions
    const subs = dataStore.getStudentSubmissions(student.id);
    setSubmissions(subs);

    // Load student's doubts
    const probs = dataStore.getStudentProblems({
      studentId: student.id,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
      search: searchQuery || undefined,
    });
    setProblems(probs);

    setSubjects(dataStore.getSubjects());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return () => unsubscribe();
  }, [subjectFilter, searchQuery, studentClassId, user?.id]);

  const handleOpenMaterial = (mat: LearningMaterial) => {
    dataStore.incrementMaterialView(mat.id);
    setViewingFile({
      isOpen: true,
      title: mat.title,
      fileUrl: mat.file_url,
      fileName: mat.file_name,
      fileSize: mat.file_size,
      mimeType: mat.mime_type,
      contentText: mat.content_text,
      externalUrl: mat.external_url,
      authorName: mat.teacher?.profile?.full_name,
      date: mat.created_at,
    });
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblemError('');

    if (!newProblemData.title.trim()) {
      setProblemError('Please enter a summary of your doubt.');
      return;
    }
    if (!newProblemData.subject_id) {
      setProblemError('Please select the relevant subject.');
      return;
    }
    if (!newProblemData.description.trim()) {
      setProblemError('Please describe the problem or question in detail.');
      return;
    }
    if (!student) return;

    try {
      setIsSubmittingProblem(true);
      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;

      if (problemAttachment) {
        const res = await uploadFile('student-submissions', problemAttachment, `problems/${student.id}`);
        attachmentUrl = res.fileUrl;
        attachmentName = res.fileName;
      }

      dataStore.createStudentProblem(
        {
          student_id: student.id,
          subject_id: newProblemData.subject_id,
          class_id: student.class_id,
          title: newProblemData.title.trim(),
          description: newProblemData.description.trim(),
          category: newProblemData.category,
          priority: newProblemData.priority,
          status: 'open',
          attachment_name: attachmentName,
          attachment_url: attachmentUrl,
        },
        user ? { id: user.id, name: user.full_name, role: user.role } : undefined
      );

      setIsSubmittingProblem(false);
      setIsNewProblemModalOpen(false);
      setNewProblemData({
        title: '',
        description: '',
        subject_id: subjects[0]?.id || '',
        category: 'concept_doubt',
        priority: 'medium',
      });
      setProblemAttachment(null);
      setToastMessage('Doubt submitted! Your instructor has been notified.');
      setTimeout(() => setToastMessage(''), 4000);
      loadData();
    } catch (err: any) {
      setIsSubmittingProblem(false);
      setProblemError(err.message || 'Failed to submit problem.');
    }
  };

  // Filtered assignments logic
  const filteredAssignments = assignments.filter(asg => {
    const submission = submissions.find(s => s.assignment_id === asg.id);
    const deadline = getDeadlineInfo(asg.due_date);

    if (assignmentStatusFilter === 'pending') {
      return !submission || submission.status === 'not_started';
    }
    if (assignmentStatusFilter === 'submitted') {
      return submission && (submission.status === 'submitted' || submission.status === 'late');
    }
    if (assignmentStatusFilter === 'graded') {
      return submission && submission.status === 'graded';
    }
    if (assignmentStatusFilter === 'overdue') {
      return (!submission || submission.status === 'not_started') && deadline.isOverdue;
    }
    return true;
  });

  const pendingCount = assignments.filter(a => {
    const s = submissions.find(sub => sub.assignment_id === a.id);
    return !s || s.status === 'not_started';
  }).length;

  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const openDoubtsCount = problems.filter(p => p.status === 'open' || p.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
              Class {student?.class?.name || 'Academic Center'}
            </span>
            <span className="text-xs text-muted-foreground">
              Roll No: <strong>{student?.roll_number}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Student Learning & Assignments Hub</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access lecture notes, submit coursework, track deadlines, and ask academic doubts directly to teachers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-open-calendar"
            onClick={() => setIsCalendarOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs"
          >
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>Deadlines Calendar</span>
          </button>

          <button
            id="btn-ask-doubt"
            onClick={() => {
              setNewProblemData({
                title: '',
                description: '',
                subject_id: subjects[0]?.id || '',
                category: 'concept_doubt',
                priority: 'medium',
              });
              setProblemAttachment(null);
              setIsNewProblemModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Doubt</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Available Materials</span>
          <p className="text-xl font-bold text-foreground mt-1">{materials.length}</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Pending Tasks</span>
          <p className={`text-xl font-bold mt-1 ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
            {pendingCount}
          </p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Graded Submissions</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{gradedCount}</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold">Active Doubts</span>
          <p className="text-xl font-bold text-primary mt-1">{openDoubtsCount}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>My Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'materials'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Notes & Study Material ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('problems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'problems'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>My Doubts & Discussions ({problems.length})</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-card rounded-2xl border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {activeTab === 'assignments' && (
            <select
              value={assignmentStatusFilter}
              onChange={e => setAssignmentStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Submission Statuses</option>
              <option value="pending">Pending Submissions</option>
              <option value="submitted">Submitted (Awaiting Grade)</option>
              <option value="graded">Graded & Marked</option>
              <option value="overdue">Overdue Deadlines</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB CONTENT 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map(asg => {
                const submission = submissions.find(s => s.assignment_id === asg.id);
                const deadline = getDeadlineInfo(asg.due_date);
                const isSubmitted = submission && submission.status !== 'not_started';
                const isGraded = submission?.status === 'graded';
                const isLateSubmission = submission?.is_late || submission?.status === 'late';

                return (
                  <div
                    key={asg.id}
                    className="p-5 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 truncate">
                          {asg.subject?.code} • {asg.subject?.name}
                        </span>

                        {isGraded ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Graded: {submission?.marks}/{asg.max_marks} pts
                          </span>
                        ) : isSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {isLateSubmission ? 'Submitted Late' : 'Submitted (Under Review)'}
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              deadline.isOverdue
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : deadline.isDueToday
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {deadline.timeLeftFormatted}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground">{asg.title}</h3>
                      <p className="text-xs text-primary font-semibold mt-0.5">{asg.topic}</p>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {asg.instructions || asg.description}
                      </p>

                      {/* Reference Attachment */}
                      {asg.attachment_url && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <Paperclip className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate">{asg.attachment_name || 'Assignment Reference File'}</span>
                          </div>
                          <button
                            onClick={() => downloadFile(asg.attachment_url!, asg.attachment_name || 'reference_file')}
                            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      )}

                      {/* Feedback box if graded */}
                      {isGraded && submission?.feedback && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                            Teacher Feedback:
                          </span>
                          <p className="text-foreground italic whitespace-pre-line">&quot;{submission.feedback}&quot;</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                      <div className="text-muted-foreground">
                        <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                        <span className="mx-1.5">•</span>
                        <span>Max {asg.max_marks} pts</span>
                      </div>

                      <button
                        id={`btn-submit-asg-${asg.id}`}
                        onClick={() => setSubmittingAssignment(asg)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs ${
                          isGraded
                            ? 'bg-muted hover:bg-muted/80 text-foreground'
                            : isSubmitted
                            ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        <span>{isGraded ? 'View Submitted Work' : isSubmitted ? 'Resubmit / Edit' : 'Submit Work'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-2">
              <FileCode className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">No Assignments Found</p>
              <p className="text-xs text-muted-foreground">No assignments match your current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: STUDY MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(mat => {
                const meta = getMaterialTypeMeta(mat.material_type);
                return (
                  <div
                    key={mat.id}
                    className="p-5 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 truncate">
                          {mat.subject?.code}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-2">{mat.title}</h3>
                      <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{mat.topic}</span>
                      </p>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {mat.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground">
                        {mat.file_size ? formatBytes(mat.file_size) : 'Online Resource'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenMaterial(mat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {mat.file_url && (
                          <button
                            onClick={() => {
                              dataStore.incrementMaterialView(mat.id);
                              downloadFile(mat.file_url!, mat.file_name || 'material');
                            }}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {mat.external_url && (
                          <a
                            href={mat.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => dataStore.incrementMaterialView(mat.id)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-2">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">No Study Materials Found</p>
              <p className="text-xs text-muted-foreground">Your teachers haven&apos;t published notes for this selection yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: DOUBTS & PROBLEMS */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              My Academic Doubts & Teacher Guidance ({problems.length})
            </h2>
            <button
              onClick={() => setIsNewProblemModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ask New Doubt</span>
            </button>
          </div>

          {problems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map(prob => {
                const responseCount = prob.responses?.length || 0;
                return (
                  <div
                    key={prob.id}
                    onClick={() => setSelectedProblem(prob)}
                    className="p-5 bg-card rounded-2xl border border-border hover:border-primary/40 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {formatProblemCategory(prob.category)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prob.status === 'resolved' || prob.status === 'closed'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : prob.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {prob.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-2">{prob.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prob.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>{prob.subject?.name}</span>
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{responseCount} {responseCount === 1 ? 'reply' : 'replies'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-2">
              <HelpCircle className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">No Doubts Raised</p>
              <p className="text-xs text-muted-foreground">
                Have questions about lectures, formulas, or homework? Click &quot;Ask New Doubt&quot; to get direct guidance from your teachers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {/* 1. File Viewer */}
      <FileViewerModal
        isOpen={viewingFile.isOpen}
        onClose={() => setViewingFile({ ...viewingFile, isOpen: false })}
        title={viewingFile.title}
        fileUrl={viewingFile.fileUrl}
        fileName={viewingFile.fileName}
        fileSize={viewingFile.fileSize}
        mimeType={viewingFile.mimeType}
        contentText={viewingFile.contentText}
        externalUrl={viewingFile.externalUrl}
        authorName={viewingFile.authorName}
        date={viewingFile.date}
      />

      {/* 2. Submit Assignment Work Modal */}
      {submittingAssignment && (
        <StudentSubmitModal
          isOpen={!!submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          assignment={submittingAssignment}
          existingSubmission={submissions.find(s => s.assignment_id === submittingAssignment.id)}
          onSubmitted={() => {
            setToastMessage('Assignment submitted successfully!');
            loadData();
            setTimeout(() => setToastMessage(''), 4000);
          }}
        />
      )}

      {/* 3. Problem / Doubt Thread Modal */}
      {selectedProblem && (
        <ProblemThreadModal
          isOpen={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
          problem={selectedProblem}
          onUpdated={() => loadData()}
        />
      )}

      {/* 4. Deadlines Calendar Modal */}
      <AssignmentCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        assignments={assignments}
        submissions={submissions}
        onSelectAssignment={asg => {
          setIsCalendarOpen(false);
          setSubmittingAssignment(asg);
        }}
      />

      {/* 5. Ask a Doubt Modal */}
      {isNewProblemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-base font-bold text-foreground">Ask a Doubt / Academic Issue</h3>
              <button
                onClick={() => setIsNewProblemModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="p-6 space-y-4">
              {problemError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{problemError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Doubt Title / Subject Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Difficulty understanding gradient descent convergence rate"
                  value={newProblemData.title}
                  onChange={e => setNewProblemData({ ...newProblemData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subject *</label>
                  <select
                    value={newProblemData.subject_id}
                    onChange={e => setNewProblemData({ ...newProblemData, subject_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <select
                    value={newProblemData.category}
                    onChange={e => setNewProblemData({ ...newProblemData, category: e.target.value as ProblemCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="concept_doubt">Conceptual Doubt</option>
                    <option value="assignment_problem">Assignment / Homework Issue</option>
                    <option value="subject_difficulty">Subject Difficulty</option>
                    <option value="attendance_issue">Attendance Discrepancy</option>
                    <option value="study_related">Study Strategy Guidance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Description & Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what concept or step you're stuck on, what you've tried so far..."
                  value={newProblemData.description}
                  onChange={e => setNewProblemData({ ...newProblemData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Optional Screenshot / Document</label>
                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setProblemAttachment(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewProblemModalOpen(false)}
                  disabled={isSubmittingProblem}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProblem}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmittingProblem ? 'Submitting...' : 'Send Doubt to Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
