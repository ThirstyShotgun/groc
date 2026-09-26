'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import Lenis from 'lenis';
import {
  initLenis,
  subscribeToScroll,
  getScrollSnapshot,
  getLenisInstance,
} from '@/lib/lenisStore';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollProgress: number;
  velocity: number;
}

const defaultSnapshot = { progress: 0, velocity: 0 };

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollProgress: 0,
  velocity: 0,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollData = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    () => defaultSnapshot
  );

  useEffect(() => {
    const cleanup = initLenis();
    return cleanup;
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: getLenisInstance(),
        scrollProgress: scrollData.progress,
        velocity: scrollData.velocity,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
