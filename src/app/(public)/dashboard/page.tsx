'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import MetricsGrid from '@/features/dashboard/components/MetricsGrid';
import ScoreChart from '@/features/dashboard/components/ScoreChart';
import SessionHistoryList from '@/features/dashboard/components/SessionHistoryList';
import SessionDetailModal from '@/features/dashboard/components/SessionDetailModal';
import SessionComparisonModal from '@/features/dashboard/components/SessionComparisonModal';
import RecommendedFocusCard from '@/features/dashboard/components/RecommendedFocusCard';
import DashboardSkeleton from '@/features/dashboard/components/DashboardSkeleton';
import { SessionRecord } from '@/types/session';
import { ArrowLeft, Play, ArrowLeftRight } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardData();
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const metrics = data?.metrics || {
    total_sessions: 0,
    average_score: 0,
    highest_score: 0,
    most_practiced_role: 'N/A',
    score_trend: []
  };

  const sessions = data?.sessions || [];

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-16">
      {/* Top Dossier Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#33323C] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-xs font-mono text-[#8B899A] hover:text-[#EDEBE6] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" /> [OVERVIEW]
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#EDEBE6] font-heading tracking-tight leading-none">
            Candidate Evaluation History
          </h1>
          <p className="text-xs font-mono text-[#8B899A] mt-1.5">
            HISTORICAL SCORES • BENCHMARK PROGRESSION • PROMPT AUDITS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {sessions.length >= 2 && (
            <button
              onClick={() => setIsComparing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] text-xs font-mono transition-colors uppercase tracking-wider"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#C97B4A]" />
              COMPARE SESSIONS
            </button>
          )}

          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-[#EDEBE6] text-xs font-mono font-medium shadow-sm transition-colors uppercase tracking-wider shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            START SIMULATION
          </Link>
        </div>
      </div>

      {isError && (
        <div className="p-3 border border-[#33323C] bg-[#24232B] text-xs text-[#EDEBE6] rounded font-mono">
          [SYSTEM NOTICE]: Offline fallback records active. Live cloud sync unavailable.
        </div>
      )}

      {/* Metrics Row: Asymmetric 5/7 Split */}
      <MetricsGrid metrics={metrics} />

      {/* Recommended Practice Focus Card */}
      <RecommendedFocusCard sessions={sessions} />

      {/* Score Trajectory Chart */}
      <ScoreChart data={metrics.score_trend} />

      {/* Session History List */}
      <SessionHistoryList
        sessions={sessions}
        onSelectSession={(session) => setSelectedSession(session)}
      />

      {/* Deep-Dive Session Review Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />

      {/* Side-by-Side Comparison Modal */}
      <SessionComparisonModal
        sessions={sessions}
        isOpen={isComparing}
        onClose={() => setIsComparing(false)}
      />
    </div>
  );
}
