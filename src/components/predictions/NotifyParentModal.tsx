import React, { useState } from 'react';
import { AbsencePrediction } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Bell, X, User, Phone, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NotifyParentModalProps {
  prediction: AbsencePrediction;
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyParentModal: React.FC<NotifyParentModalProps> = ({
  prediction,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  const studentName = prediction.student?.profile?.full_name || 'Student';
  const parentName = prediction.student?.parent?.profile?.full_name || 'Parent / Guardian';
  const parentPhone = prediction.student?.parent?.profile?.phone || '+1 (555) 012-7643';
  const parentEmail = prediction.student?.parent?.profile?.email || 'parent@example.com';
  const subjectName = prediction.subject?.name || 'Class';

  const defaultNotice = `Dear ${parentName}, this is an automated attendance advisory from Apex Institute. Our predictive system detected a high absence risk (${prediction.absence_probability}%) for ${studentName} for the upcoming ${subjectName} session on ${prediction.target_date}. Please encourage regular attendance to protect course credit standing.`;

  const [notice, setNotice] = useState(defaultNotice);
  const [notifyType, setNotifyType] = useState<'both' | 'sms' | 'email'>('both');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      showToast(`Advisory notice successfully dispatched to ${parentName} (${parentEmail})`, 'success');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0B1035] border border-indigo-900/60 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Parent Attendance Advisory</h2>
              <p className="text-xs text-slate-400">Proactive notification to parent/guardian before missed session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Details */}
        <div className="p-4 rounded-2xl bg-[#050816] border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Student:</span>
            <span className="font-bold text-white">{studentName} ({prediction.student?.roll_number})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Guardian / Parent:</span>
            <span className="font-semibold text-slate-200">{parentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Contact Channels:</span>
            <span className="text-slate-300 font-mono text-[11px]">{parentEmail} • {parentPhone}</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Dispatch Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'both', label: 'SMS & Email' },
              { id: 'sms', label: 'SMS Only' },
              { id: 'email', label: 'Email Only' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNotifyType(item.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  notifyType === item.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-[#050816] border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Notice Message</label>
          <textarea
            rows={4}
            value={notice}
            onChange={e => setNotice(e.target.value)}
            className="w-full rounded-2xl bg-[#050816] border border-white/10 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
            placeholder="Type your notice..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !notice.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Bell className="w-3.5 h-3.5" />
            {sending ? 'Dispatching...' : 'Dispatch Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};
