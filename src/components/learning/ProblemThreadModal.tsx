import React, { useState } from 'react';
import {
  X,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  User,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { StudentProblem, ProblemStatus } from '../../types';
import { dataStore } from '../../lib/dataProvider';
import { useAuth } from '../../context/AuthContext';
import { uploadFile, downloadFile, formatBytes } from '../../services/storageService';
import { formatProblemCategory } from '../../services/learningService';

interface ProblemThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: StudentProblem;
  onUpdated?: () => void;
}

export const ProblemThreadModal: React.FC<ProblemThreadModalProps> = ({
  isOpen,
  onClose,
  problem,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'administrator' || user?.role === 'super_admin';

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;
    if (!user) return;

    try {
      setIsSending(true);
      setErrorMessage('');

      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;

      if (attachment) {
        const res = await uploadFile('student-submissions', attachment, `problems/${problem.id}`);
        attachmentUrl = res.fileUrl;
        attachmentName = res.fileName;
      }

      dataStore.addProblemResponse(
        {
          problemId: problem.id,
          responderProfileId: user.id,
          message: messageText.trim(),
          attachmentName,
          attachmentUrl,
        },
        { id: user.id, name: user.full_name, role: user.role }
      );

      setMessageText('');
      setAttachment(null);
      setIsSending(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setIsSending(false);
      setErrorMessage(err.message || 'Failed to send response.');
    }
  };

  const handleStatusChange = (newStatus: ProblemStatus) => {
    if (!user) return;
    dataStore.updateProblemStatus(problem.id, newStatus, {
      id: user.id,
      name: user.full_name,
      role: user.role,
    });
    if (onUpdated) onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {formatProblemCategory(problem.category)}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  problem.priority === 'high'
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    : problem.priority === 'medium'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                }`}
              >
                {problem.priority} Priority
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  problem.status === 'resolved' || problem.status === 'closed'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : problem.status === 'in_progress'
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {problem.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground truncate">{problem.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subject: {problem.subject?.name} • Student: {problem.student?.profile?.full_name} ({problem.student?.roll_number})
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status Selector */}
            <select
              value={problem.status}
              onChange={e => handleStatusChange(e.target.value as ProblemStatus)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="open">Status: Open</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="resolved">Status: Resolved</option>
              <option value="closed">Status: Closed</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
          {/* Original Problem Post */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {problem.student?.profile?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">
                    {problem.student?.profile?.full_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    (Student • {new Date(problem.created_at).toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </p>

            {problem.attachment_url && (
              <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-foreground truncate">{problem.attachment_name || 'Attachment'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadFile(problem.attachment_url!, problem.attachment_name || 'attachment')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Messages */}
          {problem.responses && problem.responses.length > 0 ? (
            problem.responses.map(resp => {
              const isStudent = resp.responder?.role === 'student';
              return (
                <div
                  key={resp.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isStudent
                      ? 'bg-card border-border mr-8'
                      : 'bg-primary/5 border-primary/20 ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isStudent
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {resp.responder?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground">
                          {resp.responder?.full_name || 'User'}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          ({resp.responder?.role === 'teacher' ? 'Instructor' : resp.responder?.role} • {new Date(resp.created_at).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {resp.message}
                  </p>

                  {resp.attachment_url && (
                    <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold text-foreground truncate">{resp.attachment_name || 'Attachment'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadFile(resp.attachment_url!, resp.attachment_name || 'attachment')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border/50">
              No replies yet. Start the academic dialogue below.
            </div>
          )}
        </div>

        {/* Reply Composer */}
        <form onSubmit={handleSendReply} className="p-4 border-t border-border bg-card space-y-3">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {attachment && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-xs">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate font-semibold text-foreground">{attachment.name}</span>
                <span className="text-muted-foreground">({formatBytes(attachment.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <label className="p-2.5 rounded-xl border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                  }
                }}
              />
            </label>

            <textarea
              id="input-reply-message"
              rows={2}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your explanation, guidance, or follow-up question..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
            />

            <button
              type="submit"
              id="btn-send-doubt-reply"
              disabled={isSending || (!messageText.trim() && !attachment)}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
