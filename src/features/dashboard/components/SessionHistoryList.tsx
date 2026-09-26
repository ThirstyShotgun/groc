import React from 'react';
import { SessionRecord } from '@/types/session';
import { ChevronRight, ArrowRight } from 'lucide-react';
import InteractiveButton from '@/components/ui/InteractiveButton';

interface SessionHistoryListProps {
  sessions: SessionRecord[];
  onSelectSession: (session: SessionRecord) => void;
}

export default function SessionHistoryList({
  sessions,
  onSelectSession
}: SessionHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-[#24232B] border border-[#33323C] rounded p-7 sm:p-9 text-center space-y-4">
        <div className="space-y-1.5 max-w-md mx-auto">
          <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">
            SESSION ARCHIVE // EMPTY STATE
          </span>
          <h3 className="text-lg font-bold text-[#EDEBE6] font-heading">
            No Evaluation Packets Recorded Yet
          </h3>
          <p className="text-xs text-[#8B899A] leading-relaxed">
            Your completed mock interviews, trade-off scores, and committee observations will populate here once you complete a 5-question simulation.
          </p>
        </div>
        <div>
          <InteractiveButton
            href="/interview"
            variant="primary"
            data-cursor-text="START"
            className="px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider"
          >
            <span>START YOUR FIRST SIMULATION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </InteractiveButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#24232B] border border-[#33323C] rounded p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#33323C] pb-3">
        <div>
          <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">
            SESSION ARCHIVE
          </span>
          <h3 className="text-lg font-bold text-[#EDEBE6] font-heading mt-0.5">
            Completed Evaluation Packets
          </h3>
        </div>
        <span className="text-xs font-mono text-[#8B899A]">
          {sessions.length} RECORDED
        </span>
      </div>

      <div className="divide-y divide-[#33323C]">
        {sessions.map((s, idx) => {
          const formattedDate = s.created_at
            ? new Date(s.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recent';

          const questionCount = s.questions?.length || 5;
          const score = s.overall_score;
          const scoreOpacity = score >= 80 ? 'opacity-100' : score >= 60 ? 'opacity-80' : 'opacity-55';

          return (
            <div
              key={s.id || `session-${idx}`}
              onClick={() => onSelectSession(s)}
              data-cursor="link"
              data-cursor-text="INSPECT"
              className="py-3.5 px-3 -mx-3 flex items-center justify-between hover:bg-[#1C1B22] rounded cursor-pointer transition-colors group"
            >
              <div className="min-w-0 pr-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B899A]">
                  <span>DOCKET #{s.id ? s.id.slice(0, 6) : `0${idx + 1}`}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
                <h4 className="font-medium text-[#EDEBE6] text-xs sm:text-sm group-hover:text-[#EDEBE6] transition-colors truncate">
                  {s.role_title}
                </h4>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-[#8B899A] hidden sm:inline">
                  [{questionCount} PROMPTS]
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#33323C] text-[#C97B4A] ${scoreOpacity}`}>
                  {score}%
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8B899A] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
