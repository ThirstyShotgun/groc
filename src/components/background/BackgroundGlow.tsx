'use client';

import React, { useEffect, useRef } from 'react';

export default function BackgroundGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer and no reduced motion
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let currentX = width * 0.5;
    let currentY = height * 0.35;
    let targetX = currentX;
    let targetY = currentY;
    let hasMoved = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        hasMoved = true;
      }
    };

    let rafId: number;
    const render = () => {
      if (!document.hidden) {
        // Fluid inertia: smooth lag toward mouse position (0.05 factor)
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        ctx.clearRect(0, 0, width, height);

        // Soft, atmospheric terracotta radial light source (Option A: 3-6% opacity)
        const radius = Math.max(500, Math.min(width, height) * 0.65);
        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          radius
        );

        gradient.addColorStop(0, 'rgba(201, 123, 74, 0.055)');
        gradient.addColorStop(0.35, 'rgba(201, 123, 74, 0.025)');
        gradient.addColorStop(0.7, 'rgba(201, 123, 74, 0.008)');
        gradient.addColorStop(1, 'rgba(28, 27, 34, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}
