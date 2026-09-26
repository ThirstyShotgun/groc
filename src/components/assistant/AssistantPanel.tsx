'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { X, Send, RotateCcw, Sparkles } from 'lucide-react';
import { useAssistantStore, assistantActions } from '@/lib/assistantStore';
import AssistantMessage from './AssistantMessage';

const QUICK_PROMPTS = [
  'How did my last session go?',
  'What is my weakest area?',
  'Tips for behavioral questions',
  'What role have I practiced most?',
];

export default function AssistantPanel() {
  const pathname = usePathname();
  const { messages, isLoading } = useAssistantStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    assistantActions.sendMessage(text, pathname);
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    assistantActions.sendMessage(prompt, pathname);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-22 right-4 sm:right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl bg-[#1C1B22]/95 backdrop-blur-xl border border-[#33323C] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden pointer-events-auto"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#33323C] bg-[#24232B]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#24232B] border border-[#33323C] flex items-center justify-center text-xs font-bold text-[#C97B4A]">
            P
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#EDEBE6] tracking-tight flex items-center gap-1.5">
              Prepr Coach
              <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-pulse" />
            </h3>
            <p className="text-[10px] font-mono text-[#8B899A]">Session Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={assistantActions.clearHistory}
            className="p-1.5 rounded-lg text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#33323C]/50 transition-colors"
            title="Reset Conversation"
            aria-label="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => assistantActions.setIsOpen(false)}
            className="p-1.5 rounded-lg text-[#8B899A] hover:text-[#EDEBE6] hover:bg-[#33323C]/50 transition-colors"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message History & Prompt Chips */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs scrollbar-thin scrollbar-thumb-[#33323C]">
        {messages.map((m) => (
          <AssistantMessage key={m.id} message={m} />
        ))}

        {/* Quick prompt chips on new session */}
        {messages.length <= 1 && (
          <div className="pt-2 pb-1 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8B899A] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C97B4A]" /> Suggested Questions:
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="text-left px-3 py-2 rounded-xl bg-[#24232B] hover:bg-[#33323C]/70 border border-[#33323C] text-[11px] text-[#EDEBE6] hover:border-[#C97B4A]/60 transition-all duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#8B899A] py-1 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-bounce" />
            <span className="text-[10px] font-mono ml-1 text-[#8B899A]">Analyzing records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#33323C] bg-[#24232B]/50 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask coach anything..."
          disabled={isLoading}
          className="flex-1 bg-[#1C1B22] border border-[#33323C] focus:border-[#C97B4A] focus:outline-none rounded-xl px-3 py-2 text-xs text-[#EDEBE6] placeholder-[#8B899A] disabled:opacity-60 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-xl bg-[#C97B4A] hover:bg-[#B86B3B] disabled:bg-[#33323C] disabled:opacity-50 text-[#EDEBE6] flex items-center justify-center transition-colors shrink-0"
          aria-label="Send Message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </motion.div>
  );
}
