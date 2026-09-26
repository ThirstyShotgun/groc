import React from 'react';

interface ProgressTrackerProps {
  currentIndex: number;
  totalQuestions: number;
  roleTitle: string;
}

export default function ProgressTracker({
  currentIndex,
  totalQuestions,
  roleTitle
}: ProgressTrackerProps) {
  const currentNum = String(currentIndex + 1).padStart(2, '0');
  const totalNum = String(totalQuestions).padStart(2, '0');

  return (
    <div className="bg-[#24232B] border border-[#33323C] rounded p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Typographic Step Counter & Track Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-[#EDEBE6] font-heading leading-none">
              {currentNum}
            </span>
            <span className="text-xs text-[#8B899A]">/{totalNum}</span>
          </div>

          <div className="h-5 w-px bg-[#33323C] hidden sm:block" />

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
              ACTIVE DOCKET
            </div>
            <div className="text-xs font-semibold text-[#EDEBE6] truncate max-w-[280px] sm:max-w-none">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Right: Discrete Segment Blocks */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] mr-1">
            PROGRESS
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={idx}
                  className={`h-2 w-6 rounded-xs transition-colors ${
                    isPast
                      ? 'bg-[#8B899A]'
                      : isCurrent
                      ? 'bg-[#C97B4A]'
                      : 'bg-[#1C1B22] border border-[#33323C]'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
