'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Cpu, Compass } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';

const SUPPORTING_TRACKS = [
  { level: 'L5', title: 'Senior Frontend Engineer', focus: 'Hydration boundaries, micro-frontends, frame budget profiling' },
  { level: 'Staff', title: 'Platform & Infrastructure Lead', focus: 'Zero-downtime blue/green routing, mesh resilience, SLOs' },
  { level: 'Director', title: 'Engineering Leadership', focus: 'System debt prioritization, headcount allocation, incident post-mortems' },
];

const BREADTH_TAGS = ['Frontend Architecture', 'Data Engineering', 'ML Systems', 'Cloud Native SRE', 'Technical Product'];

export default function BenchmarkTracks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.35, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [30, 0]);

  return (
    <motion.section ref={sectionRef} style={{ opacity, y }} className="space-y-6 will-change-transform">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#33323C] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C97B4A] block mb-1">
            BENCHMARK TRACKS // CALIBRATED SENIORITY
          </span>
          <h2 className="text-2xl font-bold text-[#EDEBE6] font-heading tracking-tight">
            Calibrated Seniority Profiles
          </h2>
        </div>
        <span className="text-xs font-mono text-[#8B899A]">5 prompts per session • Instant evaluation</span>
      </div>

      {/* Asymmetric Layout: Large Featured Track + Supporting Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Large Featured Track (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <SpotlightCard className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 border-[#33323C] hover:border-[#C97B4A]/60 transition-colors" cursorText="L6 DRILL">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[10px] font-mono text-[#C97B4A] font-semibold">
                  <Cpu className="w-3 h-3" /> FEATURED BENCHMARK // LEVEL L6
                </span>
                <span className="text-[10px] font-mono text-[#8B899A]">HIGH INTENSITY</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#EDEBE6] tracking-tight">
                  Distributed Systems Architect
                </h3>
                <p className="text-xs sm:text-sm text-[#8B899A] mt-2 leading-relaxed">
                  Tests state-machine replication, consensus divergence, split-brain recovery, and bounded write-ahead logging under heavy partition loads.
                </p>
              </div>

              {/* Sample Question Preview */}
              <div className="p-3.5 rounded-lg bg-[#1C1B22] border border-[#33323C] text-xs font-mono text-[#EDEBE6]/90 space-y-1">
                <span className="text-[9px] text-[#C97B4A] uppercase tracking-wider block font-bold">↳ Representative Evaluation Prompt:</span>
                <p className="italic text-[#8B899A] text-[11px] leading-relaxed">
                  &ldquo;How do you guarantee exactly-once semantics across a multi-region broker cluster without incurring unbounded 2PC commit latency?&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#33323C] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#8B899A]">EST. DURATION: 10 MINS</span>
              <Link href="/interview?role=Distributed%20Systems%20Architect" className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#C97B4A] hover:bg-[#B86B3B] text-[#EDEBE6] text-xs font-semibold font-mono transition-colors">
                Launch Calibration <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* Supporting Tracks Stack (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {SUPPORTING_TRACKS.map((t) => (
            <Link key={t.title} href={`/interview?role=${encodeURIComponent(t.title)}`} className="block group flex-1">
              <SpotlightCard cursorText={t.level} className="p-4 sm:p-4.5 h-full border-[#33323C] group-hover:border-[#8B899A] transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#C97B4A] font-bold text-[11px]">[{t.level}]</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8B899A] group-hover:text-[#EDEBE6] transition-colors" />
                  </div>
                  <h4 className="font-heading font-semibold text-sm text-[#EDEBE6] group-hover:text-[#C97B4A] transition-colors">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-[#8B899A] mt-1 line-clamp-2 leading-relaxed">
                    {t.focus}
                  </p>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Discipline Breadth Signal Bar */}
      <div className="p-3 rounded-lg bg-[#24232B]/60 border border-[#33323C]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8B899A] text-[11px]">
          <Compass className="w-3.5 h-3.5 text-[#C97B4A]" />
          <span className="font-semibold text-[#EDEBE6]">ROADMAP EXPANSION:</span>
          <span>Also calibrating:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {BREADTH_TAGS.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[10px] text-[#8B899A]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
