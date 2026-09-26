'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function EditorialManifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [-25, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [0.35, 1]);

  return (
    <motion.section
      ref={containerRef}
      style={{ x, opacity }}
      className="py-8 border-y border-[#33323C] will-change-transform"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
        <div className="md:col-span-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
          HIRING COMMITTEE OBSERVATION
        </div>
        <div className="md:col-span-8 space-y-3">
          <blockquote className="text-xl sm:text-2xl font-bold text-[#EDEBE6] tracking-tight leading-snug font-heading">
            &ldquo;Most candidates fail system design not because they don&apos;t know Kafka, but because they cannot defend why they chose it over Postgres.&rdquo;
          </blockquote>
          <p className="text-xs text-[#8B899A] font-mono">
            Calibrated against 400+ Staff and Principal Engineering interview loops.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
