'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useAssistantStore, assistantActions } from '@/lib/assistantStore';

export default function AssistantFAB() {
  const { isOpen, isLoading } = useAssistantStore();

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 pointer-events-auto"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <button
        type="button"
        onClick={assistantActions.toggleOpen}
        data-cursor-text={isOpen ? 'CLOSE' : 'COACH'}
        className={`group relative flex items-center gap-2 h-12 rounded-full transition-all duration-300 shadow-[0_8px_30px_rgba(201,123,74,0.3)] focus:outline-none focus:ring-2 focus:ring-[#C97B4A] focus:ring-offset-2 focus:ring-offset-[#1C1B22] ${
          isOpen
            ? 'px-3.5 bg-[#24232B] border border-[#33323C] text-[#EDEBE6] hover:border-[#C97B4A]'
            : 'px-3.5 bg-[#1C1B22] border border-[#C97B4A]/80 text-[#EDEBE6] hover:border-[#C97B4A]'
        }`}
        aria-label={isOpen ? 'Close Assistant' : 'Open Interview Assistant'}
        title={isOpen ? 'Close Assistant' : 'Open Interview Assistant'}
      >
        {/* Subtle breathing idle glow */}
        {!isOpen && (
          <motion.span
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-0.5 rounded-full bg-[#C97B4A]/30 blur-sm pointer-events-none"
          />
        )}

        {/* Live amber pulse beacon */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C97B4A] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C97B4A] border-2 border-[#1C1B22]" />
          </span>
        )}

        {/* Custom Geometric Brand Glyph */}
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="w-4 h-4 text-[#EDEBE6]" />
          ) : isLoading ? (
            <Sparkles className="w-4 h-4 animate-pulse text-[#C97B4A]" />
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#C97B4A]">
              <svg className="w-4 h-4 text-[#C97B4A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
          )}
        </div>

        {/* Dynamic Coach Label */}
        <span className="relative z-10 text-[11px] font-mono font-semibold tracking-wide text-[#EDEBE6] group-hover:text-[#C97B4A] transition-colors">
          {isOpen ? 'Close' : 'AI Coach'}
        </span>
      </button>
    </motion.div>
  );
}
