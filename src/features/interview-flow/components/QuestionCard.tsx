import React from 'react';
import { QuestionItem } from '@/types/question';
import SpotlightCard from '@/components/SpotlightCard';

interface QuestionCardProps {
  question: QuestionItem;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const qType = (question.question_type || 'Technical').toUpperCase();
  const pacingSec = question.suggested_time_seconds || 90;

  return (
    <SpotlightCard
      cursorText="PROMPT"
      className="border-l-2 border-l-[#C97B4A] p-6 sm:p-7 space-y-4"
    >
      {/* Top Dossier Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#33323C] pb-3 text-[10px] font-mono text-[#8B899A]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#EDEBE6] tracking-wider">
            RUBRIC // {qType}
          </span>
          <span className="text-[#33323C]">|</span>
          <span className="tracking-wide">
            PROMPT REF #{Math.abs(question.question_text.length * 37 % 900 + 100)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider">PACING:</span>
          <span className="text-[#EDEBE6] font-medium bg-[#1C1B22] px-2 py-0.5 rounded border border-[#33323C]">
            {pacingSec}s ALLOTTED
          </span>
        </div>
      </div>

      {/* Main Prompt Typography */}
      <div className="space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-[#EDEBE6] font-heading tracking-tight leading-relaxed">
          {question.question_text}
        </h3>

        {/* Rubric Signal Context */}
        <div className="pt-1 flex items-start gap-2 text-xs text-[#8B899A] font-mono">
          <span className="text-[#EDEBE6] shrink-0 font-bold">↳ SIGNAL:</span>
          <span className="leading-relaxed">
            Evaluators expect concrete technical trade-offs, production failure modes, and clear STAR delivery rather than high-level conceptual summaries.
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
