import React from 'react';
import SpotlightCard from '@/components/SpotlightCard';

interface MetricsGridProps {
  metrics: {
    total_sessions: number;
    average_score: number;
    highest_score: number;
    most_practiced_role: string;
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const avg = metrics.average_score;
  const isHigh = avg >= 80;
  const avgOpacity = isHigh ? 'opacity-100' : avg >= 60 ? 'opacity-80' : 'opacity-55';

  const verdict = isHigh
    ? { stamp: 'TIER-1 / READY', desc: 'Consistent demonstration of trade-off defensibility and STAR pacing.' }
    : avg >= 60
    ? { stamp: 'CALIBRATING', desc: 'Solid technical responses. Focus on production failure recovery and metrics.' }
    : { stamp: 'FOUNDATIONAL', desc: 'Focus on task ownership and quantifiable outcomes over abstract overviews.' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* Hero Metric Card: 5 Columns Asymmetric */}
      <SpotlightCard cursorText="INDEX" className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8B899A]">
            <span className="uppercase tracking-[0.2em]">ROLLING INDEX</span>
            <span className="border border-[#33323C] px-2 py-0.5 rounded text-[#EDEBE6]">
              [{verdict.stamp}]
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-6xl sm:text-7xl font-black font-heading text-[#C97B4A] tracking-tight leading-none interactive-stat inline-block ${avgOpacity}`}>
                {metrics.average_score}
              </span>
              <span className="text-sm font-mono text-[#8B899A] font-bold">%</span>
            </div>
            <p className="text-[11px] font-mono text-[#8B899A] uppercase tracking-wider mt-1">
              Average Evaluation Score
            </p>
          </div>

          <p className="text-xs text-[#8B899A] leading-relaxed pt-2 border-t border-[#33323C]">
            {verdict.desc}
          </p>
        </div>

        <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-[#8B899A] border-t border-[#33323C]">
          <span>L6 BENCHMARK: 80%</span>
          <span className="text-[#EDEBE6]">
            {isHigh ? 'EXCEEDS BAR' : 'CALIBRATING'}
          </span>
        </div>
      </SpotlightCard>

      {/* Right Column: 7 Columns Asymmetric Split (7 cols + 5 cols + full width) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Stat 1: Total Completed Sessions */}
        <SpotlightCard cursorText="SIMS" className="sm:col-span-7 p-5 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] flex justify-between items-center">
            <span>TOTAL SESSIONS</span>
            <span className="text-[#EDEBE6]">#SIM</span>
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-heading text-[#EDEBE6] tracking-tight interactive-stat inline-block">
              {String(metrics.total_sessions).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono text-[#8B899A] ml-2">SIMULATIONS</span>
          </div>
          <div className="text-[10px] font-mono text-[#8B899A]">
            5 multi-stage scenario prompts per session
          </div>
        </SpotlightCard>

        {/* Stat 2: Peak Evaluation */}
        <SpotlightCard cursorText="PEAK" className="sm:col-span-5 p-5 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] flex justify-between items-center">
            <span>PEAK EVAL</span>
            <span className="text-[#EDEBE6]">HIGH</span>
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-heading text-[#C97B4A] tracking-tight opacity-90 interactive-stat inline-block">
              {metrics.highest_score}
            </span>
            <span className="text-xs font-mono text-[#8B899A] ml-1">%</span>
          </div>
          <div className="text-[10px] font-mono text-[#8B899A]">
            Single-session high
          </div>
        </SpotlightCard>

        {/* Stat 3: Primary Focus Track */}
        <SpotlightCard cursorText="TRACK" className="sm:col-span-12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em]">
              PRIMARY CALIBRATION TRACK
            </div>
            <div className="text-sm font-semibold text-[#EDEBE6] font-heading mt-0.5 truncate max-w-md">
              {metrics.most_practiced_role || 'No sessions recorded'}
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 text-[10px] font-mono text-[#8B899A]">
            <span>RECOMMENDED FOCUS:</span>
            <div className="text-[#EDEBE6] font-medium">SYSTEM BOUNDARIES &amp; FAILURES</div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
