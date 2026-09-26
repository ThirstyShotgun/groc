'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomCursor } from '@/hooks/useCustomCursor';

interface ClickEcho {
  x: number;
  y: number;
  id: number;
}

export default function CustomCursor() {
  const {
    mouseX,
    mouseY,
    springX,
    springY,
    variant,
    label,
    isMouseDown,
    isVisible,
    isTouch,
  } = useCustomCursor();

  const [echoes, setEchoes] = useState<ClickEcho[]>([]);

  useEffect(() => {
    if (isTouch) return;

    const handlePointerDown = (e: PointerEvent) => {
      const echo = { x: e.clientX, y: e.clientY, id: Date.now() };
      setEchoes((prev) => [...prev.slice(-3), echo]);
      setTimeout(() => {
        setEchoes((prev) => prev.filter((item) => item.id !== echo.id));
      }, 500);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isTouch]);

  if (isTouch || !isVisible) return null;

  const isText = variant === 'text';
  const isLink = variant === 'link';
  const isCard = variant === 'card';
  const isDrag = variant === 'drag';
  const followerSize = isText
    ? { width: 2, height: 22, borderRadius: 2 }
    : label
    ? { width: 'auto', height: 28, borderRadius: 14 }
    : isLink
    ? { width: 42, height: 42, borderRadius: 21 }
    : isDrag
    ? { width: 46, height: 46, borderRadius: 23 }
    : isCard
    ? { width: 34, height: 34, borderRadius: 17 }
    : { width: 12, height: 12, borderRadius: 6 };

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* 1. Click Echo Ripples at Exact Interaction Point */}
      {echoes.map((e) => (
        <motion.div
          key={e.id}
          initial={{ scale: 0.2, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ top: e.y, left: e.x }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#C97B4A] pointer-events-none"
        />
      ))}

      {/* 2. Dynamic Lead Center Dot (Pulses on click/drag) */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C97B4A] will-change-transform shadow-[0_0_8px_rgba(201,123,74,0.6)]"
        style={{
          x: mouseX,
          y: mouseY,
          width: isText ? 0 : 4,
          height: isText ? 0 : 4,
          opacity: isText ? 0 : 0.95,
        }}
        animate={{
          scale: isMouseDown ? 1.6 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* 3. Fluid Spring Follower Ring / Morphing Pill with Movement Feedback */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-mono text-[9px] uppercase tracking-wider font-semibold text-[#EDEBE6] will-change-transform"
        style={{
          x: springX,
          y: springY,
        }}
        animate={{
          width: followerSize.width,
          height: followerSize.height,
          borderRadius: followerSize.borderRadius,
          scale: isMouseDown ? 0.78 : 1,
          backgroundColor: isText
            ? '#C97B4A'
            : isLink
            ? 'rgba(201, 123, 74, 0.16)'
            : isCard
            ? 'rgba(201, 123, 74, 0.08)'
            : 'rgba(201, 123, 74, 0.12)',
          borderColor: isText
            ? 'transparent'
            : isDrag
            ? '#C97B4A'
            : isLink
            ? '#C97B4A'
            : isCard
            ? 'rgba(201, 123, 74, 0.5)'
            : '#C97B4A',
          borderWidth: isText ? 0 : 1.5,
          borderStyle: isDrag ? 'dashed' : 'solid',
          paddingLeft: label ? 10 : 0,
          paddingRight: label ? 10 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 25,
          mass: 0.35,
        }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap px-1 text-[9px] tracking-widest text-[#EDEBE6]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
