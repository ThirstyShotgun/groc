'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SpotlightCard from '@/components/SpotlightCard';

export default function EvaluationArchitecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const pillar1Y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const pillar2Y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.35, 1]);

  return (
    <section ref={sectionRef} className="space-y-6">
      <div className="border-b border-[#33323C] pb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A] block mb-1">
          EVALUATION ARCHITECTURE
        </span>
        <h2 className="text-2xl font-bold text-[#EDEBE6] font-heading tracking-tight">
          How The Scoring Engine Works
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <motion.div
          style={{ y: pillar1Y, opacity }}
          className="lg:col-span-7 will-change-transform flex"
        >
          <SpotlightCard className="p-7 space-y-5 flex-1" cursorText="ARCH">
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B899A]">
                PILLAR 01 // DYNAMIC INFERENCE
              </div>
              <h3 className="text-xl font-bold text-[#EDEBE6] font-heading">
                Adaptive Question Generation
              </h3>
              <p className="text-xs sm:text-sm text-[#8B899A] leading-relaxed">
                Rather than pulling static riddles from a database, Prepr prompts Groq Llama-3.3-70B with role context and architectural constraints targeting trade-offs and failure modes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#33323C] text-[11px] font-mono text-[#8B899A]">
              LATENCY: &lt;1.2 SECONDS • ZERO PRE-SCRIPTED QUESTIONS
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div
          style={{ y: pillar2Y, opacity }}
          className="lg:col-span-5 flex flex-col gap-5 will-change-transform"
        >
          <SpotlightCard className="p-5 space-y-2 flex-1" cursorText="CLOCK">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B899A]">
              PILLAR 02 // PACING PRESSURE
            </div>
            <h4 className="text-sm font-bold text-[#EDEBE6] font-heading">
              Strict 90-Second Clock
            </h4>
            <p className="text-xs text-[#8B899A] leading-relaxed">
              Interviews are verbal presentations under time pressure. The pacing clock forces conciseness, structured STAR delivery, and trade-off priority.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 space-y-2 flex-1" cursorText="RUBRIC">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B899A]">
              PILLAR 03 // ITEMIZATION
            </div>
            <h4 className="text-sm font-bold text-[#EDEBE6] font-heading">
              Granular Committee Rubrics
            </h4>
            <p className="text-xs text-[#8B899A] leading-relaxed">
              Instant 0-100 rubric evaluations highlight exact strengths, omitted edge cases, and specific calibration tips for candidate promotion loops.
            </p>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
