import React from 'react';
import { SessionRecord } from '@/types/session';
import { X } from 'lucide-react';

interface SessionDetailModalProps {
  session: SessionRecord | null;
  onClose: () => void;
}

export default function SessionDetailModal({
  session,
  onClose
}: SessionDetailModalProps) {
  if (!session) return null;

  const score = session.overall_score;
  const scoreOpacity = score >= 80 ? 'opacity-100' : score >= 60 ? 'opacity-80' : 'opacity-55';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#24232B] w-full max-w-2xl max-h-[88vh] flex flex-col rounded shadow-2xl border border-[#33323C] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#33323C] flex items-center justify-between bg-[#1C1B22]">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">
              EVALUATION DOSSIER // ARCHIVE RECORD
            </span>
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#EDEBE6] truncate max-w-md">
              {session.role_title}
            </h3>
            <div className="flex items-center gap-2 pt-0.5 text-xs font-mono text-[#8B899A]">
              <span>COMPOSITE:</span>
              <span className={`font-bold text-[#C97B4A] ${scoreOpacity}`}>{score}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B899A] hover:text-[#EDEBE6] transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Breakdown List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {session.questions && session.questions.length > 0 ? (
            session.questions.map((q, idx) => {
              const qScore = q.score ?? 0;
              const qOpacity = qScore >= 80 ? 'opacity-100' : qScore >= 60 ? 'opacity-80' : 'opacity-55';
              return (
                <div
                  key={idx}
                  className="bg-[#1C1B22] p-4 rounded border border-[#33323C] space-y-3 font-mono"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#24232B] text-[#EDEBE6] border border-[#33323C]">
                      PROMPT 0{idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-[#EDEBE6] flex-1 font-sans">
                      {q.question_text}
                    </p>
                    <span className={`text-xs font-bold text-[#C97B4A] shrink-0 ${qOpacity}`}>
                      {qScore}%
                    </span>
                  </div>

                  {q.answer_text && (
                    <div className="text-[11px] text-[#8B899A] bg-[#24232B] p-3 rounded border border-[#33323C]">
                      <span className="font-bold text-[#EDEBE6] block mb-1">Candidate Transcript:</span>
                      {q.answer_text}
                    </div>
                  )}

                  {q.feedback && (
                    <div className="border-l-2 border-[#EDEBE6] pl-3 text-xs text-[#8B899A]">
                      <span className="text-[#EDEBE6] font-bold block mb-0.5">Reviewer Observation:</span>
                      {q.feedback}
                    </div>
                  )}

                  {q.improvement_tip && (
                    <div className="border-l-2 border-[#C97B4A] pl-3 text-xs text-[#8B899A]">
                      <span className="text-[#C97B4A] font-bold block mb-0.5">Calibration Note:</span>
                      {q.improvement_tip}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center space-y-1.5 bg-[#1C1B22] rounded border border-[#33323C]">
              <div className="text-[10px] font-mono text-[#8B899A] uppercase tracking-wider">
                INCOMPLETE DOCKET RECORD
              </div>
              <p className="text-xs text-[#EDEBE6]">
                This session was initialized but no prompts were recorded before termination.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#33323C] flex justify-end bg-[#1C1B22]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] rounded transition-colors uppercase tracking-wider"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
