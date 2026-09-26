'use client';

import { useState, useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export type CursorVariant = 'default' | 'link' | 'text' | 'drag' | 'card' | 'hidden';

export interface CursorState {
  variant: CursorVariant;
  label?: string;
  isMouseDown: boolean;
  isVisible: boolean;
  isTouch: boolean;
}

export function useCustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>(() => ({
    variant: 'default',
    label: undefined,
    isMouseDown: false,
    isVisible: false,
    isTouch: typeof window !== 'undefined' ? !window.matchMedia('(hover: hover) and (pointer: fine)').matches : true,
  }));

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring configuration for the fluid trailing follower
  const springX = useSpring(mouseX, { stiffness: 400, damping: 28, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 400, damping: 28, mass: 0.4 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setCursorState((s) => ({ ...s, isTouch: !e.matches, isVisible: e.matches }));
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !mediaQuery.matches) {
        setCursorState((s) => (s.isTouch ? s : { ...s, isTouch: true, isVisible: false }));
        return;
      }

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest<HTMLElement>('[data-cursor]');
      const label = target.closest<HTMLElement>('[data-cursor-text]')?.dataset.cursorText;

      let variant: CursorVariant = 'default';

      if (cursorTarget) {
        variant = (cursorTarget.dataset.cursor as CursorVariant) || 'link';
      } else if (target.closest('input, textarea, [contenteditable="true"]')) {
        variant = 'text';
      } else if (target.closest('a, button, [role="button"], select')) {
        variant = 'link';
      } else if (target.closest('[data-cursor="drag"], input[type="range"]')) {
        variant = 'drag';
      } else if (target.closest('.autumn-card, .prepr-card, [data-card]')) {
        variant = 'card';
      }

      setCursorState((prev) => ({
        ...prev,
        variant,
        label,
        isVisible: true,
        isTouch: false,
      }));
    };

    const handlePointerDown = () => setCursorState((s) => ({ ...s, isMouseDown: true }));
    const handlePointerUp = () => setCursorState((s) => ({ ...s, isMouseDown: false }));
    const handleMouseLeave = () => setCursorState((s) => ({ ...s, isVisible: false }));
    const handleMouseEnter = () => {
      if (mediaQuery.matches) {
        setCursorState((s) => ({ ...s, isVisible: true, isTouch: false }));
      }
    };
    const handleTouchStart = () => setCursorState((s) => ({ ...s, isTouch: true, isVisible: false }));

    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mouseX, mouseY]);

  return { mouseX, mouseY, springX, springY, ...cursorState };
}
