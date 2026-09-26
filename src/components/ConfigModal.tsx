'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PREPR_SQL_SCHEMA } from '@/lib/schema-sql';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const [groqKey, setGroqKey] = useState('');
  const [savedGroqKey, setSavedGroqKey] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const timer = setTimeout(() => {
        const stored = localStorage.getItem('prepr_groq_api_key');
        if (stored) {
          setSavedGroqKey(stored);
          setGroqKey(stored);
        }
        setSupabaseActive(isSupabaseConfigured);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSaveGroq = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (groqKey.trim()) {
        localStorage.setItem('prepr_groq_api_key', groqKey.trim());
        setSavedGroqKey(groqKey.trim());
      } else {
        localStorage.removeItem('prepr_groq_api_key');
        setSavedGroqKey(null);
      }
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(PREPR_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#24232B] border border-[#33323C] rounded max-w-lg w-full p-6 text-[#EDEBE6] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-[#8B899A] hover:text-[#EDEBE6] transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B899A]">CONFIGURATION</span>
          <h2 className="text-xl font-bold font-heading text-[#EDEBE6]">System Connections</h2>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#EDEBE6]">Groq Llama-3.3</span>
              <span className="text-[#EDEBE6] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#33323C]">READY</span>
            </div>
            <p className="text-[11px] text-[#8B899A]">{savedGroqKey ? 'Client key active' : 'Server fallback'}</p>
          </div>

          <div className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#EDEBE6]">Supabase</span>
              <span className="text-[#EDEBE6] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#33323C]">{supabaseActive ? 'CONNECTED' : 'LOCAL'}</span>
            </div>
            <p className="text-[11px] text-[#8B899A]">{supabaseActive ? 'PostgreSQL remote' : 'Local storage buffer'}</p>
          </div>
        </div>

        {/* Custom Groq Key input */}
        <div className="mb-6 p-4 rounded bg-[#1C1B22] border border-[#33323C] space-y-2">
          <h3 className="text-xs font-semibold text-[#EDEBE6] font-mono uppercase tracking-wider">Custom Groq API Key</h3>
          <p className="text-[11px] text-[#8B899A]">Optionally provide your personal key for higher rate limits.</p>
          <form onSubmit={handleSaveGroq} className="flex gap-2 pt-1">
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-[#24232B] border border-[#33323C] rounded text-[#EDEBE6] placeholder:text-[#8B899A]/40 focus:outline-none focus:border-[#C97B4A]"
            />
            <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-[#EDEBE6] rounded transition-colors">
              Save
            </button>
          </form>
        </div>

        {/* Supabase SQL schema copy */}
        <div className="p-4 rounded bg-[#1C1B22] border border-[#33323C] mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#EDEBE6] font-mono uppercase tracking-wider">Supabase Schema</h3>
            <p className="text-[11px] text-[#8B899A]">RLS policies for sessions &amp; questions.</p>
          </div>
          <button onClick={copySql} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#33323C] hover:border-[#8B899A] rounded transition-colors text-[#EDEBE6]">
            {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSchema ? 'COPIED' : 'COPY SQL'}</span>
          </button>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] rounded transition-colors">
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
