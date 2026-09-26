'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import InteractiveButton from '@/components/ui/InteractiveButton';
import LivingHeading from '@/components/ui/LivingHeading';

export default function AnimatedHero3D() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -28]);

  return (
    <motion.div
      ref={heroRef}
      style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
      className="w-full pt-4 pb-12 md:pt-6 md:pb-16 origin-top will-change-transform"
    >
      {/* Asymmetric 12-Column Grid (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column (7 cols): Editorial Typography */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#8B899A] uppercase">
              <span>EVALUATION PROTOCOL</span>
              <span className="text-[#33323C]">/</span>
              <span>L5–L7 RUBRICS</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#24232B] border border-[#33323C] text-[10px] font-mono text-[#EDEBE6]">
              <span className="text-[#C97B4A]">⚡</span> Sub-2s inference via Groq
            </span>
          </div>

          <LivingHeading className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08]" accentWord="trade-off">
            The difference between an offer and a rejection is trade-off articulation.
          </LivingHeading>

          <p className="text-sm sm:text-base text-[#8B899A] max-w-xl leading-relaxed">
            Interviewers rarely evaluate whether you know Kafka vs. RabbitMQ. They test what breaks at 100k writes/sec, why you rejected event-sourcing, and how your topology recovers under network partition.
          </p>

          {/* Asymmetric Actions */}
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <InteractiveButton
              href="/interview"
              variant="primary"
              data-cursor-text="START"
              className="px-5 py-3 rounded text-xs font-semibold tracking-wider shadow-sm"
            >
              <span>START SIMULATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </InteractiveButton>

            <Link
              href="/dashboard"
              data-cursor-text="RUBRICS"
              className="text-xs font-mono text-[#8B899A] hover:text-[#EDEBE6] transition-colors tracking-wider"
            >
              Inspect Evaluation Rubrics →
            </Link>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="pt-4 border-t border-[#33323C] flex items-center gap-6 text-[11px] font-mono text-[#8B899A]">
            <div>&lt;1.2s Groq Latency</div>
            <span className="text-[#33323C]">/</span>
            <div>90s Pacing Clock</div>
            <span className="text-[#33323C]">/</span>
            <div>STAR Structuring</div>
          </div>
        </div>

        {/* Right Column (5 cols): Tilted Live Dossier Card */}
        <div className="lg:col-span-5 pt-2">
          <SpotlightCard
            cursorText="DOSSIER"
            className="p-6 shadow-lg rotate-[-1deg] space-y-4 hover:rotate-0 transition-transform duration-200"
          >
            {/* Dossier Header */}
            <div className="flex items-center justify-between border-b border-[#33323C] pb-3 text-[10px] font-mono text-[#8B899A]">
              <span className="uppercase tracking-widest text-[#EDEBE6] font-bold">
                DOSSIER // SIM-8491
              </span>
              <span className="text-[#C97B4A] font-bold">
                L6 ARCHITECT EVAL
              </span>
            </div>

            {/* Question Excerpt */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B899A]">
                PROMPT EXCERPT
              </span>
              <p className="text-xs font-semibold text-[#EDEBE6] leading-snug">
                &ldquo;Your write throughput 10x&apos;s on Black Friday. Where does your primary-replica Postgres topology fail first?&rdquo;
              </p>
            </div>

            {/* Candidate Response Transcript */}
            <div className="p-3 rounded bg-[#1C1B22] border border-[#33323C] text-[11px] text-[#8B899A] font-mono leading-relaxed">
              <span className="text-[#EDEBE6] block mb-0.5 font-bold">Candidate Transcript:</span>
              &ldquo;Replication lag saturates read replicas. I would implement write-ahead batching via Redis stream buffer, but the bottleneck is connection pooling on PgBouncer...&rdquo;
            </div>

            {/* Inline Reviewer Notes (No icons in bubbles, pure typography) */}
            <div className="space-y-2 text-xs font-mono">
              <div className="border-l-2 border-[#C97B4A] pl-2.5 text-[#EDEBE6]/90 text-[11px]">
                Identified connection pool exhaustion prior to disk I/O saturation (+18 pts).
              </div>
              <div className="border-l-2 border-[#33323C] pl-2.5 text-[#8B899A] text-[11px]">
                Did not address write buffer replay failure semantics (-11 pts).
              </div>
            </div>

            {/* Score Band */}
            <div className="pt-3 border-t border-[#33323C] flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] uppercase text-[#8B899A] block">VERDICT</span>
                <span className="text-xs font-bold text-[#EDEBE6]">STRONG ADVANCE</span>
              </div>
              <div className="text-right">
                <span data-cursor-text="SCORE" className="text-3xl font-black text-[#C97B4A] font-heading leading-none interactive-stat inline-block">84</span>
                <span className="text-xs text-[#8B899A]">/100</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </motion.div>
  );
}
