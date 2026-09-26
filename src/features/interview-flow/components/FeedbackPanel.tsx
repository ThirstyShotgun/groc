import React from 'react';
import { EvaluateAnswerResponse } from '@/types/question';
import { ArrowRight } from 'lucide-react';
import InteractiveButton from '@/components/ui/InteractiveButton';
import CategoryScoreBreakdown from '@/components/interview/CategoryScoreBreakdown';

interface FeedbackPanelProps {
  evaluation: EvaluateAnswerResponse | null;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function FeedbackPanel({
  evaluation,
  onNext,
  isLastQuestion
}: FeedbackPanelProps) {
  if (!evaluation) return null;

  const { score, feedback, improvement_tip, strengths } = evaluation;

  const getVerdict = (sc: number) => {
    if (sc >= 80) return { stamp: 'STRONG ADVANCE', opacity: 'opacity-100', label: 'Exceeds Bar' };
    if (sc >= 60) return { stamp: 'LEAN ADVANCE', opacity: 'opacity-80', label: 'Meets Baseline' };
    return { stamp: 'REVISE & RESTRUCTURE', opacity: 'opacity-55', label: 'Below Bar' };
  };

  const verdict = getVerdict(score);

  return (
    <div className="bg-[#24232B] border border-[#33323C] rounded p-6 sm:p-7 space-y-6">
      {/* Top Dossier Header & Stamped Evaluation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#33323C] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">
            EVALUATION REPORT // PROMPT CRITIQUE
          </span>
          <h3 className="text-lg font-bold text-[#EDEBE6] font-heading mt-0.5">
            Interviewer Assessment Slip
          </h3>
        </div>

        {/* Monochromatic Stamp */}
        <div className="self-start sm:self-auto font-mono text-xs font-semibold px-2.5 py-1 rounded border border-[#33323C] text-[#EDEBE6] uppercase tracking-wider">
          [{verdict.stamp}]
        </div>
      </div>

      {/* Asymmetric Score & Critique Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Typographic Score with Opacity-based Intensity */}
        <div className="md:col-span-4 bg-[#1C1B22] p-5 rounded border border-[#33323C] text-center md:text-left space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
            COMPOSITE SCORE
          </div>
          <div className="flex items-baseline justify-center md:justify-start gap-1">
            <span className={`text-5xl font-black font-heading text-[#C97B4A] leading-none tracking-tight ${verdict.opacity}`}>
              {score}
            </span>
            <span className="text-xs font-mono text-[#8B899A]">/100</span>
          </div>
          <div className="text-xs font-mono text-[#8B899A] pt-1">
            {verdict.label}
          </div>
          <CategoryScoreBreakdown score={score} seedModifier={score} className="mt-3.5 text-left" />
        </div>

        {/* Right Column: Detailed Rubric Remarks */}
        <div className="md:col-span-8 space-y-4">
          {strengths && (
            <div className="border-l-2 border-[#EDEBE6] pl-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#EDEBE6] font-bold block">
                DEMONSTRATED STRENGTHS
              </span>
              <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
                {strengths}
              </p>
            </div>
          )}

          <div className="bg-[#1C1B22] p-3.5 rounded text-xs sm:text-sm text-[#EDEBE6]/90 leading-relaxed font-mono border border-[#33323C]">
            {feedback}
          </div>

          {improvement_tip && (
            <div className="border-l-2 border-[#C97B4A] pl-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C97B4A] font-bold block">
                DELIBERATE CALIBRATION NOTE
              </span>
              <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
                {improvement_tip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advance Action */}
      <div className="flex justify-end pt-2 border-t border-[#33323C]">
        <InteractiveButton
          onClick={onNext}
          variant="primary"
          data-cursor-text={isLastQuestion ? 'COMPLETE' : 'ADVANCE'}
          className="px-5 py-2.5 rounded font-semibold text-xs uppercase tracking-wider"
        >
          {isLastQuestion ? 'FINALIZE & VIEW DOSSIER' : 'NEXT PROMPT'}
          <ArrowRight className="w-3.5 h-3.5" />
        </InteractiveButton>
      </div>
    </div>
  );
}
