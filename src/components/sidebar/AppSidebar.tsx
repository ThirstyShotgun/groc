'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  Sliders, 
  Keyboard,
  Gamepad2
} from 'lucide-react';
import { useSidebarStore, sidebarActions } from '@/lib/sidebarStore';

export default function AppSidebar() {
  const isExpanded = useSidebarStore();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col justify-between bg-[#1C1B22]/95 backdrop-blur-xl border-r border-[#33323C] shadow-2xl transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden select-none ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Top Header / Expand Toggle */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#33323C]/70 shrink-0">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-full bg-[#24232B] border border-[#33323C] group-hover:border-[#C97B4A] flex items-center justify-center text-xs font-bold text-[#C97B4A] shrink-0 transition-colors shadow-inner">
            P
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <span className="font-heading text-xs font-bold text-[#EDEBE6] tracking-tight">
                Prepr<span className="text-[#C97B4A]">.</span>
              </span>
              <span className="text-[9px] font-mono text-[#8B899A]">Console Rail</span>
            </motion.div>
          )}
        </Link>

        {/* Toggle Expand / Collapse Button */}
        <button
          type="button"
          onClick={sidebarActions.toggle}
          data-cursor-text={isExpanded ? 'COLLAPSE' : 'EXPAND'}
          className="w-7 h-7 rounded-lg bg-[#24232B] hover:bg-[#33323C] border border-[#33323C] text-[#8B899A] hover:text-[#EDEBE6] flex items-center justify-center transition-colors shrink-0"
          title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Nav / Sections Shell */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 scrollbar-none">
        {/* Section 1: Quick Actions Shell */}
        <div className="space-y-1">
          {isExpanded && (
            <span className="px-2 text-[9px] font-mono text-[#8B899A] uppercase tracking-wider block mb-1">
              Quick Actions
            </span>
          )}
          <Link
            href="/interview"
            data-cursor-text="START"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-[#24232B]/70 hover:bg-[#C97B4A]/15 border border-[#33323C]/80 hover:border-[#C97B4A]/60 text-[#EDEBE6] transition-all group"
            title="New Simulation"
          >
            <PlusCircle className="w-4 h-4 text-[#C97B4A] shrink-0 group-hover:scale-110 transition-transform" />
            {isExpanded && (
              <span className="text-xs font-medium truncate font-mono">New Simulation</span>
            )}
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B] transition-all group"
            title="Continue Last Session"
          >
            <Clock className="w-4 h-4 shrink-0 text-[#8B899A] group-hover:text-[#EDEBE6] transition-colors" />
            {isExpanded && (
              <span className="text-xs truncate font-mono">Continue Session</span>
            )}
          </Link>
          <Link
            href="/#quick-demo"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B] transition-all group"
            title="Quick Demo Question"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-[#8B899A] group-hover:text-[#C97B4A] transition-colors" />
            {isExpanded && (
              <span className="text-xs truncate font-mono">Quick Drill Teaser</span>
            )}
          </Link>
          <Link
            href="/arcade"
            data-cursor-text="ARCADE"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B] transition-all group"
            title="Practice Arcade"
          >
            <Gamepad2 className="w-4 h-4 shrink-0 text-[#C97B4A] group-hover:scale-110 transition-transform" />
            {isExpanded && (
              <span className="text-xs truncate font-mono flex items-center justify-between w-full">
                <span>Practice Arcade</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-[#C97B4A]/20 text-[#C97B4A] font-bold">ARCADE</span>
              </span>
            )}
          </Link>
        </div>

        {/* Section 2: Recent Sessions Shell */}
        <div className="space-y-1 pt-2 border-t border-[#33323C]/50">
          {isExpanded ? (
            <span className="px-2 text-[9px] font-mono text-[#8B899A] uppercase tracking-wider block mb-1">
              Recent Sessions
            </span>
          ) : (
            <div className="w-6 h-0.5 bg-[#33323C] mx-auto my-2" />
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B] transition-all group"
            title="History Ledger"
          >
            <div className="w-2 h-2 rounded-full bg-[#C97B4A] shrink-0" />
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-[#EDEBE6] truncate">Distributed Systems</div>
                <div className="text-[9px] font-mono text-[#8B899A] flex justify-between">
                  <span>88% • L6</span>
                  <span>2h ago</span>
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Bottom Pinned Utilities Shell */}
      <div className="p-2.5 border-t border-[#33323C]/70 space-y-1 bg-[#1C1B22]/60 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#24232B] transition-all group"
          title="Telemetry & Stats"
        >
          <Sliders className="w-4 h-4 shrink-0 text-[#8B899A] group-hover:text-[#EDEBE6] transition-colors" />
          {isExpanded && <span className="text-xs font-mono truncate">Telemetry & Config</span>}
        </Link>
        <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono text-[#8B899A]">
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-[#C97B4A]" />
            {isExpanded && <span>Shortcuts (N, H, /)</span>}
          </span>
          {isExpanded && <span className="text-[9px] text-[#8B899A]/60">v2.4</span>}
        </div>
      </div>
    </aside>
  );
}
