import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  Eye,
  Download,
  Edit,
  Trash2,
  Layers,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { Assignment, AssignmentSubmission, Class, Subject, SubmissionType } from '../../types';
import { uploadFile, formatBytes, downloadFile } from '../../services/storageService';
import { getDeadlineInfo, calculateAssignmentStats } from '../../services/learningService';
import { TeacherGradeModal } from '../../components/learning/TeacherGradeModal';
import { FileViewerModal } from '../../components/learning/FileViewerModal';

export const TeacherAssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected assignment for grading drawer
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ url?: string; name?: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    topic: '',
    class_id: '',
    subject_id: '',
    max_marks: 100,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submission_type: 'both' as SubmissionType,
    allowed_formats: ['pdf', 'docx', 'zip', 'png', 'jpg'],
    is_published: true,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const teacher = user ? dataStore.getTeacherByProfileId(user.id) : undefined;

  const loadData = () => {
    const allAssignments = dataStore.getAssignments({
      teacherId: teacher?.id,
      classId: selectedClass !== 'all' ? selectedClass : undefined,
      subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
    });

    setAssignments(allAssignments);
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());

    if (activeAssignment) {
      const refreshedActive = allAssignments.find(a => a.id === activeAssignment.id);
      if (refreshedActive) {
        setActiveAssignment(refreshedActive);
        setAssignmentSubmissions(dataStore.getSubmissionsForAssignment(refreshedActive.id));
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return () => unsubscribe();
  }, [selectedClass, selectedSubject, statusFilter, searchQuery, activeAssignment?.id]);

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      instructions: '',
      topic: '',
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      max_marks: 100,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      submission_type: 'both',
      allowed_formats: ['pdf', 'docx', 'zip', 'png', 'jpg'],
      is_published: true,
    });
    setAttachmentFile(null);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (asg: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAssignment(asg);
    setFormData({
      title: asg.title,
      description: asg.description,
      instructions: asg.instructions || '',
      topic: asg.topic,
      class_id: asg.class_id,
      subject_id: asg.subject_id,
      max_marks: asg.max_marks,
      due_date: new Date(asg.due_date).toISOString().slice(0, 16),
      submission_type: asg.submission_type,
      allowed_formats: asg.allowed_formats || ['pdf', 'docx'],
      is_published: asg.is_published,
    });
    setAttachmentFile(null);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter an assignment title.');
      return;
    }
    if (!formData.class_id) {
      setFormError('Please select a target class.');
      return;
    }
    if (!formData.subject_id) {
      setFormError('Please select a subject.');
      return;
    }
    if (!formData.topic.trim()) {
      setFormError('Please provide a topic or unit name.');
      return;
    }
    if (new Date(formData.due_date).getTime() <= Date.now()) {
      setFormError('Due date must be set in the future.');
      return;
    }

    try {
      setIsProcessing(true);

      let attachmentUrl = editingAssignment?.attachment_url;
      let attachmentName = editingAssignment?.attachment_name;
      let attachmentSize = editingAssignment?.attachment_size;

      if (attachmentFile) {
        const uploadRes = await uploadFile('assignments', attachmentFile, `class_${formData.class_id}`);
        attachmentUrl = uploadRes.fileUrl;
        attachmentName = uploadRes.fileName;
        attachmentSize = uploadRes.fileSize;
      }

      if (editingAssignment) {
        dataStore.updateAssignment(
          editingAssignment.id,
          {
            ...formData,
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            attachment_size: attachmentSize,
          },
          user ? { id: user.id, name: user.full_name, role: user.role } : undefined
        );
        setToastMessage('Assignment updated successfully!');
      } else {
        dataStore.createAssignment(
          {
            ...formData,
            teacher_id: teacher?.id || 'teach-1',
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            attachment_size: attachmentSize,
          },
          user ? { id: user.id, name: user.full_name, role: user.role } : undefined
        );
        setToastMessage('Assignment published and students notified!');
      }

      setIsProcessing(false);
      setIsCreateModalOpen(false);
      loadData();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      setIsProcessing(false);
      setFormError(err.message || 'Failed to save assignment.');
    }
  };

  const handleSelectAssignment = (asg: Assignment) => {
    setActiveAssignment(asg);
    setAssignmentSubmissions(dataStore.getSubmissionsForAssignment(asg.id));
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete assignment "${title}"?`)) {
      dataStore.deleteAssignment(
        id,
        user ? { id: user.id, name: user.full_name, role: user.role } : undefined
      );
      if (activeAssignment?.id === id) {
        setActiveAssignment(null);
      }
      setToastMessage('Assignment deleted.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments & Grading Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create homework tasks, quizzes, evaluate student work, and award marks with qualitative feedback.
          </p>
        </div>

        <button
          id="btn-create-assignment"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-2xl border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assignment title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class: {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active & Open</option>
            <option value="closed">Closed / Past Deadline</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Main Split Content: Assignment List (Left) + Grading Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assignments Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assignments ({assignments.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">Click to inspect submissions</span>
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {assignments.map(asg => {
                const isSelected = activeAssignment?.id === asg.id;
                const deadline = getDeadlineInfo(asg.due_date);
                const stats = calculateAssignmentStats([asg], dataStore.getSubmissionsForAssignment(asg.id));

                return (
                  <div
                    key={asg.id}
                    onClick={() => handleSelectAssignment(asg)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary'
                        : 'bg-card border-border hover:border-primary/40 hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 truncate">
                        {asg.subject?.code} • {asg.class?.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          deadline.isOverdue
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : deadline.isDueToday
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}
                      >
                        {deadline.timeLeftFormatted}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{asg.title}</h3>
                    <p className="text-xs text-primary font-semibold mt-0.5">{asg.topic}</p>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-center">
                      <div className="p-1.5 rounded-lg bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground block">Submitted</span>
                        <span className="text-xs font-bold text-foreground">{stats.totalSubmissions}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground block">Graded</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.gradedCount}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground block">Avg Score</span>
                        <span className="text-xs font-bold text-foreground">
                          {stats.averageScore}/{asg.max_marks}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                      <span>Max: <strong>{asg.max_marks} pts</strong></span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => handleOpenEditModal(asg, e)}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                          title="Edit Assignment"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDelete(asg.id, asg.title, e)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
              <FileCode className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-foreground">No Assignments Found</p>
              <p className="text-[11px] text-muted-foreground">Create assignments to distribute tasks to students.</p>
            </div>
          )}
        </div>

        {/* Right Column: Submission Grading & Student Work List */}
        <div className="lg:col-span-7 space-y-4">
          {activeAssignment ? (
            <div className="p-6 bg-card rounded-2xl border border-border space-y-5">
              {/* Header & Details */}
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {activeAssignment.subject?.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Class: <strong>{activeAssignment.class?.name}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{activeAssignment.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{activeAssignment.description}</p>
                </div>

                {activeAssignment.attachment_url && (
                  <button
                    onClick={() =>
                      setViewingAttachment({
                        url: activeAssignment.attachment_url,
                        name: activeAssignment.attachment_name,
                        title: `${activeAssignment.title} - Reference File`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Reference File</span>
                  </button>
                )}
              </div>

              {/* Submissions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Student Submissions ({assignmentSubmissions.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Graded: {assignmentSubmissions.filter(s => s.status === 'graded').length} / {assignmentSubmissions.length}
                  </span>
                </div>

                {assignmentSubmissions.length > 0 ? (
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {assignmentSubmissions.map(sub => {
                      const isGraded = sub.status === 'graded';
                      const isLate = sub.is_late || sub.status === 'late';

                      return (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground truncate">
                                {sub.student?.profile?.full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({sub.student?.roll_number})
                              </span>
                              {isLate && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                  Late
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                              <span>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                              {sub.file_name && (
                                <span className="text-primary truncate max-w-[150px]">
                                  📁 {sub.file_name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isGraded ? (
                              <div className="text-right">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                                  {sub.marks} / {activeAssignment.max_marks} pts
                                </span>
                                <span className="text-[10px] text-muted-foreground">Graded</span>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                Needs Grading
                              </span>
                            )}

                            <button
                              id={`btn-grade-${sub.id}`}
                              onClick={() => setGradingSubmission(sub)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                            >
                              {isGraded ? 'Update Grade' : 'Grade Work'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted/20 rounded-xl border border-border/50 text-xs text-muted-foreground">
                    No students have submitted work for this assignment yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-3 min-h-[400px]">
              <FileCode className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">Select an Assignment</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose any assignment from the list on the left to inspect student submissions, view submitted attachments, and enter grades.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-base font-bold text-foreground">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitAssignment} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4: Model Evaluation, Cross Validation & Confusion Matrices"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Target Class *</label>
                  <select
                    value={formData.class_id}
                    onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subject *</label>
                  <select
                    value={formData.subject_id}
                    onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic & Max Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Topic / Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supervised Learning"
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Total Max Marks *</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={formData.max_marks}
                    onChange={e => setFormData({ ...formData, max_marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Due Date & Submission Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Submission Mode</label>
                  <select
                    value={formData.submission_type}
                    onChange={e => setFormData({ ...formData, submission_type: e.target.value as SubmissionType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="both">Both File Upload and/or Written Text</option>
                    <option value="file">File Upload Only (PDF, DOCX, ZIP)</option>
                    <option value="text">Text Response Only</option>
                  </select>
                </div>
              </div>

              {/* Instructions & Guidelines */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Detailed Instructions & Grading Rubric</label>
                <textarea
                  rows={4}
                  placeholder="Provide problem statements, submission requirements, and evaluation guidelines..."
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                />
              </div>

              {/* Reference Attachment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Optional Reference Document / Starter Code (Max 15MB)</span>
                  {editingAssignment?.attachment_name && (
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Current: {editingAssignment.attachment_name}
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachmentFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <TeacherGradeModal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          submission={gradingSubmission}
          onGraded={() => {
            setToastMessage('Grade successfully saved and student notified!');
            loadData();
            setTimeout(() => setToastMessage(''), 4000);
          }}
        />
      )}

      {/* File Viewer Modal */}
      {viewingAttachment && (
        <FileViewerModal
          isOpen={!!viewingAttachment}
          onClose={() => setViewingAttachment(null)}
          title={viewingAttachment.title}
          fileUrl={viewingAttachment.url}
          fileName={viewingAttachment.name}
        />
      )}
    </div>
  );
};
