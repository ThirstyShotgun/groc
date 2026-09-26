'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PARTICLES = [
  { id: 1, top: '15%', left: '18%', size: 4, delay: 0, duration: 6, color: '#E0A458' },
  { id: 2, top: '25%', left: '78%', size: 3, delay: 1.2, duration: 7, color: '#F5EDE1' },
  { id: 3, top: '45%', left: '12%', size: 5, delay: 2.1, duration: 8, color: '#C1652F' },
  { id: 4, top: '65%', left: '85%', size: 3, delay: 0.8, duration: 6.5, color: '#E0A458' },
  { id: 5, top: '75%', left: '28%', size: 4, delay: 3.0, duration: 7.5, color: '#F5EDE1' },
  { id: 6, top: '20%', left: '60%', size: 3, delay: 2.5, duration: 6, color: '#E0A458' },
  { id: 7, top: '80%', left: '70%', size: 5, delay: 1.5, duration: 9, color: '#7A5C7E' },
  { id: 8, top: '35%', left: '88%', size: 3, delay: 3.5, duration: 7, color: '#E0A458' },
  { id: 9, top: '60%', left: '38%', size: 2, delay: 0.4, duration: 8, color: '#F5EDE1' },
  { id: 10, top: '10%', left: '45%', size: 4, delay: 1.8, duration: 7.2, color: '#C1652F' },
  { id: 11, top: '85%', left: '15%', size: 3, delay: 2.8, duration: 6.8, color: '#E0A458' },
  { id: 12, top: '50%', left: '80%', size: 2, delay: 4.0, duration: 7.8, color: '#F5EDE1' },
];

export default function AmbientParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.75, 0.2],
            scale: [0.85, 1.25, 0.85],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
