'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function GooeyBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      {/* SVG Filter for Liquid Goo Thresholding */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="autumn-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Filtered Liquid Container */}
      <div
        className="relative w-full max-w-4xl h-[420px] md:h-[480px] opacity-70 sm:opacity-85"
        style={{ filter: 'url(#autumn-goo)' }}
      >
        {/* Blob 1: Burnt Rust Orange */}
        <motion.div
          className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#C1652F] to-[#E0A458] opacity-80"
          animate={{
            x: ['-20%', '30%', '-10%', '-20%'],
            y: ['-10%', '25%', '-25%', '-10%'],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '20%', left: '25%' }}
        />

        {/* Blob 2: Warm Amber Gold */}
        <motion.div
          className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-[#E0A458] to-[#C1652F] opacity-75"
          animate={{
            x: ['25%', '-20%', '15%', '25%'],
            y: ['20%', '-20%', '20%', '20%'],
            scale: [1.1, 0.85, 1.1, 1.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ top: '30%', right: '25%' }}
        />

        {/* Blob 3: Dusty Plum */}
        <motion.div
          className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-r from-[#7A5C7E] to-[#3B3560] opacity-80"
          animate={{
            x: ['0%', '35%', '-25%', '0%'],
            y: ['-25%', '15%', '10%', '-25%'],
            scale: [0.95, 1.1, 1, 0.95],
          }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ bottom: '15%', left: '35%' }}
        />

        {/* Blob 4: Blueberry Core */}
        <motion.div
          className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#3B3560] via-[#2E2A47] to-[#7A5C7E] opacity-90"
          animate={{
            scale: [1, 1.08, 0.96, 1],
            rotate: [0, 90, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '25%', left: '35%' }}
        />
      </div>
    </div>
  );
}
