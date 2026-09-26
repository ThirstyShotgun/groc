'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  return (
    <>
      {/* 1. Terracotta Editorial Wipe Shutter */}
      {!reducedMotion && (
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99990] bg-[#C97B4A] origin-top pointer-events-none"
        />
      )}

      {/* 2. Page Content Scale, Blur, and Elevation Reveal */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 12, filter: 'blur(4px)' }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: reducedMotion ? 0 : 0.08 }}
        className="w-full flex-1 flex flex-col will-change-transform"
      >
        {children}
      </motion.div>
    </>
  );
}
