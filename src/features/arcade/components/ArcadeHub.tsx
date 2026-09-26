'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Sparkles, 
  Clock, 
  Trophy, 
  Zap, 
  Mic2, 
  Flame, 
  Target,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import InteractiveButton from '@/components/ui/InteractiveButton';
import { ArcadeGameType, PersonalBests } from '@/types/arcade';

interface ArcadeHubProps {
  onSelectGame: (game: ArcadeGameType) => void;
  personalBests: PersonalBests;
}

export default function ArcadeHub({ onSelectGame, personalBests }: ArcadeHubProps) {
  return (
    <div className="space-y-8">
      {/* Editorial Header Docket */}
      <div className="border-b border-[#33323C] pb-6 space-y-3">
        <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#8B899A]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C97B4A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C97B4A]" />
          </span>
          <span className="text-[#EDEBE6] font-bold">PREPR ARCADE</span>
          <span className="text-[#33323C]">/</span>
          <span>HIGH-VELOCITY MICRO-DRILLS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#EDEBE6]">
              Practice Arcade
            </h1>
            <p className="text-xs sm:text-sm text-[#8B899A] mt-1.5 max-w-2xl leading-relaxed font-body">
              Gamified 60-second micro-exercises designed to sharpen verbal reflexes, trim conversational filler, and perfect your elevator pitch.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <div className="px-3 py-1.5 rounded-full bg-[#24232B] border border-[#33323C] text-[#8B899A] flex items-center gap-2">
              <Gamepad2 className="w-3.5 h-3.5 text-[#C97B4A]" />
              <span className="text-[#EDEBE6] font-semibold">2 Fast Drills</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#24232B] border border-[#33323C] text-[#8B899A] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#C97B4A]" />
              <span className="text-[#EDEBE6] font-semibold">Instant Telemetry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selectable Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GAME 1: Filler Word Reflex */}
        <SpotlightCard
          cursorText="PLAY"
          className="p-6 sm:p-7 flex flex-col justify-between min-h-[340px] cursor-pointer group"
          onClick={() => onSelectGame('filler_reflex')}
        >
          <div className="space-y-4">
            {/* Card Badge Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C97B4A]/15 border border-[#C97B4A]/30 text-[#C97B4A] text-[10px] font-mono font-bold tracking-wider uppercase">
                <Flame className="w-3 h-3" />
                GAME 01 • VERBAL REFLEX
              </span>

              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8B899A]">
                <Clock className="w-3.5 h-3.5 text-[#C97B4A]" />
                <span>60 SECONDS</span>
              </div>
            </div>

            {/* Game Title & Description */}
            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#EDEBE6] group-hover:text-[#C97B4A] transition-colors">
                Filler Word Reflex
              </h2>
              <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
                Speak or type freely about a past project. Our zero-latency client-side matcher flags unconscious filler words (<em className="text-[#EDEBE6] not-italic">um, like, basically, actually, you know</em>) in real time with terracotta highlights.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Real-Time Highlight
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Live Counter
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Groq Verbal Coach
              </span>
            </div>
          </div>

          {/* Card Footer: Personal Best & CTA */}
          <div className="pt-6 border-t border-[#33323C]/70 flex items-center justify-between">
            <div className="flex flex-col font-mono">
              <span className="text-[9px] uppercase tracking-wider text-[#8B899A]">Personal Best</span>
              <span className="text-sm font-bold text-[#EDEBE6] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#C97B4A]" />
                {personalBests.fillerReflexBest !== null
                  ? `${personalBests.fillerReflexBest}% Density`
                  : 'No runs yet'}
              </span>
            </div>

            <InteractiveButton
              variant="primary"
              onClick={() => onSelectGame('filler_reflex')}
              data-cursor-text="PLAY"
              className="px-4 py-2 rounded text-xs font-semibold tracking-wide flex items-center gap-1.5"
            >
              <span>Launch Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </InteractiveButton>
          </div>
        </SpotlightCard>

        {/* GAME 2: 60-Second Pitch */}
        <SpotlightCard
          cursorText="PITCH"
          className="p-6 sm:p-7 flex flex-col justify-between min-h-[340px] cursor-pointer group"
          onClick={() => onSelectGame('pitch_60')}
        >
          <div className="space-y-4">
            {/* Card Badge Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#33323C] border border-[#4A4856] text-[#EDEBE6] text-[10px] font-mono font-bold tracking-wider uppercase">
                <Target className="w-3 h-3 text-[#C97B4A]" />
                GAME 02 • ELEVATOR DRILL
              </span>

              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8B899A]">
                <Clock className="w-3.5 h-3.5 text-[#C97B4A]" />
                <span>60 SECONDS</span>
              </div>
            </div>

            {/* Game Title & Description */}
            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#EDEBE6] group-hover:text-[#C97B4A] transition-colors">
                60-Second Pitch
              </h2>
              <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
                A hard 60-second countdown. Prompt: &ldquo;Who are you and what do you do?&rdquo; When time expires, your pitch locks and is scored by Groq on clarity, conciseness, and punch.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Strict Auto-Submit
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Pitch Scoring Rubric
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A]">
                Circular Radial Score
              </span>
            </div>
          </div>

          {/* Card Footer: Personal Best & CTA */}
          <div className="pt-6 border-t border-[#33323C]/70 flex items-center justify-between">
            <div className="flex flex-col font-mono">
              <span className="text-[9px] uppercase tracking-wider text-[#8B899A]">Personal Best</span>
              <span className="text-sm font-bold text-[#EDEBE6] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#C97B4A]" />
                {personalBests.pitchBest !== null
                  ? `${personalBests.pitchBest} / 100`
                  : 'Ready to calibrate'}
              </span>
            </div>

            <InteractiveButton
              variant="secondary"
              onClick={() => onSelectGame('pitch_60')}
              data-cursor-text="PITCH"
              className="px-4 py-2 rounded text-xs font-semibold tracking-wide flex items-center gap-1.5"
            >
              <span>Launch Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </InteractiveButton>
          </div>
        </SpotlightCard>
      </div>

      {/* Arcade Benchmarks Strip */}
      <div className="p-4 sm:p-5 rounded bg-[#24232B] border border-[#33323C] font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4 text-[#C97B4A]" />
          <div>
            <div className="text-[#EDEBE6] font-semibold">Target Executive Benchmarks</div>
            <div className="text-[10px] text-[#8B899A]">Optimal standards for engineering lead and staff interviews</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[#8B899A]">Filler Density:</span>
            <span className="text-[#EDEBE6] font-bold">&lt; 2.5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C97B4A]" />
            <span className="text-[#8B899A]">Pitch Score:</span>
            <span className="text-[#EDEBE6] font-bold">&gt; 85 / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
