'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LETTERS = ['P', 'r', 'e', 'p', 'r'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.6,
    rotateX: -45,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 140,
      damping: 12,
    },
  },
};

export default function Typography3D() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="inline-flex items-center justify-center select-none perspective-1000"
    >
      <motion.div
        animate={{
          y: [-4, 4, -4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex items-center tracking-tight"
      >
        {LETTERS.map((letter, idx) => (
          <motion.span
            key={idx}
            variants={letterVariants}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-b from-[#F5EDE1] via-[#F5EDE1] to-[#E0A458] inline-block transform-gpu"
            style={{
              textShadow:
                '0 1px 0 rgba(224, 164, 88, 0.85), 0 2px 0 #C1652F, 0 4px 1px rgba(18, 15, 33, 0.7), 0 8px 18px rgba(18, 15, 33, 0.85), 0 0 35px rgba(224, 164, 88, 0.3)',
            }}
          >
            {letter}
          </motion.span>
        ))}

        {/* Accent dot */}
        <motion.span
          variants={letterVariants}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold font-heading text-[#C1652F] inline-block transform-gpu"
          style={{
            textShadow:
              '0 1px 0 #E0A458, 0 3px 0 #C1652F, 0 0 30px rgba(193, 101, 47, 0.6)',
          }}
        >
          .
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
