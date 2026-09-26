'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  roleTitle: string;
  setRoleTitle: (role: string) => void;
  difficulty: string;
  setDifficulty: (level: string) => void;
}

const POPULAR_ROLES = [
  { track: 'ENG', title: 'Senior Frontend Engineer' },
  { track: 'ARCH', title: 'Distributed Systems Architect' },
  { track: 'SYS', title: 'Full Stack Systems Lead' },
  { track: 'PROD', title: 'Technical Product Manager' },
  { track: 'ML', title: 'Machine Learning Engineer' },
];

const DIFFICULTIES = [
  { id: 'entry', level: 'L4', label: 'Junior / Mid' },
  { id: 'mid', level: 'L5', label: 'Senior Lead' },
  { id: 'senior', level: 'L6+', label: 'Staff / Principal' },
];

export default function BenchmarkTrackPicker({
  roleTitle,
  setRoleTitle,
  difficulty,
  setDifficulty,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Quick Track Selection */}
      <div>
        <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block mb-2">
          Calibrated Benchmark Tracks
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROLES.map((r) => {
            const isSelected = roleTitle === r.title;
            return (
              <motion.button
                key={r.title}
                type="button"
                whileHover={{ y: -1, scale: isSelected ? 1.02 : 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRoleTitle(r.title)}
                className={`text-xs px-3 py-2 min-h-[40px] sm:min-h-[36px] rounded-lg transition-all duration-200 font-mono text-left relative flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#C97B4A] text-[#EDEBE6] font-semibold scale-[1.02] shadow-[0_0_14px_rgba(201,123,74,0.35)] border border-transparent'
                    : 'bg-[#24232B] text-[#8B899A] border border-[#33323C] hover:border-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B]/80'
                }`}
              >
                {isSelected && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3 h-3 text-[#EDEBE6]" />
                  </motion.span>
                )}
                <span className={`text-[10px] ${isSelected ? 'text-[#EDEBE6]/80' : 'text-[#8B899A]'}`}>
                  [{r.track}]
                </span>
                <span>{r.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Calibrated Seniority Tier */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A] mb-2">
          Target Seniority Level
        </label>
        <div className="grid grid-cols-3 gap-2.5 font-mono">
          {DIFFICULTIES.map((d) => {
            const isSelected = difficulty === d.id;
            return (
              <motion.button
                key={d.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDifficulty(d.id)}
                className={`p-3 rounded-xl text-left transition-all duration-200 border relative ${
                  isSelected
                    ? 'bg-[#24232B] text-[#EDEBE6] border-[#C97B4A] shadow-[0_0_16px_rgba(201,123,74,0.22)]'
                    : 'bg-[#1C1B22] text-[#8B899A] border-[#33323C] hover:border-[#8B899A]/60 hover:text-[#EDEBE6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-[#C97B4A]' : 'text-[#8B899A]'}`}>
                    {d.level}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-semibold mt-1 tracking-tight">{d.label}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
