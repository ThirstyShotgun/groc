'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1C1B22] border-t border-[#33323C] text-[#8B899A] text-xs py-10 mt-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#33323C]/60">
          {/* Brand & Tagline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#EDEBE6] font-heading tracking-tight">
                Prepr<span className="text-[#C97B4A]">.</span>
              </span>
              <span className="text-[#33323C]">/</span>
              <span className="text-[11px] font-mono text-[#8B899A] uppercase tracking-wider">
                L5–L7 Simulator
              </span>
            </div>
            <p className="text-xs text-[#8B899A] max-w-sm leading-relaxed">
              Calibrated technical interview simulation & trade-off evaluation for modern engineering teams.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <Link href="/interview" className="text-[#8B899A] hover:text-[#EDEBE6] transition-colors">
              Simulator
            </Link>
            <Link href="/dashboard" className="text-[#8B899A] hover:text-[#EDEBE6] transition-colors">
              History
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B899A] hover:text-[#EDEBE6] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom Credits & Telemetry */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-[#8B899A]/80">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#C97B4A]" />
            <span>Powered by Groq · Built in 24 hours</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Prepr Systems Inc. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
