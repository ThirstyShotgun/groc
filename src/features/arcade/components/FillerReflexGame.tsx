'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles, 
  HelpCircle,
  Trophy,
  Zap,
  Volume2
} from 'lucide-react';
import ArcadeTimerRing from './ArcadeTimerRing';
import FillerHighlightEditor from './FillerHighlightEditor';
import FillerResultsCard from './FillerResultsCard';
import InteractiveButton from '@/components/ui/InteractiveButton';
import { calculateFillerStats } from '@/lib/arcade-filler';
import { saveArcadeScore, fetchPersonalBests } from '@/lib/arcade-service';
import { ArcadeScoreRecord, FillerStats } from '@/types/arcade';

interface FillerReflexGameProps {
  onBackToHub: () => void;
}

type GameStage = 'idle' | 'playing' | 'results';

const PROMPT_SUGGESTIONS = [
  'Describe a complex bug or system failure you investigated and resolved.',
  'Explain how your team coordinates deployments and prevents regression outages.',
  'Walk through your core responsibilities and technical priorities in your last role.',
  'Discuss an architectural trade-off you advocated for despite skepticism.',
];

export default function FillerReflexGame({ onBackToHub }: FillerReflexGameProps) {
  const [stage, setStage] = useState<GameStage>('idle');
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [promptIdea, setPromptIdea] = useState(PROMPT_SUGGESTIONS[0]);

  // Telemetry & Results
  const [finalStats, setFinalStats] = useState<FillerStats>({
    totalWords: 0,
    fillerCount: 0,
    fillerPercentage: 0,
    breakdown: {},
    detectedList: [],
  });
  const [groqTip, setGroqTip] = useState('');
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [history, setHistory] = useState<ArcadeScoreRecord[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  // Live stats while typing
  const liveStats = calculateFillerStats(text);

  // Load personal best on mount
  useEffect(() => {
    let isMounted = true;
    fetchPersonalBests().then((pb) => {
      if (isMounted) {
        setPersonalBest(pb.fillerReflexBest);
        setHistory(pb.fillerHistory);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const finishGame = useCallback(async (currentText: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const stats = calculateFillerStats(currentText);
    setFinalStats(stats);
    setStage('results');
    setIsTipLoading(true);

    // Check if new personal best (lowest filler percentage)
    // Only count if user typed at least 5 words to prevent 0-word game exploits
    const isEligibleForRecord = stats.totalWords >= 5;
    const isBetter =
      isEligibleForRecord &&
      (personalBest === null || stats.fillerPercentage < personalBest);

    if (isBetter) {
      setIsNewBest(true);
      setPersonalBest(stats.fillerPercentage);
    } else {
      setIsNewBest(false);
    }

    // Persist to Supabase / localStorage
    saveArcadeScore({
      game_type: 'filler_reflex',
      score_value: stats.fillerPercentage,
      metadata: {
        filler_count: stats.fillerCount,
        total_words: stats.totalWords,
        breakdown: stats.breakdown,
      },
    }).then((savedRecord) => {
      setHistory((prev) => [savedRecord, ...prev.filter((r) => r.id !== savedRecord.id)]);
    });

    // Request Groq coaching tip
    try {
      const res = await fetch('/api/arcade/filler-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          fillerStats: stats,
        }),
      });
      const data = await res.json();
      if (data?.tip) {
        setGroqTip(data.tip);
      } else {
        setGroqTip('Practice holding a full second of silence between statements to ground your executive presence.');
      }
    } catch {
      setGroqTip('Practice deliberate pauses to anchor your verbal clarity.');
    } finally {
      setIsTipLoading(false);
    }
  }, [personalBest]);

  // Start game countdown
  const startGame = () => {
    setText('');
    setTimeLeft(60);
    setStage('playing');
    setIsNewBest(false);
    setGroqTip('');

    // Rotate prompt suggestion
    const nextPrompt =
      PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
    setPromptIdea(nextPrompt);
  };

  // Timer loop
  useEffect(() => {
    if (stage !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // End game with latest text
          finishGame(text);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, text, finishGame]);

  // Play again cleanly
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setText('');
    setTimeLeft(60);
    setStage('idle');
    setIsNewBest(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#33323C] pb-3 text-[10px] font-mono text-[#8B899A]">
        <button
          type="button"
          onClick={onBackToHub}
          className="flex items-center gap-1.5 hover:text-[#EDEBE6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C97B4A]" />
          <span>ARCADE HUB</span>
          <span className="text-[#33323C]">/</span>
          <span className="text-[#EDEBE6] font-bold">GAME 1: FILLER WORD REFLEX</span>
        </button>

        <div className="flex items-center gap-3">
          {personalBest !== null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#24232B] border border-[#33323C] text-[#EDEBE6]">
              <Trophy className="w-3 h-3 text-[#C97B4A]" />
              <span>BEST: {personalBest}%</span>
            </span>
          )}
          <span className="hidden sm:inline text-[#8B899A]">60-SECOND MICRO-DRILL</span>
        </div>
      </div>

      {/* IDLE STAGE: Landing Card to Start */}
      {stage === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-[#24232B] border border-[#33323C] rounded p-6 sm:p-10 space-y-6 relative overflow-hidden"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#C97B4A]">
              <Zap className="w-3.5 h-3.5" />
              <span>SPEECH HABIT ACCELERATOR</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black text-[#EDEBE6] tracking-tight">
              Filler Word Reflex
            </h1>
            <p className="text-xs sm:text-sm text-[#8B899A] max-w-2xl leading-relaxed">
              When the timer starts, speak or type freely about your technical background, past projects, or system decisions. Our client-side engine live-highlights filler words (<em className="text-[#C97B4A] not-italic">um, like, actually, basically, you know, literally</em>) the instant they appear.
            </p>
          </div>

          {/* Quick Rules Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] space-y-1">
              <div className="text-[10px] text-[#C97B4A] uppercase font-bold">01 • CLOCK</div>
              <div className="text-[#EDEBE6] font-semibold">Strict 60 Seconds</div>
              <div className="text-[10px] text-[#8B899A]">Countdown with urgency pulse in final 10s</div>
            </div>
            <div className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] space-y-1">
              <div className="text-[10px] text-[#C97B4A] uppercase font-bold">02 • REAL-TIME HIGHLIGHTS</div>
              <div className="text-[#EDEBE6] font-semibold">Zero-Latency Matching</div>
              <div className="text-[10px] text-[#8B899A]">Live terracotta highlights as you type or dictate</div>
            </div>
            <div className="p-3.5 rounded bg-[#1C1B22] border border-[#33323C] space-y-1">
              <div className="text-[10px] text-[#C97B4A] uppercase font-bold">03 • AI REVEAL</div>
              <div className="text-[#EDEBE6] font-semibold">Groq Coaching Tip</div>
              <div className="text-[10px] text-[#8B899A]">Personalized verbal replacement drill + best tracking</div>
            </div>
          </div>

          {/* Suggested Starter Prompt */}
          <div className="p-3.5 rounded bg-[#1C1B22]/70 border border-[#33323C] text-xs font-mono space-y-1.5">
            <div className="text-[10px] uppercase text-[#8B899A] flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3 text-[#C97B4A]" />
              <span>Recommended Drill Topic:</span>
            </div>
            <div className="text-[#EDEBE6] italic">
              &ldquo;{promptIdea}&rdquo;
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <InteractiveButton
              variant="primary"
              onClick={startGame}
              data-cursor-text="PLAY"
              className="px-8 py-3 rounded text-sm font-semibold tracking-wide flex items-center gap-2 shadow-[0_0_24px_rgba(201,123,74,0.35)] hover:shadow-[0_0_32px_rgba(201,123,74,0.5)]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 60s Drill</span>
            </InteractiveButton>

            <span className="text-[11px] font-mono text-[#8B899A]">
              Keyboard input and voice microphone dictation supported
            </span>
          </div>
        </motion.div>
      )}

      {/* PLAYING STAGE: Active 60s Drill */}
      {stage === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#24232B] border border-[#33323C] rounded p-5 sm:p-7 space-y-5 shadow-2xl relative"
        >
          {/* Top Active Bar: Prompt & Prominent Countdown Ring */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#33323C] pb-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#C97B4A]">
                <span className="w-2 h-2 rounded-full bg-[#C97B4A] animate-ping" />
                <span>DRILL IN PROGRESS</span>
              </div>
              <p className="font-heading text-sm sm:text-base font-semibold text-[#EDEBE6]">
                Speak or type freely about your last job or project — we&apos;re tracking filler words in real time.
              </p>
              <p className="text-[11px] font-mono text-[#8B899A]">
                Prompt idea: &ldquo;{promptIdea}&rdquo;
              </p>
            </div>

            {/* Circular Timer Ring */}
            <div className="flex items-center justify-center shrink-0">
              <ArcadeTimerRing timeLeft={timeLeft} totalTime={60} size={84} strokeWidth={6} />
            </div>
          </div>

          {/* Interactive Highlight Editor */}
          <FillerHighlightEditor
            value={text}
            onChange={setText}
            stats={liveStats}
            disabled={timeLeft <= 0}
            autoFocus
          />

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={resetGame}
              className="text-[11px] font-mono text-[#8B899A] hover:text-[#EDEBE6] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Abort & Reset</span>
            </button>

            <button
              type="button"
              onClick={() => finishGame(text)}
              className="px-4 py-1.5 rounded bg-[#1C1B22] hover:bg-[#33323C] border border-[#33323C] text-[#EDEBE6] text-xs font-mono transition-colors"
            >
              Finish Early & Score
            </button>
          </div>
        </motion.div>
      )}

      {/* RESULTS STAGE */}
      {stage === 'results' && (
        <FillerResultsCard
          stats={finalStats}
          tip={groqTip}
          isTipLoading={isTipLoading}
          personalBest={personalBest}
          history={history}
          isNewBest={isNewBest}
          onPlayAgain={startGame}
          onBackToArcade={onBackToHub}
        />
      )}
    </div>
  );
}
