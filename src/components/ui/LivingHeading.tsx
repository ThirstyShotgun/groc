'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LivingHeadingProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  accentWord?: string;
}

export default function LivingHeading({
  children,
  className = '',
  as: Component = 'h1',
  accentWord,
}: LivingHeadingProps) {
  const words = children.split(' ');

  return (
    <Component className={`font-heading tracking-tight ${className}`}>
      {words.map((word, i) => {
        const isAccent = accentWord && word.toLowerCase().includes(accentWord.toLowerCase());

        return (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block mr-[0.25em] will-change-transform select-none"
            whileHover={{
              y: -2,
              scale: 1.04,
              color: isAccent ? '#E0A458' : '#FFFFFF',
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 18,
            }}
          >
            <span className={isAccent ? 'text-[#C97B4A]' : 'text-[#EDEBE6]'}>
              {word}
            </span>
          </motion.span>
        );
      })}
    </Component>
  );
}
