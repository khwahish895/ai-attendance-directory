import React, { useState } from 'react';
import { Sparkles, Bot, X, CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Assignment, AssignmentAiAnalysis } from '../../types';
import { IntelligenceEngine } from '../../services/intelligenceEngine';

interface AiAssignmentAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

export const AiAssignmentAnalyzerModal: React.FC<AiAssignmentAnalyzerModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const [draftText, setDraftText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AssignmentAiAnalysis | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!draftText.trim() || isLoading) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
      let result: AssignmentAiAnalysis | null = null;
      try {
        const res = await fetch('/api/gemini/analyze-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionText: draftText.trim(),
            assignmentTitle: assignment.title,
            subjectName: assignment.subject?.name,
          }),
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (e) {
        console.warn('Using local assignment analyzer fallback', e);
      }

      if (!result || !result.completeness_score) {
        result = IntelligenceEngine.analyzeAssignmentText(
          draftText,
          assignment.title,
          assignment.subject?.name
        );
      }

      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#0B1035] rounded-3xl border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-[#050816] border-b border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6E63FF] to-[#8677FF] flex items-center justify-center shadow-lg shadow-[#6E63FF]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                AI Assignment Submission Analyzer
              </h3>
              <p className="text-xs text-[#B3B8D4]">
                Formative pre-submission review: Topic coverage, structure grading, missing sections, and scoring.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#0B1035] text-xs">
          {/* Target Assignment Details */}
          <div className="p-4 rounded-2xl bg-[#050816] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#8677FF] uppercase font-bold">Target Assignment:</span>
              <h4 className="font-bold text-white text-sm">{assignment.title}</h4>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {assignment.subject?.code} • {assignment.subject?.name} • Topic: {assignment.topic}
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#6E63FF]/15 text-[#8677FF] font-mono font-bold text-xs">
              Max {assignment.max_marks} Pts
            </span>
          </div>

          {/* Draft Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Paste your written assignment draft / solution text:</span>
              <span className="text-[10px] font-mono text-slate-500">
                {draftText.split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              rows={6}
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              placeholder="Paste your assignment introduction, theory, mathematical steps, code explanation, and conclusion here..."
              className="w-full px-4 py-3 rounded-2xl bg-[#050816] border border-indigo-900/60 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6E63FF] leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!draftText.trim() || isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E63FF] to-[#8677FF] hover:opacity-90 disabled:opacity-40 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#6E63FF]/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating with AI Rubrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Formative AI Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {analysis && (
            <div className="space-y-4 pt-2 border-t border-white/10 animate-fadeIn">
              {/* Score Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Completeness</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    {analysis.completeness_score}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Topic Coverage</span>
                  <div className="text-xl font-bold font-mono text-[#8677FF] mt-0.5">
                    {analysis.topic_coverage_score}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Structure</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {analysis.structure_grade}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#050816] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Grammar & Tone</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {analysis.grammar_quality}
                  </div>
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="p-4 rounded-2xl bg-[#050816] border border-indigo-900/60 text-slate-200 leading-relaxed">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#8677FF]" />
                  <span>AI Evaluator Assessment:</span>
                </div>
                <p>{analysis.overall_feedback}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths:</span>
                  </div>
                  <div className="space-y-1">
                    {analysis.strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Suggested Improvements:</span>
                  </div>
                  <div className="space-y-1">
                    {analysis.suggested_improvements.map((imp, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Missing sections if any */}
              {analysis.missing_sections && analysis.missing_sections.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs">
                  <span className="font-bold text-rose-300 block mb-1">
                    Recommended Missing Sections to Add:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_sections.map((sec, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 text-[11px] font-medium border border-rose-500/30">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
