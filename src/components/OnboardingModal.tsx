'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    step: '01',
    title: 'Target Role Calibration',
    desc: 'Select a pre-calibrated seniority track or input your specific role to generate five tailored, multifaceted prompts.'
  },
  {
    step: '02',
    title: 'Pacing & STAR Delivery',
    desc: 'Answer under a realistic 90-second clock. Focus on concrete trade-offs, architecture decisions, and quantifiable results.'
  },
  {
    step: '03',
    title: 'Committee Rubric Scoring',
    desc: 'Receive immediate 0-100 scores powered by Groq Llama-3.3-70B with itemized strengths and actionable calibration notes.'
  }
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('prepr_onboarded');
      if (!onboarded) {
        const timer = setTimeout(() => setIsOpen(true), 300);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepr_onboarded', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#24232B] border border-[#33323C] rounded max-w-xl w-full p-6 sm:p-8 text-[#EDEBE6] shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-[#8B899A] hover:text-[#EDEBE6] transition-colors p-1"
          aria-label="Close onboarding modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">
            FIRST TIME VISITOR BRIEFING
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#EDEBE6]">
            How Prepr Evaluates You
          </h2>
          <p className="text-xs text-[#8B899A]">
            A 3-step walkthrough to get the highest signal from your mock sessions.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="space-y-3 mb-6">
          {ONBOARDING_STEPS.map((s) => (
            <div
              key={s.step}
              className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] flex items-start gap-4"
            >
              <span className="text-lg font-black font-mono text-[#C97B4A] shrink-0 leading-none mt-0.5">
                {s.step}
              </span>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#EDEBE6] font-heading">
                  {s.title}
                </h3>
                <p className="text-xs text-[#8B899A] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#33323C]">
          <span className="text-[10px] font-mono text-[#8B899A]">
            STORED LOCALLY • WON&apos;T SHOW AGAIN
          </span>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-[#EDEBE6] font-mono font-medium text-xs flex items-center gap-2 transition-colors uppercase tracking-wider"
          >
            <span>START PREPARING</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
