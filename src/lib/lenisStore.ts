'use client';

import Lenis from 'lenis';

interface ScrollSnapshot {
  progress: number;
  velocity: number;
}

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;
let resetTimer: NodeJS.Timeout | null = null;
let currentSnapshot: ScrollSnapshot = { progress: 0, velocity: 0 };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeToScroll(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getScrollSnapshot(): ScrollSnapshot {
  return currentSnapshot;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export function initLenis(): () => void {
  if (typeof window === 'undefined') return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return () => {};

  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisInstance.on('scroll', (e: { progress: number; velocity: number }) => {
      currentSnapshot = {
        progress: e.progress,
        velocity: e.velocity,
      };

      // Velocity-based motion blur & skew simulation
      const skew = Math.max(-1.8, Math.min(1.8, e.velocity * 0.06));
      const blur = Math.min(1.0, Math.abs(e.velocity) * 0.04);

      document.documentElement.style.setProperty('--scroll-skew', `${skew.toFixed(2)}deg`);
      document.documentElement.style.setProperty('--scroll-blur', `${blur.toFixed(2)}px`);

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        document.documentElement.style.setProperty('--scroll-skew', '0deg');
        document.documentElement.style.setProperty('--scroll-blur', '0px');
      }, 90);

      notify();
    });

    const updateRaf = (time: number) => {
      lenisInstance?.raf(time);
      rafId = requestAnimationFrame(updateRaf);
    };
    rafId = requestAnimationFrame(updateRaf);
  }

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (resetTimer) clearTimeout(resetTimer);
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }
    document.documentElement.style.setProperty('--scroll-skew', '0deg');
    document.documentElement.style.setProperty('--scroll-blur', '0px');
  };
}
