'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ArcadeTimerRingProps {
  timeLeft: number;
  totalTime?: number;
  size?: number;
  strokeWidth?: number;
}

export default function ArcadeTimerRing({
  timeLeft,
  totalTime = 60,
  size = 88,
  strokeWidth = 5,
}: ArcadeTimerRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / totalTime));
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const isFinished = timeLeft <= 0;

  const strokeColor = isFinished
    ? '#8B899A'
    : isUrgent
    ? '#EF4444' // urgent red/crimson
    : '#C97B4A'; // terracotta accent

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <motion.div
        animate={isUrgent ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={isUrgent ? { repeat: Infinity, duration: 0.5 } : { duration: 0.2 }}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#33323C"
            strokeWidth={strokeWidth}
          />

          {/* Animated Countdown Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-mono font-bold leading-none tracking-tight ${
              isUrgent ? 'text-[#EF4444] animate-pulse text-2xl' : 'text-[#EDEBE6] text-xl'
            }`}
          >
            {Math.max(0, timeLeft)}
          </span>
          <span className="text-[9px] font-mono text-[#8B899A] uppercase mt-0.5">
            {isFinished ? 'DONE' : 'SECS'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
