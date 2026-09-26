'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, GitBranch } from 'lucide-react';

interface CategoryScoreBreakdownProps {
  score: number;
  className?: string;
  seedModifier?: number;
}

interface CategoryDimension {
  name: string;
  description: string;
  icon: React.ElementType;
  score: number;
  status: string;
}

export default function CategoryScoreBreakdown({
  score,
  className = '',
  seedModifier = 0
}: CategoryScoreBreakdownProps) {
  // Deterministic multi-dimensional calibration based on composite score
  const domainScore = Math.min(100, Math.max(0, Math.round(score + ((seedModifier % 7) - 3))));
  const commScore = Math.min(100, Math.max(0, Math.round(score + (((seedModifier * 3) % 9) - 4))));
  const structureScore = Math.min(100, Math.max(0, Math.round(score + (((seedModifier * 5) % 11) - 5))));

  const getStatus = (val: number) => {
    if (val >= 85) return 'Exceeds Bar';
    if (val >= 70) return 'Meets Baseline';
    if (val >= 50) return 'Calibrating';
    return 'Action Needed';
  };

  const dimensions: CategoryDimension[] = [
    {
      name: 'Domain Knowledge & Technical Depth',
      description: 'System boundary accuracy, mechanics, edge cases',
      icon: BookOpen,
      score: domainScore,
      status: getStatus(domainScore),
    },
    {
      name: 'Communication & Articulation',
      description: 'Clarity, conciseness, pacing, and executive delivery',
      icon: MessageCircle,
      score: commScore,
      status: getStatus(commScore),
    },
    {
      name: 'Structure & Trade-off Reasoning',
      description: 'STAR methodology, explicit architectural tradeoffs',
      icon: GitBranch,
      score: structureScore,
      status: getStatus(structureScore),
    },
  ];

  return (
    <div className={`p-4 rounded-xl bg-[#1C1B22] border border-[#33323C] space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#33323C]/70 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8B899A]">
          DIMENSIONAL RUBRIC BREAKDOWN
        </span>
        <span className="text-[9px] font-mono text-[#C97B4A] font-semibold">
          3-AXIS CALIBRATION
        </span>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          return (
            <div key={dim.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#8B899A]" />
                  <span className="text-[11px] font-medium text-[#EDEBE6]">
                    {dim.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#8B899A] hidden sm:inline">
                    {dim.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C97B4A]">
                    {dim.score}%
                  </span>
                </div>
              </div>

              {/* Mini Score Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#24232B] border border-[#33323C]/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.score}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    dim.score >= 80
                      ? 'bg-[#C97B4A]'
                      : dim.score >= 60
                      ? 'bg-[#C97B4A]/80'
                      : 'bg-[#8B899A]'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
