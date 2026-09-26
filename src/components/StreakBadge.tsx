'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { StreakData } from '@/lib/supabase';

interface StreakBadgeProps {
  streak: StreakData;
  className?: string;
  showDetails?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  className = '',
  showDetails = false
}) => {
  const { currentStreak, bestStreak, practicedToday } = streak;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded border transition-colors ${
        currentStreak > 0
          ? 'bg-[#24232B] border-[#33323C]'
          : 'bg-[#1C1B22] border-[#33323C]'
      } ${className}`}
      title={
        practicedToday
          ? `${currentStreak}-day streak active. Best: ${bestStreak} days.`
          : currentStreak > 0
          ? `${currentStreak}-day streak active.`
          : 'Complete an interview to start a streak.'
      }
    >
      <Flame
        className={`w-3.5 h-3.5 ${
          currentStreak > 0
            ? 'text-[#C97B4A]'
            : 'text-[#8B899A]/50'
        }`}
      />

      <div className="flex items-center gap-1.5 text-xs font-mono">
        <span className={currentStreak > 0 ? 'text-[#EDEBE6] font-medium' : 'text-[#8B899A]'}>
          {currentStreak > 0 ? `${currentStreak}D STREAK` : 'ZERO STREAK'}
        </span>

        {showDetails && bestStreak > 1 && (
          <span className="text-[10px] text-[#8B899A] ml-1 border-l border-[#33323C] pl-2">
            BEST: {bestStreak}d
          </span>
        )}
      </div>
    </div>
  );
};
