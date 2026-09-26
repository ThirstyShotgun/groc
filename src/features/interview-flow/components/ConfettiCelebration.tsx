'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  score: number;
}

export default function ConfettiCelebration({ score }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (score < 60) return;

    // Minimalist terracotta and soft warm neutral confetti colors
    const colors = ['#C97B4A', '#EDEBE6', '#8B899A'];

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });
      }, 300);

      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Confetti launch error:', e);
    }
  }, [score]);

  return null;
}
