import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Assignment, AssignmentSubmission } from '../../types';
import { getDeadlineInfo } from '../../services/learningService';

interface AssignmentCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  submissions?: AssignmentSubmission[];
  onSelectAssignment?: (assignment: Assignment) => void;
}

export const AssignmentCalendarModal: React.FC<AssignmentCalendarModalProps> = ({
  isOpen,
  onClose,
  assignments,
  submissions = [],
  onSelectAssignment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map assignments to day of month
  const assignmentsByDay: { [day: number]: Assignment[] } = {};
  assignments.forEach(asg => {
    const due = new Date(asg.due_date);
    if (due.getFullYear() === year && due.getMonth() === month) {
      const day = due.getDate();
      if (!assignmentsByDay[day]) assignmentsByDay[day] = [];
      assignmentsByDay[day].push(asg);
    }
  });

  const getDayStatus = (asgs: Assignment[]) => {
    const hasSubmittedAll = asgs.every(a =>
      submissions.some(s => s.assignment_id === a.id && s.status !== 'not_started')
    );
    if (hasSubmittedAll && submissions.length > 0) return 'submitted';

    const hasOverdue = asgs.some(a => new Date(a.due_date).getTime() < Date.now());
    if (hasOverdue) return 'overdue';

    const hasDueToday = asgs.some(a => {
      const d = new Date(a.due_date);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    });
    if (hasDueToday) return 'due_today';

    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Assignment & Deadlines Calendar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Visual schedule of homework, quizzes, and project submission dates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-background border border-border rounded-lg p-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-foreground min-w-[130px] text-center">{monthName}</span>
              <button
                onClick={nextMonth}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-2.5 bg-muted/20 border-b border-border flex items-center gap-6 text-[11px] font-semibold text-muted-foreground overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Upcoming Deadline</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Due Today</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Submitted</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Overdue</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-muted/40 p-2 text-center text-xs font-bold text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty days before start */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-card/40 min-h-[90px] p-2 opacity-30" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAssignments = assignmentsByDay[day] || [];
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  className={`bg-card min-h-[90px] p-2 flex flex-col transition-colors ${
                    isToday ? 'ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center'
                          : 'text-foreground'
                      }`}
                    >
                      {day}
                    </span>
                    {dayAssignments.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {dayAssignments.length} {dayAssignments.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayAssignments.map(asg => {
                      const submission = submissions.find(s => s.assignment_id === asg.id);
                      const isSubmitted = submission && submission.status !== 'not_started';
                      const deadline = getDeadlineInfo(asg.due_date);

                      return (
                        <div
                          key={asg.id}
                          onClick={() => {
                            if (onSelectAssignment) onSelectAssignment(asg);
                          }}
                          className={`p-1.5 rounded-md text-[10px] font-semibold truncate cursor-pointer transition-all border ${
                            isSubmitted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : deadline.isOverdue
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : deadline.isDueToday
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          }`}
                          title={`${asg.title} (${asg.subject?.name})`}
                        >
                          <div className="truncate font-bold">{asg.title}</div>
                          <div className="text-[9px] opacity-80 truncate">{asg.subject?.code}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
