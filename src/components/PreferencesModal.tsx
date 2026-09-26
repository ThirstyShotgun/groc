'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getPreferences, savePreferences, UserPreferences } from '@/lib/preferences';
import { isSupabaseConfigured } from '@/lib/supabase';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(() => getPreferences());
  const [groqKey, setGroqKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const timer = setTimeout(() => {
        setPrefs(getPreferences());
        setGroqKey(localStorage.getItem('prepr_groq_api_key') || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const updated = savePreferences(updates);
    setPrefs(updated);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (groqKey.trim()) {
        localStorage.setItem('prepr_groq_api_key', groqKey.trim());
      } else {
        localStorage.removeItem('prepr_groq_api_key');
      }
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#24232B] border border-[#33323C] rounded max-w-lg w-full p-6 text-[#EDEBE6] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <button onClick={onClose} className="absolute top-5 right-5 text-[#8B899A] hover:text-[#EDEBE6] p-1" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B899A]">PREFERENCES</span>
          <h2 className="text-xl font-bold font-heading text-[#EDEBE6]">Calibration Settings</h2>
        </div>

        {/* 1. Default Seniority Level */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8B899A]">Default Level</label>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            {[
              { id: 'entry', label: 'L4 Junior/Mid' },
              { id: 'mid', label: 'L5 Senior Lead' },
              { id: 'senior', label: 'L6+ Staff/Princ' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleUpdate({ defaultDifficulty: d.id as UserPreferences['defaultDifficulty'] })}
                className={`p-2 rounded text-left transition-colors border ${
                  prefs.defaultDifficulty === d.id ? 'bg-[#1C1B22] text-[#EDEBE6] border-[#C97B4A]' : 'bg-[#1C1B22] text-[#8B899A] border-[#33323C]'
                }`}
              >
                <div className={`text-[10px] ${prefs.defaultDifficulty === d.id ? 'text-[#C97B4A]' : 'text-[#8B899A]'}`}>{prefs.defaultDifficulty === d.id ? '● ACTIVE' : '○'}</div>
                <div className="font-semibold text-xs truncate">{d.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Timer Toggle & Duration */}
        <div className="space-y-2 pt-2 border-t border-[#33323C]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8B899A]">Pacing Clock Pressure</span>
            <button
              type="button"
              onClick={() => handleUpdate({ timerEnabled: !prefs.timerEnabled })}
              className={`px-3 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                prefs.timerEnabled ? 'bg-[#C97B4A] text-[#EDEBE6] border-[#C97B4A]' : 'bg-[#1C1B22] text-[#8B899A] border-[#33323C]'
              }`}
            >
              {prefs.timerEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {prefs.timerEnabled && (
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleUpdate({ timerSeconds: sec })}
                  className={`py-1 rounded text-center border ${
                    prefs.timerSeconds === sec ? 'bg-[#1C1B22] text-[#EDEBE6] border-[#C97B4A]' : 'bg-[#1C1B22] text-[#8B899A] border-[#33323C]'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. API Key & Supabase Status */}
        <div className="space-y-2 pt-2 border-t border-[#33323C]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8B899A] block">Cloud Engine Config</span>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input
              type="password"
              placeholder="Custom Groq API Key (gsk_...)"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-[#1C1B22] border border-[#33323C] rounded text-[#EDEBE6] placeholder:text-[#8B899A]/40 focus:outline-none focus:border-[#C97B4A] font-mono"
            />
            <button type="submit" className="px-3 py-1.5 text-xs font-mono bg-[#33323C] hover:bg-[#444350] text-[#EDEBE6] rounded flex items-center gap-1">
              {keySaved ? <Check className="w-3.5 h-3.5 text-[#C97B4A]" /> : null}
              {keySaved ? 'SAVED' : 'SAVE'}
            </button>
          </form>
          <div className="flex justify-between text-[10px] font-mono text-[#8B899A]">
            <span>SUPABASE PERSISTENCE</span>
            <span className="text-[#EDEBE6]">{isSupabaseConfigured ? 'CONNECTED' : 'LOCAL CACHE'}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#33323C]">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-mono border border-[#33323C] hover:border-[#8B899A] text-[#EDEBE6] rounded">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
