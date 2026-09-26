'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LanternLoaderProps {
  label?: string;
  subtext?: string;
}

export function LanternLoader({
  label = 'Evaluating answer with Groq AI...',
  subtext = 'Distilling technical depth, precision, and improvement opportunities'
}: LanternLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {/* Subtle Minimalist Pulse */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Halo */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-16 h-16 rounded-full bg-[#D4AF7A] blur-xl"
        />

        {/* Central Icon */}
        <div className="relative z-10 w-11 h-11 rounded-full bg-[#26223B] border border-white/10 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-[#D4AF7A] animate-pulse" />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[#F4EFEA] tracking-wide font-[family-name:var(--font-fraunces)]">
          {label}
        </p>
        {subtext && (
          <p className="text-xs text-[#9E96AF] max-w-xs mx-auto mt-1 leading-relaxed font-light">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export function DuskSkeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl skeleton-shimmer border border-white/5 ${className}`}
    />
  );
}
