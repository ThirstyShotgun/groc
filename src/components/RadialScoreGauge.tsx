'use client';

import React, { useEffect, useState } from 'react';

interface RadialScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export default function RadialScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  animate = true,
  className = '',
}: RadialScoreGaugeProps) {
  const [currentScore, setCurrentScore] = useState(animate ? 0 : score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScore(score);
    }, animate ? 100 : 0);
    return () => clearTimeout(timer);
  }, [score, animate]);

  const config = {
    sm: { dimension: 64, strokeWidth: 4, radius: 26, fontSize: 'text-sm' },
    md: { dimension: 96, strokeWidth: 6, radius: 40, fontSize: 'text-2xl' },
    lg: { dimension: 136, strokeWidth: 7, radius: 56, fontSize: 'text-3xl' },
    xl: { dimension: 172, strokeWidth: 8, radius: 72, fontSize: 'text-5xl' },
  }[size];

  const circumference = 2 * Math.PI * config.radius;
  const progressOffset = circumference - (currentScore / 100) * circumference;

  const scoreOpacity = score >= 80 ? 'opacity-100' : score >= 60 ? 'opacity-80' : 'opacity-55';
  const strokeColor = '#C97B4A';

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.dimension, height: config.dimension }}
      >
        <svg
          width={config.dimension}
          height={config.dimension}
          className="transform -rotate-90"
        >
          {/* Background Track Circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            fill="transparent"
            stroke="#33323C"
            strokeWidth={config.strokeWidth}
          />

          {/* Value Ring in terracotta */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${scoreOpacity}`}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className={`font-heading font-black text-[#EDEBE6] ${config.fontSize} tracking-tight`}>
              {score}
            </span>
            {size !== 'sm' && (
              <span className="text-[10px] text-[#8B899A] font-mono ml-0.5">
                /100
              </span>
            )}
          </div>
        </div>
      </div>

      {showLabel && size !== 'sm' && (
        <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-[#8B899A] px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C]">
          {score >= 80 ? 'EXCEEDS BAR' : score >= 60 ? 'BASELINE' : 'NEEDS REVISION'}
        </span>
      )}
    </div>
  );
}
