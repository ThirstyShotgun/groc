'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

interface QuestionTimerProps {
  initialSeconds?: number;
  isActive: boolean;
  onTimeUp: () => void;
  resetKey: number | string;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  initialSeconds = 90,
  isActive,
  onTimeUp,
  resetKey
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(initialSeconds);
      setIsPaused(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [resetKey, initialSeconds]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    if (timeLeft <= 0) {
      setTimeout(() => onTimeUpRef.current(), 0);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 15;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#24232B] border border-[#33323C] text-xs font-mono">
      <span className="text-[10px] uppercase tracking-wider text-[#8B899A]">
        CLOCK
      </span>
      <span className={`font-semibold tracking-wider ${isUrgent ? 'text-[#C97B4A] font-bold' : 'text-[#EDEBE6]'}`}>
        {formattedTime}
      </span>
      <button
        type="button"
        onClick={() => setIsPaused(!isPaused)}
        title={isPaused ? 'Resume timer' : 'Pause timer'}
        className="text-[#8B899A] hover:text-[#EDEBE6] transition-colors p-0.5 ml-1"
        aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
      >
        {isPaused ? <Play className="w-3 h-3 text-[#C97B4A]" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
};
