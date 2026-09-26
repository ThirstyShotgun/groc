'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[99998] pointer-events-none overflow-hidden bg-transparent"
    >
      <motion.div
        style={{ scaleX }}
        className="h-full w-full bg-[#C97B4A] origin-left"
      />
    </div>
  );
}
