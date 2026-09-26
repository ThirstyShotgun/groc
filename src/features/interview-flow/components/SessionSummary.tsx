import React, { useState } from 'react';
import Link from 'next/link';
import { QuestionRecord } from '@/types/session';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import CategoryScoreBreakdown from '@/components/interview/CategoryScoreBreakdown';

interface SessionSummaryProps {
  roleTitle: string;
  overallScore: number;
  completedQuestions: QuestionRecord[];
  onRestart: () => void;
}

export default function SessionSummary({
  roleTitle,
  overallScore,
  completedQuestions,
  onRestart
}: SessionSummaryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getVerdict = (sc: number) => {
    if (sc >= 85) return { stamp: 'STRONG HIRE // L6 READY', opacity: 'opacity-100', desc: 'Demonstrates architectural conviction, explicit trade-off defensibility, and structured STAR delivery.' };
    if (sc >= 70) return { stamp: 'LEAN HIRE // L5 CALIBRATED', opacity: 'opacity-80', desc: 'Solid technical foundation. Further articulate system failure modes and latency mitigation metrics.' };
    return { stamp: 'FURTHER CALIBRATION REQUIRED', opacity: 'opacity-55', desc: 'Focus on STAR framework discipline and concrete implementation specifics over high-level abstractions.' };
  };

  const verdict = getVerdict(overallScore);

  return (
    <div className="bg-[#24232B] border border-[#33323C] rounded p-6 sm:p-8 space-y-7">
      {/* Asymmetric Dossier Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-[#33323C] pb-7">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-block font-mono text-xs font-semibold px-2.5 py-1 rounded border border-[#33323C] text-[#EDEBE6] uppercase tracking-wider">
            [{verdict.stamp}]
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em]">
              CANDIDATE DOSSIER // {roleTitle}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl sm:text-7xl font-black font-heading text-[#C97B4A] tracking-tight leading-none ${verdict.opacity}`}>
                {overallScore}
              </span>
              <span className="text-sm font-mono text-[#8B899A]">/ 100 COMPOSITE</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
            {verdict.desc}
          </p>

          <CategoryScoreBreakdown score={overallScore} seedModifier={overallScore} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onRestart}
              className="px-4 py-2 rounded border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] font-mono text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> RE-SIMULATE
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-[#EDEBE6] font-mono text-xs font-semibold transition-colors"
            >
              DASHBOARD METRICS →
            </Link>
          </div>
        </div>

        {/* Right: Question Breakdown Ledger */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B899A] mb-2">
            PROMPT EVALUATION LEDGER ({completedQuestions.length})
          </div>

          <div className="space-y-2">
            {completedQuestions.map((q, idx) => {
              const isOpen = expandedIndex === idx;
              const qScore = q.score ?? 0;
              const qOpacity = qScore >= 80 ? 'opacity-100' : qScore >= 60 ? 'opacity-80' : 'opacity-55';
              return (
                <div
                  key={idx}
                  className="rounded border border-[#33323C] bg-[#1C1B22] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#24232B] transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-3">
                      <span className="font-mono text-xs font-bold text-[#EDEBE6]">
                        Q0{idx + 1}
                      </span>
                      <span className="text-xs font-medium text-[#EDEBE6] line-clamp-1">
                        {q.question_text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                      <span className={`font-bold text-[#C97B4A] ${qOpacity}`}>
                        {qScore}%
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#8B899A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#8B899A]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 border-t border-[#33323C] space-y-2.5 text-xs bg-[#1C1B22]">
                      {q.answer_text && (
                        <div className="p-2.5 rounded bg-[#24232B] text-[#8B899A] font-mono text-[11px] border border-[#33323C]">
                          <span className="font-bold text-[#EDEBE6] block mb-1">Candidate Transcript:</span>
                          {q.answer_text}
                        </div>
                      )}
                      {q.feedback && (
                        <div className="text-[#8B899A] text-xs leading-relaxed font-mono">
                          <span className="text-[#EDEBE6] font-bold block mb-0.5">↳ Reviewer Observation:</span>
                          {q.feedback}
                        </div>
                      )}
                      {q.improvement_tip && (
                        <div className="text-xs text-[#8B899A] font-mono">
                          <span className="text-[#C97B4A] font-bold block mb-0.5">↳ Target Revision:</span>
                          {q.improvement_tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
