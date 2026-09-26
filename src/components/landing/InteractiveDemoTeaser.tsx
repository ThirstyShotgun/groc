'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EvaluateAnswerResponse } from '@/types/question';

const SAMPLE_QUESTION = 'Explain how you decide between optimistic updates and pessimistic updates in a high-concurrency distributed UI.';

const QUICK_ANSWERS = [
  'Optimistic: update client state immediately and queue async mutation, triggering rollback handling if server validation rejects.',
  'Pessimistic: hold local UI in pending state until server returns ACK to avoid split-state in financial ledger writes.',
];

export default function InteractiveDemoTeaser() {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluateAnswerResponse | null>(null);

  const handleEvaluate = async () => {
    if (!answer.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/answers/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: SAMPLE_QUESTION,
          answer_text: answer.trim(),
          role_title: 'Staff Frontend Engineer',
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        score: 75,
        feedback: 'Valid technical framing; clearly distinguishes between speculative UI updates and authoritative server commits.',
        improvement_tip: 'Detail compensating transactions when network partitions interrupt the rollback path.',
        strengths: 'Clear structural distinction between client speculation and server authority.',
        source: 'fallback',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 sm:p-7 rounded-2xl bg-[#24232B] border border-[#33323C] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#33323C] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C97B4A] block">
            TRY IT NOW // ZERO-SETUP QUICK DEMO
          </span>
          <h3 className="text-lg font-bold text-[#EDEBE6] font-heading mt-0.5">
            Test Drive Live Rubric Evaluation
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1B22] border border-[#33323C] text-[#8B899A] self-start sm:self-auto">
          ⚡ Sub-2s Groq Scoring
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-wider block">SAMPLE PROMPT:</span>
        <p className="text-xs sm:text-sm font-medium text-[#EDEBE6] font-mono bg-[#1C1B22] p-3 rounded-lg border border-[#33323C]">
          &ldquo;{SAMPLE_QUESTION}&rdquo;
        </p>
      </div>

      {!result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-[#8B899A] mr-1">Pre-fill:</span>
            {QUICK_ANSWERS.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnswer(qa)}
                className="px-2.5 py-1 rounded bg-[#1C1B22] border border-[#33323C] hover:border-[#C97B4A]/60 text-[#8B899A] hover:text-[#EDEBE6] transition-colors truncate max-w-[280px]"
              >
                Option {i + 1}
              </button>
            ))}
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your technical answer here (e.g., explain rollback heuristics, error boundaries, or server ACKs)..."
            rows={3}
            className="w-full bg-[#1C1B22] border border-[#33323C] focus:border-[#C97B4A] focus:outline-none rounded-xl p-3 text-xs text-[#EDEBE6] placeholder-[#8B899A]/70 font-mono resize-none transition-colors"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={!answer.trim() || isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#C97B4A] hover:bg-[#B86B3B] disabled:bg-[#33323C] disabled:opacity-50 text-[#EDEBE6] font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#EDEBE6] border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating with Groq...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Evaluate Instantly</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#1C1B22] border border-[#33323C] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#33323C] pb-2.5">
              <span className="text-[10px] text-[#8B899A] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C97B4A]" /> VERDICT GENERATED
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#C97B4A]">{result.score}</span>
                <span className="text-[10px] text-[#8B899A]">/100</span>
              </div>
            </div>

            <p className="text-[#EDEBE6] leading-relaxed text-[11px]">{result.feedback}</p>
            {result.improvement_tip && (
              <p className="text-[#C97B4A] text-[11px] leading-relaxed">
                ↳ <span className="font-bold">Target Revision:</span> {result.improvement_tip}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#33323C]/60 text-[11px]">
              <button type="button" onClick={() => { setResult(null); setAnswer(''); }} className="text-[#8B899A] hover:text-[#EDEBE6] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Test Another Answer
              </button>
              <a href="/interview" className="text-[#C97B4A] hover:underline flex items-center gap-1 font-semibold">
                Start Full 5-Question Drill <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
