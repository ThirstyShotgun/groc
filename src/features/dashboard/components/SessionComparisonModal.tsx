'use client';

import React, { useState } from 'react';
import { SessionRecord } from '@/types/session';
import { X } from 'lucide-react';

interface SessionComparisonModalProps {
  sessions: SessionRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionComparisonModal({
  sessions,
  isOpen,
  onClose
}: SessionComparisonModalProps) {
  const [indexA, setIndexA] = useState<number>(0);
  const [indexB, setIndexB] = useState<number>(sessions.length > 1 ? 1 : 0);

  if (!isOpen) return null;

  if (sessions.length < 2) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#24232B] border border-[#33323C] rounded max-w-md w-full p-6 text-center space-y-3 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8B899A] hover:text-[#EDEBE6]" aria-label="Close"><X className="w-4 h-4" /></button>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">SIDE-BY-SIDE EVALUATION</div>
          <h3 className="text-base font-bold text-[#EDEBE6] font-heading">At Least 2 Sessions Required</h3>
          <p className="text-xs text-[#8B899A] leading-relaxed">
            Complete at least two interview simulations to unlock side-by-side rubric comparison and visualize measurable performance trajectory.
          </p>
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#33323C] text-xs font-mono text-[#EDEBE6] uppercase">DISMISS</button>
        </div>
      </div>
    );
  }

  const sessionA = sessions[indexA] || sessions[0];
  const sessionB = sessions[indexB] || sessions[1];
  const scoreA = sessionA.overall_score || 0;
  const scoreB = sessionB.overall_score || 0;
  const delta = scoreB - scoreA;
  const deltaFormatted = delta > 0 ? `+${delta}% PROGRESSION` : delta < 0 ? `${delta}% VARIANCE` : 'EQUAL SCORE';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#24232B] w-full max-w-4xl max-h-[90vh] flex flex-col rounded shadow-2xl border border-[#33323C] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#33323C] flex items-center justify-between bg-[#1C1B22]">
          <div>
            <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">PERFORMANCE DELTA</span>
            <h2 className="text-base sm:text-lg font-bold text-[#EDEBE6] font-heading">Session Comparison Ledger</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-[#33323C] text-[#C97B4A]">{deltaFormatted}</span>
            <button onClick={onClose} className="text-[#8B899A] hover:text-[#EDEBE6] p-1" aria-label="Close"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session A */}
            <div className="bg-[#1C1B22] p-4 rounded border border-[#33323C] space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8B899A] uppercase">BASELINE (A)</span>
                <select value={indexA} onChange={(e) => setIndexA(Number(e.target.value))} className="bg-[#24232B] text-xs text-[#EDEBE6] border border-[#33323C] rounded px-1.5 py-0.5">
                  {sessions.map((s, i) => (<option key={i} value={i}>#{i + 1} {s.role_title.slice(0, 18)} ({s.overall_score}%)</option>))}
                </select>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#EDEBE6] truncate">{sessionA.role_title}</div>
                <div className="text-2xl font-black text-[#EDEBE6] mt-0.5">{scoreA}%</div>
                <div className="text-[10px] text-[#8B899A]">{sessionA.created_at ? new Date(sessionA.created_at).toLocaleDateString() : 'Historical'}</div>
              </div>
              <div className="pt-2 border-t border-[#33323C] space-y-1.5 text-xs">
                {(sessionA.questions || []).map((q, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 border-b border-[#33323C]/40">
                    <span className="text-[#8B899A] truncate max-w-[200px]">Q{idx + 1}: {q.question_text}</span>
                    <span className="text-[#EDEBE6] font-bold">{q.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session B */}
            <div className="bg-[#1C1B22] p-4 rounded border border-[#33323C] space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8B899A] uppercase">COMPARISON (B)</span>
                <select value={indexB} onChange={(e) => setIndexB(Number(e.target.value))} className="bg-[#24232B] text-xs text-[#EDEBE6] border border-[#33323C] rounded px-1.5 py-0.5">
                  {sessions.map((s, i) => (<option key={i} value={i}>#{i + 1} {s.role_title.slice(0, 18)} ({s.overall_score}%)</option>))}
                </select>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#EDEBE6] truncate">{sessionB.role_title}</div>
                <div className="text-2xl font-black text-[#C97B4A] mt-0.5">{scoreB}%</div>
                <div className="text-[10px] text-[#8B899A]">{sessionB.created_at ? new Date(sessionB.created_at).toLocaleDateString() : 'Historical'}</div>
              </div>
              <div className="pt-2 border-t border-[#33323C] space-y-1.5 text-xs">
                {(sessionB.questions || []).map((q, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 border-b border-[#33323C]/40">
                    <span className="text-[#8B899A] truncate max-w-[200px]">Q{idx + 1}: {q.question_text}</span>
                    <span className="text-[#C97B4A] font-bold">{q.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#33323C] flex justify-end bg-[#1C1B22]">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-mono border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] rounded transition-colors uppercase">
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
