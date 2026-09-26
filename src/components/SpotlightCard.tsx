'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, HTMLMotionProps } from 'framer-motion';

interface SpotlightCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  cursorText?: string;
  tiltEnabled?: boolean;
}

export default function SpotlightCard({
  children,
  className = '',
  cursorText,
  tiltEnabled = true,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Spring Values
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 350, damping: 24 });
  const springRy = useSpring(ry, { stiffness: 350, damping: 24 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);

    if (tiltEnabled) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      rx.set(rotateX);
      ry.set(rotateY);

      // Parallax inner offset
      el.style.setProperty('--parallax-x', `${((x - centerX) / centerX) * 4}px`);
      el.style.setProperty('--parallax-y', `${((y - centerY) / centerY) * 4}px`);
    }
  };

  const handlePointerLeave = () => {
    rx.set(0);
    ry.set(0);
    const el = cardRef.current;
    if (el) {
      el.style.setProperty('--parallax-x', '0px');
      el.style.setProperty('--parallax-y', '0px');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX: springRx,
        rotateY: springRy,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ y: -3, scale: 1.008 }}
      transition={{ duration: 0.2 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-cursor="card"
      data-cursor-text={cursorText}
      className={`spotlight-card group relative overflow-hidden bg-[#24232B] border border-[#33323C] rounded shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] hover:border-[#4A4856] transition-all duration-200 will-change-transform ${className}`}
      {...props}
    >
      {/* 1. Sweeping Glass Glare Sheen Reflection */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(400px_circle_at_var(--mouse-x,-999px)_var(--mouse-y,-999px),rgba(255,255,255,0.06),transparent_60%)]" />

      {/* 2. Terracotta Spotlight Underglow */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(450px_circle_at_var(--mouse-x,-999px)_var(--mouse-y,-999px),rgba(201,123,74,0.09),transparent_75%)]" />

      {/* 3. Internal Parallax Content Container */}
      <div
        style={{
          transform: 'translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 12px)',
        }}
        className="relative z-20 w-full h-full flex flex-col justify-between transition-transform duration-100 ease-out"
      >
        {children}
      </div>
    </motion.div>
  );
}
