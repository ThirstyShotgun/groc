import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { QuestionTimer } from '@/components/QuestionTimer';
import { getPreferences } from '@/lib/preferences';
import InteractiveButton from '@/components/ui/InteractiveButton';

interface AnswerEditorProps {
  answerInput: string;
  setAnswerInput: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (overrideText?: string) => void;
  resetKey: number;
}

const STAR_PILLARS = [
  { key: 'S', title: 'Situation', tip: 'Context, scale, baseline constraints' },
  { key: 'T', title: 'Task', tip: 'Your specific responsibility & goals' },
  { key: 'A', title: 'Action', tip: 'Technical trade-offs & execution' },
  { key: 'R', title: 'Result', tip: 'Quantified metrics & retro lessons' }
];

export default function AnswerEditor({
  answerInput,
  setAnswerInput,
  isSubmitting,
  onSubmit,
  resetKey
}: AnswerEditorProps) {
  const [activeStar, setActiveStar] = useState<string | null>(null);

  const wordCount = answerInput.trim() ? answerInput.trim().split(/\s+/).length : 0;
  const charCount = answerInput.length;

  const handleTimeUp = () => {
    if (!answerInput.trim()) {
      onSubmit('Candidate did not complete response within allotted time limit.');
    } else {
      onSubmit();
    }
  };

  return (
    <div className="bg-[#24232B] border border-[#33323C] rounded p-5 sm:p-6 space-y-4">
      {/* Top Header: Monospace telemetry & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#33323C] pb-3">
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B899A]">
          <span className="text-[#EDEBE6] font-bold uppercase tracking-wider">RESPONSE BUFFER</span>
          <span>•</span>
          <span className="text-[#EDEBE6]">{wordCount} WORDS</span>
          <span className="text-[#33323C]">/</span>
          <span>{charCount} CHARS</span>
        </div>

        <div>
          {getPreferences().timerEnabled ? (
            <QuestionTimer
              initialSeconds={getPreferences().timerSeconds}
              isActive={!isSubmitting}
              onTimeUp={handleTimeUp}
              resetKey={resetKey}
            />
          ) : (
            <span className="font-mono text-[10px] text-[#8B899A] uppercase px-2 py-0.5 rounded border border-[#33323C]">
              UNTIMED MODE
            </span>
          )}
        </div>
      </div>

      {/* Primary Input Ledger */}
      <div>
        <textarea
          rows={7}
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          disabled={isSubmitting}
          placeholder="State your technical approach, architecture decisions, trade-offs, and quantified results..."
          className="w-full p-3.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#EDEBE6] placeholder-[#8B899A]/40 focus:outline-none focus:border-[#C97B4A] text-xs leading-relaxed resize-y font-mono"
        />
      </div>

      {/* STAR Reference Strip */}
      <div className="border border-[#33323C] bg-[#1C1B22] rounded p-2.5">
        <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em]">
          <span>RUBRIC STRUCTURE BENCHMARK [STAR]</span>
          <span className="text-[#EDEBE6]">{activeStar ? `FOCUS: ${activeStar}` : 'CLICK TO EXPAND'}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAR_PILLARS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveStar(activeStar === p.key ? null : p.key)}
              className={`p-2 rounded text-left transition-colors text-xs ${
                activeStar === p.key
                  ? 'bg-[#24232B] text-[#EDEBE6] border border-[#C97B4A]'
                  : 'bg-[#1C1B22] text-[#8B899A] hover:text-[#EDEBE6] border border-[#33323C]'
              }`}
            >
              <div className="font-mono font-bold text-[11px]">[{p.key}] {p.title}</div>
              <div className="text-[10px] opacity-80 truncate">{p.tip}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-1">
        <InteractiveButton
          onClick={() => onSubmit()}
          disabled={isSubmitting || !answerInput.trim()}
          variant="primary"
          data-cursor-text="SUBMIT"
          className="px-5 py-2.5 rounded font-semibold text-xs uppercase tracking-wider"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              EVALUATING IN COMMITTEE...
            </>
          ) : (
            <>
              SUBMIT FOR EVALUATION
              <Send className="w-3 h-3" />
            </>
          )}
        </InteractiveButton>
      </div>
    </div>
  );
}
