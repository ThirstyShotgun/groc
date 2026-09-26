'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingDown, 
  AlertTriangle,
  History
} from 'lucide-react';
import CountUpNumber from './CountUpNumber';
import InteractiveButton from '@/components/ui/InteractiveButton';
import { ArcadeScoreRecord, FillerStats } from '@/types/arcade';

interface FillerResultsCardProps {
  stats: FillerStats;
  tip: string;
  isTipLoading: boolean;
  personalBest: number | null;
  history: ArcadeScoreRecord[];
  isNewBest: boolean;
  onPlayAgain: () => void;
  onBackToArcade: () => void;
}

export default function FillerResultsCard({
  stats,
  tip,
  isTipLoading,
  personalBest,
  history,
  isNewBest,
  onPlayAgain,
  onBackToArcade,
}: FillerResultsCardProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
      if (isNewBest) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C97B4A', '#EDEBE6', '#F59E0B'],
          });
        } catch {
          // ignore
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNewBest]);

  const densityGrade =
    stats.fillerPercentage <= 2.5
      ? { label: 'COMMANDING CLARITY', color: 'text-[#10B981]', bg: 'bg-[#10B981]/15', border: 'border-[#10B981]/30' }
      : stats.fillerPercentage <= 6
      ? { label: 'MODERATE CALIBRATION', color: 'text-[#C97B4A]', bg: 'bg-[#C97B4A]/15', border: 'border-[#C97B4A]/30' }
      : { label: 'HIGH FILLER LOAD', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/15', border: 'border-[#EF4444]/30' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#24232B] border border-[#33323C] rounded p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent Sheen */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(201,123,74,0.08),transparent_70%)] pointer-events-none" />

      {/* Header Docket */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#33323C] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#8B899A]">
            <span>DRILL TELEMETRY RESULTS</span>
            <span>•</span>
            <span className="text-[#C97B4A]">FILLER WORD REFLEX</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#EDEBE6] tracking-tight mt-1">
            Speech Precision Audit
          </h2>
        </div>

        {/* New Record Banner if applicable */}
        {isNewBest && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C97B4A]/20 border border-[#C97B4A] text-[#EDEBE6] text-xs font-mono font-semibold shadow-[0_0_16px_rgba(201,123,74,0.35)]"
          >
            <Trophy className="w-3.5 h-3.5 text-[#C97B4A] animate-bounce" />
            <span>NEW PERSONAL BEST RECORD!</span>
          </motion.div>
        )}
      </div>

      {/* Primary Stat Tiles with Counting Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stat 1: Filler Percentage */}
        <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-[#8B899A] tracking-wider mb-2 flex items-center justify-between">
            <span>FILLER DENSITY</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${densityGrade.bg} ${densityGrade.color} ${densityGrade.border} border`}>
              {densityGrade.label}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-[#EDEBE6]">
            {revealed ? (
              <CountUpNumber
                value={stats.fillerPercentage}
                decimals={1}
                suffix="%"
                duration={1200}
                className={stats.fillerPercentage > 6 ? 'text-[#EF4444]' : 'text-[#C97B4A]'}
              />
            ) : (
              '0.0%'
            )}
          </div>
          <div className="text-[10px] font-mono text-[#8B899A] mt-2">
            Target: &lt;3.0% for executive presence
          </div>
        </div>

        {/* Stat 2: Total Fillers Caught */}
        <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-[#8B899A] tracking-wider mb-2">
            FILLERS CAUGHT
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-[#EDEBE6]">
            {revealed ? (
              <CountUpNumber
                value={stats.fillerCount}
                decimals={0}
                duration={900}
                className="text-[#EDEBE6]"
              />
            ) : (
              '0'
            )}
            <span className="text-sm font-mono font-normal text-[#8B899A] ml-1">words</span>
          </div>
          <div className="text-[10px] font-mono text-[#8B899A] mt-2">
            Real-time pattern matches in 60s
          </div>
        </div>

        {/* Stat 3: Total Words Typed/Spoken */}
        <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-[#8B899A] tracking-wider mb-2">
            TOTAL WORDS
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-[#EDEBE6]">
            {revealed ? (
              <CountUpNumber
                value={stats.totalWords}
                decimals={0}
                duration={1000}
                className="text-[#EDEBE6]"
              />
            ) : (
              '0'
            )}
            <span className="text-sm font-mono font-normal text-[#8B899A] ml-1">words</span>
          </div>
          <div className="text-[10px] font-mono text-[#8B899A] mt-2">
            Speaking velocity (~{stats.totalWords} WPM pacing)
          </div>
        </div>
      </div>

      {/* Groq AI Generated Coaching Tip */}
      <div className="p-4 sm:p-5 rounded bg-[#1C1B22] border border-[#33323C] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#C97B4A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GROQ EXECUTIVE COACHING TIP</span>
        </div>

        {isTipLoading ? (
          <div className="flex items-center gap-2 py-2 text-xs font-mono text-[#8B899A]">
            <span className="w-2 h-2 rounded-full bg-[#C97B4A] animate-ping" />
            <span>Analyzing verbal habits and synthesizing tactical tip...</span>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm text-[#EDEBE6] leading-relaxed font-mono"
          >
            &ldquo;{tip}&rdquo;
          </motion.p>
        )}
      </div>

      {/* Specific Word Breakdown Cloud */}
      <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] space-y-2">
        <div className="text-[10px] font-mono uppercase text-[#8B899A] tracking-wider flex items-center justify-between">
          <span>FREQUENCY BREAKDOWN</span>
          <span>{stats.detectedList.length} UNIQUE FILLERS DETECTED</span>
        </div>

        {stats.detectedList.length === 0 ? (
          <div className="text-xs font-mono text-[#10B981] flex items-center gap-2 py-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero filler words detected during this drill. Pristine execution!</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.detectedList.map((item) => (
              <div
                key={item.word}
                className="px-2.5 py-1 rounded bg-[#24232B] border border-[#33323C] text-xs font-mono flex items-center gap-2"
              >
                <span className="text-[#EDEBE6] font-semibold">"{item.word}"</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C97B4A]/20 text-[#C97B4A]">
                  {item.count}×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard / Personal Best Tracker */}
      <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8B899A] tracking-wider">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#C97B4A]" />
            <span>PERSONAL BEST BENCHMARK</span>
          </span>
          <span className="text-[#EDEBE6]">
            LOWEST FILLER %: <strong className="text-[#C97B4A]">{personalBest !== null ? `${personalBest}%` : 'N/A'}</strong>
          </span>
        </div>

        {/* History log ledger */}
        {history.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[9px] font-mono text-[#8B899A] uppercase flex items-center gap-1">
              <History className="w-3 h-3" />
              <span>Recent Rounds:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {history.slice(0, 4).map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-2 rounded bg-[#24232B] border border-[#33323C] text-[10px] font-mono flex flex-col justify-between"
                >
                  <div className="text-[#8B899A] flex justify-between">
                    <span>Round {history.length - idx}</span>
                    <span className="text-[#EDEBE6] font-bold">{entry.score_value}%</span>
                  </div>
                  <div className="text-[9px] text-[#8B899A]/60 mt-1 truncate">
                    {new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToArcade}
          className="flex items-center gap-2 px-4 py-2 rounded font-mono text-xs text-[#8B899A] hover:text-[#EDEBE6] bg-[#1C1B22] hover:bg-[#33323C] border border-[#33323C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Arcade Hub</span>
        </button>

        <InteractiveButton
          variant="primary"
          onClick={onPlayAgain}
          data-cursor-text="REPLAY"
          className="px-5 py-2 rounded text-xs font-semibold tracking-wide flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Again</span>
        </InteractiveButton>
      </div>
    </motion.div>
  );
}
