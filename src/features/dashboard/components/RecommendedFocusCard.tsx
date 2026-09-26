'use client';

import React from 'react';
import { SessionRecord } from '@/types/session';
import { ArrowRight, Compass } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import InteractiveButton from '@/components/ui/InteractiveButton';

interface RecommendedFocusCardProps {
  sessions: SessionRecord[];
}

export default function RecommendedFocusCard({ sessions }: RecommendedFocusCardProps) {
  let recommendation = {
    tag: 'CALIBRATE BASELINE',
    role: 'Distributed Systems Architect',
    focus: 'Trade-off defensibility & partition failure modes',
    reason: 'Standard baseline benchmark for L5/L6 loops. Tests state consistency, message brokers, and failure semantics under throughput spikes.'
  };

  if (sessions.length > 0) {
    const sortedByScore = [...sessions].sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0));
    const lowest = sortedByScore[0];

    if ((lowest.overall_score || 0) < 80) {
      recommendation = {
        tag: 'TARGETED CALIBRATION',
        role: lowest.role_title,
        focus: 'STAR framework discipline & edge-case recovery',
        reason: `Your previous session scored ${lowest.overall_score}%. Reviewers noted room to tighten production edge-cases and explicit trade-offs. Re-simulating this track will reinforce the L6 standard.`
      };
    } else {
      recommendation = {
        tag: 'STAFF PROMOTION BENCHMARK',
        role: 'Staff Platform Architect',
        focus: 'Zero-downtime migrations & multi-region consensus',
        reason: 'You are consistently exceeding the senior bar. Calibrate against Staff/Principal loops testing organizational trade-offs and multi-region consensus.'
      };
    }
  }

  return (
    <SpotlightCard cursorText="FOCUS" className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div className="space-y-1.5 max-w-xl">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em]">
          <Compass className="w-3.5 h-3.5 text-[#C97B4A]" />
          <span>RECOMMENDED FOCUS // {recommendation.tag}</span>
        </div>
        <h3 className="text-base font-bold text-[#EDEBE6] font-heading">
          {recommendation.role}
        </h3>
        <p className="text-xs text-[#8B899A] leading-relaxed">
          {recommendation.reason}
        </p>
      </div>

      <div className="shrink-0">
        <InteractiveButton
          href={`/interview?role=${encodeURIComponent(recommendation.role)}`}
          variant="primary"
          data-cursor-text="PRACTICE"
          className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <span>PRACTICE THIS TRACK</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </InteractiveButton>
      </div>
    </SpotlightCard>
  );
}
