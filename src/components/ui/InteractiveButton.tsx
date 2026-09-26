'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface InteractiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'data-cursor'?: string;
  'data-cursor-text'?: string;
  title?: string;
  'aria-label'?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export default function InteractiveButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  'data-cursor': dataCursor = 'link',
  'data-cursor-text': dataCursorText,
  title,
  'aria-label': ariaLabel,
}: InteractiveButtonProps) {
  const btnRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Magnetic spring motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 22 });
  const springY = useSpring(y, { stiffness: 350, damping: 22 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === 'touch') return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.28;
    const distanceY = (e.clientY - centerY) * 0.28;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const newRipple = { x: rippleX, y: rippleY, id: Date.now() };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 650);
    }
    onClick?.(e);
  };

  // Base styling per variant
  const variantStyles = {
    primary:
      'bg-[#C97B4A] text-[#EDEBE6] border border-[#C97B4A] shadow-[0_4px_14px_rgba(201,123,74,0.2)]',
    secondary:
      'bg-[#24232B] text-[#EDEBE6] border border-[#33323C] hover:border-[#8B899A]',
    ghost:
      'bg-transparent text-[#8B899A] hover:text-[#EDEBE6] border border-transparent',
    icon:
      'bg-[#24232B] text-[#8B899A] hover:text-[#EDEBE6] border border-[#33323C] p-2 hover:border-[#8B899A]',
  };

  const content = (
    <motion.span
      ref={btnRef as never}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      data-cursor={dataCursor}
      data-cursor-text={dataCursorText}
      className={`group relative overflow-hidden inline-flex items-center justify-center font-mono select-none transition-colors duration-200 ${variantStyles[variant]} ${className}`}
    >
      {/* 1. Animated Directional Shutter / Wipe Fill */}
      <span className="absolute inset-0 z-0 bg-[#EDEBE6]/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-none" />

      {/* 2. Exact-point Materialized Click Ripple */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{ top: r.y, left: r.x }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/20 pointer-events-none animate-ping"
        />
      ))}

      {/* 3. Button Content with Micro-Interactive Icon Shifts */}
      <span className="relative z-10 flex items-center justify-center gap-2 [&>svg]:transition-transform [&>svg]:duration-200 group-hover:[&>svg]:translate-x-0.5">
        {children}
      </span>
    </motion.span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} title={title} aria-label={ariaLabel} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className="inline-block bg-transparent border-0 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {content}
    </button>
  );
}
