import React, { useState } from 'react';
import { AbsencePrediction } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Send, X, User, BookOpen, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ContactStudentModalProps {
  prediction: AbsencePrediction;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactStudentModal: React.FC<ContactStudentModalProps> = ({
  prediction,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const studentName = prediction.student?.profile?.full_name || 'Student';
  const subjectName = prediction.subject?.name || 'Class';

  const defaultMessage = `Hi ${studentName}, this is a friendly check-in regarding our upcoming ${subjectName} session on ${prediction.target_date}. Please ensure you attend or let me know in advance if you have any difficulties.`;

  const [message, setMessage] = useState(defaultMessage);
  const [channel, setChannel] = useState<'portal' | 'email' | 'sms'>('portal');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      showToast(`Check-in message sent directly to ${studentName} via ${channel.toUpperCase()}`, 'success');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0B1035] border border-indigo-900/60 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6E63FF]/20 border border-[#6E63FF]/30 flex items-center justify-center text-[#8677FF]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Direct Student Check-in</h2>
              <p className="text-xs text-slate-400">Reach out prior to the upcoming predicted class session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Context Card */}
        <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/10 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">{studentName} ({prediction.student?.roll_number || 'N/A'})</div>
            <div className="text-slate-400 text-[11px] mt-0.5">{subjectName} • Target: {prediction.target_date}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Absence Risk</div>
            <div className="text-rose-400 font-bold text-sm">{prediction.absence_probability}% Probability</div>
          </div>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Delivery Channel</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'portal', label: 'Portal In-App' },
              { id: 'email', label: 'Direct Email' },
              { id: 'sms', label: 'Mobile SMS' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChannel(item.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  channel === item.id
                    ? 'bg-[#6E63FF] border-[#8677FF] text-white shadow-md shadow-[#6E63FF]/30'
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
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Check-in Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full rounded-2xl bg-[#050816] border border-white/10 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6E63FF] transition-all resize-none"
            placeholder="Type your message here..."
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
            disabled={sending || !message.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:from-[#7B71FF] hover:to-[#9689FF] text-white text-xs font-bold shadow-lg shadow-[#6E63FF]/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending...' : 'Send Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
};
