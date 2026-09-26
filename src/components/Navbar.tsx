'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Menu, X } from 'lucide-react';
import PreferencesModal from './PreferencesModal';
import InteractiveButton from '@/components/ui/InteractiveButton';

export default function Navbar() {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/interview', label: 'Simulator' },
    { href: '/arcade', label: 'Arcade' },
    { href: '/dashboard', label: 'History' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full pt-3 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between px-3 sm:px-4 rounded-full bg-[#1C1B22]/85 backdrop-blur-xl border border-[#33323C]/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-all">
          {/* Brand Monogram & Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 pl-1 group select-none">
            <div className="w-7 h-7 rounded-full bg-[#24232B] border border-[#33323C] group-hover:border-[#C97B4A] flex items-center justify-center text-xs font-bold text-[#C97B4A] transition-colors shadow-inner">
              P
            </div>
            <span className="font-heading text-sm font-bold tracking-tight text-[#EDEBE6]">
              Prepr<span className="text-[#C97B4A]">.</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#24232B] border border-[#33323C] text-[9px] font-mono text-[#8B899A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-pulse" />
              L6 Engine
            </span>
          </Link>

          {/* Desktop Nav - Segmented Capsule Pill with Spring Slider */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#24232B]/70 border border-[#33323C]/60 text-xs font-mono">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
                    isActive ? 'text-[#EDEBE6] font-semibold' : 'text-[#8B899A] hover:text-[#EDEBE6]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-[#33323C] shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-2.5">
            <InteractiveButton
              variant="icon"
              onClick={() => setIsConfigOpen(true)}
              data-cursor-text="CONFIG"
              className="rounded-full w-8 h-8 p-0"
              title="System Configuration"
              aria-label="Configuration Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </InteractiveButton>

            <InteractiveButton
              href="/interview"
              variant="primary"
              data-cursor-text="START"
              className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
            >
              Start Interview
            </InteractiveButton>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#24232B] border border-[#33323C] text-[#8B899A] active:scale-95 transition-transform"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#24232B] border border-[#33323C] text-[#EDEBE6] active:scale-95 transition-transform"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 max-w-4xl mx-auto px-4 py-3 rounded-2xl bg-[#1C1B22]/95 backdrop-blur-xl border border-[#33323C] shadow-2xl space-y-1 font-mono text-xs pointer-events-auto"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#24232B] text-[#EDEBE6] font-semibold border border-[#33323C]'
                        : 'text-[#8B899A] hover:text-[#EDEBE6]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 px-4 rounded-lg font-semibold text-xs bg-[#C97B4A] text-[#EDEBE6] mt-2 shadow"
              >
                Start Interview
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <PreferencesModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
