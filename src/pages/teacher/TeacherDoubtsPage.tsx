import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Paperclip,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { StudentProblem, Subject, ProblemStatus, ProblemPriority } from '../../types';
import { formatProblemCategory } from '../../services/learningService';
import { ProblemThreadModal } from '../../components/learning/ProblemThreadModal';

export const TeacherDoubtsPage: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<StudentProblem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected thread
  const [activeProblem, setActiveProblem] = useState<StudentProblem | null>(null);

  const teacher = user ? dataStore.getTeacherByProfileId(user.id) : undefined;

  const loadData = () => {
    const allProblems = dataStore.getStudentProblems({
      subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      status: selectedStatus !== 'all' ? (selectedStatus as ProblemStatus) : undefined,
      priority: selectedPriority !== 'all' ? (selectedPriority as ProblemPriority) : undefined,
      search: searchQuery || undefined,
    });

    setProblems(allProblems);
    setSubjects(dataStore.getSubjects());

    if (activeProblem) {
      const refreshed = allProblems.find(p => p.id === activeProblem.id);
      if (refreshed) setActiveProblem(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return () => unsubscribe();
  }, [selectedSubject, selectedStatus, selectedPriority, searchQuery, activeProblem?.id]);

  const openCount = problems.filter(p => p.status === 'open').length;
  const inProgressCount = problems.filter(p => p.status === 'in_progress').length;
  const resolvedCount = problems.filter(p => p.status === 'resolved' || p.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Doubts & Academic Discussions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Answer questions, address conceptual difficulties, and provide personalized guidance to students.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Open Doubts Awaiting Reply</span>
          <p className={`text-xl font-bold mt-1 ${openCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
            {openCount}
          </p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs font-semibold text-muted-foreground">In Progress / Active Dialogues</span>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border">
          <span className="text-xs font-semibold text-muted-foreground">Resolved Issues</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-2xl border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problem title or student..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

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
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Unanswered)</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Doubts Grid */}
      {problems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(prob => {
            const replyCount = prob.responses?.length || 0;
            return (
              <div
                key={prob.id}
                onClick={() => setActiveProblem(prob)}
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
                  <div className="truncate pr-2">
                    <span className="font-semibold text-foreground truncate block">
                      {prob.student?.profile?.full_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {prob.subject?.code} • Roll: {prob.student?.roll_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-primary font-semibold shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{replyCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-2">
          <HelpCircle className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">No Student Doubts Found</p>
          <p className="text-xs text-muted-foreground">No inquiries match the current filter selection.</p>
        </div>
      )}

      {/* Problem Thread Modal */}
      {activeProblem && (
        <ProblemThreadModal
          isOpen={!!activeProblem}
          onClose={() => setActiveProblem(null)}
          problem={activeProblem}
          onUpdated={() => loadData()}
        />
      )}
    </div>
  );
};
