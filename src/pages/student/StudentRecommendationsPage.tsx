import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { recommendationService } from '../../services/recommendationService';
import { Student, Recommendation } from '../../types';
import { RecommendationCard } from '../../components/common/RecommendationCard';
import { Sparkles, Lightbulb, CheckCircle2, BookmarkCheck, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const StudentRecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const load = () => {
    const allStudents = dataStore.getStudents();
    const currentStudent = allStudents.find(s => s.profile_id === user?.id) || allStudents[0];
    if (currentStudent) {
      setStudent(currentStudent);
      const recs = recommendationService.getStudentRecommendations(currentStudent.id);
      setRecommendations(recs);
    }
  };

  useEffect(() => {
    load();
    const unsub = dataStore.subscribe(load);
    return unsub;
  }, [user]);

  const handleActionClick = (step: string) => {
    showToast(`Marked action "${step}" as in-progress`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B1035] border border-indigo-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8677FF] bg-[#6E63FF]/15 px-2.5 py-0.5 rounded-full border border-[#6E63FF]/30">
              Personal Growth
            </span>
            <span className="text-xs text-slate-400">• Dynamic Advisory Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AI & Academic Recommendations
          </h1>
          <p className="text-xs text-[#B3B8D4]">
            Actionable strategies to optimize lecture attendance, recover lost buffer days, and succeed in coursework.
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-[#0B1035] border border-indigo-900/40 text-slate-400 text-xs">
            No specific recommendations generated at this time. Keep maintaining your strong attendance habits!
          </div>
        ) : (
          recommendations.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onActionClick={handleActionClick}
            />
          ))
        )}
      </div>
    </div>
  );
};
