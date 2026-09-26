'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { TrendingUp, Award, Layers, Target } from 'lucide-react';

export default function ResultsProofSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-40px' });

  const [fromScore, setFromScore] = useState(0);
  const [toScore, setToScore] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [roles, setRoles] = useState(0);
  const [precision, setPrecision] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const c1 = animate(0, 62, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setFromScore(Math.floor(v)) });
    const c2 = animate(0, 88, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setToScore(Math.floor(v)) });
    const c3 = animate(0, 1420, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setSessions(Math.floor(v)) });
    const c4 = animate(0, 48, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setRoles(Math.floor(v)) });
    const c5 = animate(0, 94.2, { duration: 1.7, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setPrecision(Number(v.toFixed(1))) });
    return () => { c1.stop(); c2.stop(); c3.stop(); c4.stop(); c5.stop(); };
  }, [isInView]);

  const cards = [
    {
      label: 'SCORE TRAJECTORY',
      icon: TrendingUp,
      renderVal: (
        <div className="flex items-center gap-2 text-3xl font-black font-heading text-[#EDEBE6]">
          <span>{fromScore}</span>
          <svg className="w-8 h-3.5 text-[#C97B4A] shrink-0" viewBox="0 0 36 16" fill="none">
            <motion.path
              d="M2 14 L10 11 L18 12 L26 4 L34 2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.2 }}
            />
          </svg>
          <span className="text-[#C97B4A]">{toScore}</span>
        </div>
      ),
      subtext: '+26 pt average improvement measured within 3 consecutive simulations.',
      tag: '+42% pass rate',
    },
    {
      label: 'SESSIONS COMPLETED',
      icon: Award,
      renderVal: <div className="text-3xl font-black font-heading text-[#EDEBE6]">{sessions.toLocaleString()}+</div>,
      subtext: 'Real candidate technical drills evaluated and logged into active telemetry.',
      tag: 'Live telemetry',
    },
    {
      label: 'ROLE ARCHETYPES',
      icon: Layers,
      renderVal: <div className="text-3xl font-black font-heading text-[#EDEBE6]">{roles}+</div>,
      subtext: 'From Senior Frontend to Distributed Systems and Engineering Leadership.',
      tag: 'L5/L6 calibrated',
    },
    {
      label: 'RUBRIC PRECISION',
      icon: Target,
      renderVal: <div className="text-3xl font-black font-heading text-[#EDEBE6]">{precision}%</div>,
      subtext: 'Demonstrated alignment with Tier-1 engineering hiring committee standards.',
      tag: 'Zero fluff',
    },
  ];

  return (
    <section ref={containerRef} className="w-full space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#33323C] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C97B4A] block mb-1">
            PERFORMANCE TELEMETRY // VALIDATED OUTCOMES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#EDEBE6] tracking-tight">
            Proof in Cold Hard Numbers.
          </h2>
        </div>
        <p className="text-xs text-[#8B899A] max-w-md font-mono">
          Aggregate performance data gathered from iterative candidate simulations across modern engineering disciplines.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="p-5 rounded-xl bg-[#24232B] border border-[#33323C] hover:border-[#C97B4A]/50 transition-colors flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-[#8B899A] uppercase tracking-wider">{c.label}</span>
                  <div className="w-6 h-6 rounded bg-[#1C1B22] border border-[#33323C] flex items-center justify-center text-[#8B899A] group-hover:text-[#C97B4A] transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                {c.renderVal}
              </div>

              <div className="pt-3.5 mt-3 border-t border-[#33323C]/60 space-y-2">
                <p className="text-[11px] text-[#8B899A] leading-relaxed">{c.subtext}</p>
                <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#C97B4A] font-semibold">
                  {c.tag}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
