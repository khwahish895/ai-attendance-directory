import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, Paperclip, Calendar } from 'lucide-react';
import { Assignment, AssignmentSubmission } from '../../types';
import { uploadFile, formatBytes, validateFile } from '../../services/storageService';
import { dataStore } from '../../lib/dataProvider';
import { useAuth } from '../../context/AuthContext';
import { getDeadlineInfo } from '../../services/learningService';

interface StudentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  existingSubmission?: AssignmentSubmission;
  onSubmitted?: () => void;
}

export const StudentSubmitModal: React.FC<StudentSubmitModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  onSubmitted,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [textSubmission, setTextSubmission] = useState(existingSubmission?.text_submission || '');
  const [comments, setComments] = useState(existingSubmission?.comments || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const deadline = getDeadlineInfo(assignment.due_date);
  const isLate = deadline.isOverdue;
  const requiresFile = assignment.submission_type === 'file' || assignment.submission_type === 'both';
  const requiresText = assignment.submission_type === 'text' || assignment.submission_type === 'both';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validation = validateFile(selected, { maxSizeMB: 15 });
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMessage('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      const validation = validateFile(selected, { maxSizeMB: 15 });
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user || user.role !== 'student') {
      setErrorMessage('Only students can submit assignment work.');
      return;
    }

    const studentRecord = dataStore.getStudentByProfileId(user.id);
    if (!studentRecord) {
      setErrorMessage('Student record not found.');
      return;
    }

    if (requiresFile && !file && !existingSubmission?.file_url) {
      setErrorMessage('Please select a file to upload for this assignment.');
      return;
    }

    if (assignment.submission_type === 'text' && !textSubmission.trim()) {
      setErrorMessage('Please provide your text answer or report.');
      return;
    }

    try {
      setIsUploading(true);
      let uploadedFilePath = existingSubmission?.file_path;
      let uploadedFileUrl = existingSubmission?.file_url;
      let uploadedFileName = existingSubmission?.file_name;
      let uploadedFileSize = existingSubmission?.file_size;
      let uploadedMimeType = existingSubmission?.mime_type;

      if (file) {
        setUploadProgress(15);
        const res = await uploadFile(
          'student-submissions',
          file,
          `student_${studentRecord.id}`,
          pct => setUploadProgress(pct)
        );
        uploadedFilePath = res.filePath;
        uploadedFileUrl = res.fileUrl;
        uploadedFileName = res.fileName;
        uploadedFileSize = res.fileSize;
        uploadedMimeType = res.mimeType;
      }

      dataStore.submitAssignment(
        {
          assignmentId: assignment.id,
          studentId: studentRecord.id,
          filePath: uploadedFilePath,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
          fileSize: uploadedFileSize,
          mimeType: uploadedMimeType,
          textSubmission,
          comments,
        },
        { id: user.id, name: user.full_name, role: user.role }
      );

      setIsUploading(false);
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to submit assignment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {existingSubmission ? 'Resubmit Assignment Work' : 'Submit Assignment Work'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{assignment.title}</p>
          </div>
          <button
            id="btn-close-submit-modal"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Deadline & Warning Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isLate
                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                : 'bg-primary/5 border-primary/20 text-foreground'
            }`}
          >
            <div className="mt-0.5">
              {isLate ? <AlertCircle className="w-5 h-5 text-destructive" /> : <Calendar className="w-5 h-5 text-primary" />}
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold">
                {isLate ? 'Late Submission Notice' : 'Assignment Deadline'}
              </div>
              <div>
                Due on: <span className="font-semibold">{new Date(assignment.due_date).toLocaleString()}</span> (
                <span className="font-semibold">{deadline.timeLeftFormatted}</span>)
              </div>
              {isLate && (
                <p className="text-destructive/90">
                  This assignment deadline has passed. Your submission will be timestamped and flagged as <strong>Late</strong> for teacher grading.
                </p>
              )}
            </div>
          </div>

          {/* Instructions Summary */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
            <span className="font-bold text-foreground">Instructor Instructions:</span>
            <p className="text-muted-foreground whitespace-pre-line">{assignment.instructions || assignment.description}</p>
            <div className="pt-2 flex items-center gap-4 text-muted-foreground border-t border-border mt-2">
              <span>Max Marks: <strong className="text-foreground">{assignment.max_marks}</strong></span>
              <span>Submission Mode: <strong className="text-foreground uppercase">{assignment.submission_type}</strong></span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Upload Zone */}
          {requiresFile && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Upload Document / Code / Presentation {assignment.submission_type === 'file' && <span className="text-destructive">*</span>}</span>
                <span className="text-[11px] font-normal text-muted-foreground">Max 15MB (PDF, DOCX, PPTX, ZIP, Images)</span>
              </label>

              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)} • Click to replace</p>
                    </div>
                  </div>
                ) : existingSubmission?.file_name ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Current File: {existingSubmission.file_name}</p>
                      <p className="text-[11px] text-muted-foreground">Click or drop a new file here to update</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Click to browse or drag and drop file here</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Supports PDF, Word, PowerPoint, ZIP archives and images</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Submission Editor */}
          {requiresText && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Text Response / Written Answer {assignment.submission_type === 'text' && <span className="text-destructive">*</span>}</span>
              </label>
              <textarea
                id="input-text-submission"
                rows={5}
                value={textSubmission}
                onChange={e => setTextSubmission(e.target.value)}
                placeholder="Type or paste your answer, analytical findings, or code explanations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>
          )}

          {/* Student Comments */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Comments / Notes for Instructor (Optional)</label>
            <textarea
              id="input-submission-comments"
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Any specific note regarding this submission..."
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
            />
          </div>

          {/* Uploading progress bar */}
          {isUploading && (
            <div className="space-y-2 p-3 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs text-foreground font-semibold">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Uploading & Recording Submission...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              id="btn-cancel-submit"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{existingSubmission ? 'Resubmit Work' : 'Submit Work'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
