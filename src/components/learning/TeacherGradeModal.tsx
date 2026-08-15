import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw, Download, Eye, AlertCircle, Award } from 'lucide-react';
import { AssignmentSubmission } from '../../types';
import { dataStore } from '../../lib/dataProvider';
import { useAuth } from '../../context/AuthContext';
import { downloadFile, formatBytes } from '../../services/storageService';
import { FileViewerModal } from './FileViewerModal';

interface TeacherGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: AssignmentSubmission;
  onGraded?: () => void;
}

export const TeacherGradeModal: React.FC<TeacherGradeModalProps> = ({
  isOpen,
  onClose,
  submission,
  onGraded,
}) => {
  const { user } = useAuth();

  const maxMarks = submission.assignment?.max_marks || 100;
  const [marks, setMarks] = useState<number | string>(
    submission.marks !== undefined ? submission.marks : ''
  );
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (marks === '' || isNaN(Number(marks))) {
      setErrorMessage('Please enter valid numeric marks.');
      return;
    }

    const numMarks = Number(marks);
    if (numMarks < 0 || numMarks > maxMarks) {
      setErrorMessage(`Marks must be between 0 and ${maxMarks}.`);
      return;
    }

    if (!user) return;
    const teacher = dataStore.getTeacherByProfileId(user.id);

    try {
      setIsProcessing(true);
      dataStore.gradeSubmission(
        submission.id,
        {
          marks: numMarks,
          feedback: feedback.trim() || 'Evaluated and marked.',
          gradedByTeacherId: teacher?.id || 'teach-1',
        },
        { id: user.id, name: user.full_name, role: user.role }
      );
      setIsProcessing(false);
      if (onGraded) onGraded();
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to record grade.');
    }
  };

  const handleReturnForRevision = () => {
    if (!feedback.trim()) {
      setErrorMessage('Please provide instructions/feedback for revision before returning work.');
      return;
    }

    if (!user) return;

    try {
      setIsProcessing(true);
      dataStore.returnSubmission(
        submission.id,
        feedback.trim(),
        { id: user.id, name: user.full_name, role: user.role }
      );
      setIsProcessing(false);
      if (onGraded) onGraded();
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to return submission.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div>
              <h3 className="text-base font-bold text-foreground">Grade Student Submission</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {submission.student?.profile?.full_name} ({submission.student?.roll_number}) • {submission.assignment?.title}
              </p>
            </div>
            <button
              id="btn-close-grade-modal"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSaveGrade} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Student Work Summary Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submitted Work</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    submission.is_late
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {submission.is_late ? 'Late Submission' : 'On-Time'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Uploaded File Block */}
              {submission.file_url && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-foreground truncate">{submission.file_name || 'Uploaded File'}</p>
                    <p className="text-[11px] text-muted-foreground">{formatBytes(submission.file_size)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsViewerOpen(true)}
                      className="p-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(submission.file_url!, submission.file_name || 'submission')}
                      className="p-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Text Submission Block */}
              {submission.text_submission && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Written Response:</span>
                  <div className="p-3 bg-background rounded-lg border border-border text-xs text-foreground whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {submission.text_submission}
                  </div>
                </div>
              )}

              {/* Student Comments */}
              {submission.comments && (
                <div className="text-xs text-muted-foreground italic">
                  Student note: &quot;{submission.comments}&quot;
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Marks Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Award Marks (Out of {maxMarks}) *</span>
                <span className="text-[11px] text-muted-foreground">Max: {maxMarks}</span>
              </label>
              <div className="relative">
                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  id="input-grade-marks"
                  min={0}
                  max={maxMarks}
                  step={0.5}
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  placeholder={`e.g. ${Math.round(maxMarks * 0.85)}`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Teacher Feedback & Comments</label>
              <textarea
                id="input-grade-feedback"
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback, praise strong points, or explain point deductions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                id="btn-return-revision"
                onClick={handleReturnForRevision}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Revision</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-cancel-grade"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-grade"
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Post Grade</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded File Viewer */}
      <FileViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={submission.file_name || 'Submission Work'}
        fileUrl={submission.file_url}
        fileName={submission.file_name}
        fileSize={submission.file_size}
        mimeType={submission.mime_type}
        authorName={submission.student?.profile?.full_name}
        date={submission.submitted_at}
      />
    </>
  );
};
