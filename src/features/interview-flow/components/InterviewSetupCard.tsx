'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Activity } from 'lucide-react';
import InteractiveButton from '@/components/ui/InteractiveButton';
import BenchmarkTrackPicker from './BenchmarkTrackPicker';

interface InterviewSetupCardProps {
  roleTitle: string;
  setRoleTitle: (role: string) => void;
  difficulty: string;
  setDifficulty: (level: string) => void;
  isGenerating: boolean;
  onStart: () => void;
}

export default function InterviewSetupCard({
  roleTitle,
  setRoleTitle,
  difficulty,
  setDifficulty,
  isGenerating,
  onStart,
}: InterviewSetupCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-[#24232B] border border-[#33323C] rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Animated Briefing */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#C97B4A] uppercase font-semibold">
              CALIBRATION PROTOCOL // 01
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDEBE6] font-heading tracking-tight leading-snug">
              Target Role Specification
            </h2>

            <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
              Specify the role you are interviewing for. Prepr calibrates{' '}
              <strong className="text-[#EDEBE6] font-semibold">5 multi-stage scenario prompts</strong>{' '}
              designed to test <span className="text-[#EDEBE6]">edge-case handling</span>,{' '}
              <span className="text-[#EDEBE6]">system boundaries</span>, and{' '}
              <strong className="text-[#C97B4A] font-semibold">trade-off defensibility</strong>.
            </p>

            <div className="pt-3 border-t border-[#33323C] space-y-2 text-[11px] font-mono text-[#8B899A]">
              <div className="p-2.5 rounded-lg bg-[#1C1B22]/70 hover:bg-[#1C1B22] border border-transparent hover:border-[#33323C] transition-all cursor-default flex justify-between items-center group">
                <span className="group-hover:text-[#EDEBE6] transition-colors">PACING BENCHMARK</span>
                <span className="text-[#EDEBE6] font-semibold">90s PER PROMPT</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1C1B22]/70 hover:bg-[#1C1B22] border border-transparent hover:border-[#33323C] transition-all cursor-default flex justify-between items-center group">
                <span className="group-hover:text-[#EDEBE6] transition-colors">EVALUATION MODEL</span>
                <span className="text-[#C97B4A] font-semibold">GROQ LLAMA-3.3-70B</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (7 cols): Controls */}
          <div className="lg:col-span-7 space-y-5 bg-[#1C1B22] p-5 sm:p-6 rounded-xl border border-[#33323C]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
                  Candidate Target Role
                </label>
                {isFocused && (
                  <span className="text-[10px] font-mono text-[#C97B4A] animate-pulse">
                    Live Editing
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={roleTitle}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#24232B] border border-[#33323C] text-[#EDEBE6] placeholder-[#8B899A]/40 focus:outline-none focus:border-[#C97B4A] focus:ring-1 focus:ring-[#C97B4A] focus:shadow-[0_0_15px_rgba(201,123,74,0.22)] text-xs font-mono transition-all duration-200"
                />
              </div>
            </div>

            <BenchmarkTrackPicker
              roleTitle={roleTitle}
              setRoleTitle={setRoleTitle}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />

            {/* Action Trigger */}
            <InteractiveButton
              onClick={onStart}
              disabled={!roleTitle.trim() || isGenerating}
              variant="primary"
              data-cursor-text="START"
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  GENERATING QUESTIONS...
                </>
              ) : (
                <>
                  INITIALIZE SIMULATION <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </InteractiveButton>
          </div>
        </div>
      </div>

      {/* Atmospheric Live Activity Ticker (Fills dead space purposefully) */}
      <div className="p-3 rounded-xl bg-[#24232B]/60 border border-[#33323C]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8B899A] text-[11px]">
          <Activity className="w-3.5 h-3.5 text-[#C97B4A] animate-pulse" />
          <span className="font-semibold text-[#EDEBE6]">SIMULATION TELEMETRY:</span>
          <span>Concurrent candidate drills:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8B899A]">
          <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#EDEBE6]">
            Distributed Systems (L6)
          </span>
          <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#EDEBE6]">
            Staff Frontend (L6)
          </span>
          <span className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#EDEBE6]">
            Cloud Native SRE (L5)
          </span>
        </div>
      </div>
    </div>
  );
}
