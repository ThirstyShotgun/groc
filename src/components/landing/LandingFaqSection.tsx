'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Prepr?',
    answer: 'Prepr is an AI-powered technical interview simulator calibrated to replicate Tier-1 engineering hiring bars (L5/L6). It runs multi-stage scenario drills, scores answers against multi-axis rubrics, and logs performance telemetry.'
  },
  {
    question: 'What roles and disciplines can I practice?',
    answer: 'Prepr covers Frontend, Backend, Full Stack, Cloud Systems, Data/ML, and Technical Product Management across Junior, Mid, Senior, and Staff difficulty tiers.'
  },
  {
    question: 'How does the evaluation rubric work?',
    answer: 'Every response is scored across three dimensions: Domain Knowledge & Technical Depth, Communication & Articulation, and Structure & Trade-off Reasoning. You receive an objective composite score, identified strengths, and a concrete revision tip.'
  },
  {
    question: 'How is Prepr different from prompting ChatGPT?',
    answer: 'ChatGPT provides uncalibrated conversational tips without structure or accountability. Prepr is an automated evaluation environment: sequential 5-stage drills, timer pressure, persistent telemetry in Supabase, and an embedded coach aware of your actual historical scores.'
  },
  {
    question: 'Can I track my score trajectory over time?',
    answer: 'Yes. All completed and in-progress sessions are recorded in your History ledger. You can inspect question transcripts, review weak points, and track streak metrics across interview sessions.'
  },
  {
    question: 'Is Prepr free to practice with?',
    answer: 'Yes. Prepr operates with zero fees. It includes curated question banks and supports high-speed Groq inference for ultra-low latency evaluations.'
  }
];

export default function LandingFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="w-full space-y-6 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#33323C] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C97B4A] block mb-1">
            FAQ // SYSTEM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#EDEBE6] tracking-tight">
            Frequently Addressed Queries.
          </h2>
        </div>
        <p className="text-xs text-[#8B899A] max-w-md font-mono">
          Direct answers regarding calibration criteria, simulator workflows, and architecture.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={item.question}
              className={`rounded-xl border transition-colors ${
                isOpen ? 'bg-[#24232B] border-[#C97B4A]/60' : 'bg-[#1C1B22] border-[#33323C] hover:border-[#8B899A]/50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-[#C97B4A]' : 'text-[#8B899A]'}`} />
                  <span className="text-xs sm:text-sm font-semibold text-[#EDEBE6] tracking-tight">
                    {item.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-[#C97B4A]' : 'text-[#8B899A]'}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-[#8B899A] leading-relaxed border-t border-[#33323C]/50 font-mono">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
