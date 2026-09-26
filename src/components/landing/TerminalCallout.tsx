'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import InteractiveButton from '@/components/ui/InteractiveButton';

export default function TerminalCallout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.4, 1]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y, scale, opacity }}
      className="will-change-transform"
    >
      <SpotlightCard className="p-8 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6" cursorText="START">
        <div className="space-y-1.5 max-w-xl">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
            READY TO EVALUATE
          </div>
          <h3 className="text-xl font-bold text-[#EDEBE6] font-heading tracking-tight">
            Run a 5-question simulation now.
          </h3>
          <p className="text-xs text-[#8B899A]">
            No account required. Instant calibration against senior and staff engineering bars.
          </p>
        </div>

        <InteractiveButton
          href="/interview"
          variant="primary"
          data-cursor-text="START"
          className="px-5 py-3 rounded text-xs font-semibold tracking-wider shrink-0"
        >
          <span>START INTERVIEW</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </InteractiveButton>
      </SpotlightCard>
    </motion.div>
  );
}
