'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, Sparkles } from 'lucide-react';
import { tokenizeWithFillers } from '@/lib/arcade-filler';
import { FillerStats } from '@/types/arcade';

interface FillerHighlightEditorProps {
  value: string;
  onChange: (val: string) => void;
  stats: FillerStats;
  disabled?: boolean;
  autoFocus?: boolean;
}

// Window speech recognition typings
interface IWindow extends Window {
  webkitSpeechRecognition?: unknown;
  SpeechRecognition?: unknown;
}

export default function FillerHighlightEditor({
  value,
  onChange,
  stats,
  disabled = false,
  autoFocus = true,
}: FillerHighlightEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync scroll between textarea and backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Speech Recognition initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        onChange(transcript.trim());
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [onChange]);

  const toggleSpeech = useCallback(() => {
    if (!recognitionRef.current || disabled) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening, disabled]);

  // Tokenize text for real-time backdrop highlights
  const tokens = tokenizeWithFillers(value);

  return (
    <div className="space-y-3">
      {/* Live Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-lg bg-[#1C1B22] border border-[#33323C] text-xs font-mono">
        <div className="flex items-center gap-3">
          {/* Running Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#8B899A]">Caught:</span>
            <motion.span
              key={stats.fillerCount}
              initial={{ scale: 1.3, color: '#FFFFFF' }}
              animate={{ scale: 1, color: stats.fillerCount > 0 ? '#C97B4A' : '#EDEBE6' }}
              transition={{ duration: 0.2 }}
              className="font-bold text-sm px-1.5 py-0.2 rounded bg-[#C97B4A]/15 border border-[#C97B4A]/30"
            >
              {stats.fillerCount}
            </motion.span>
          </div>

          <span className="text-[#33323C]">•</span>

          {/* Word Count */}
          <div className="text-[11px] text-[#8B899A]">
            Words: <span className="text-[#EDEBE6] font-semibold">{stats.totalWords}</span>
          </div>

          <span className="text-[#33323C]">•</span>

          {/* Real-time Filler Density */}
          <div className="text-[11px] text-[#8B899A]">
            Density:{' '}
            <span
              className={`font-semibold ${
                stats.fillerPercentage > 5
                  ? 'text-[#EF4444]'
                  : stats.fillerPercentage > 2.5
                  ? 'text-[#C97B4A]'
                  : 'text-[#EDEBE6]'
              }`}
            >
              {stats.fillerPercentage}%
            </span>
          </div>
        </div>

        {/* Speech-to-Text Button (Optional Voice Dictation) */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleSpeech}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-all ${
              isListening
                ? 'bg-[#C97B4A] text-[#EDEBE6] animate-pulse shadow-[0_0_12px_rgba(201,123,74,0.4)]'
                : 'bg-[#24232B] hover:bg-[#33323C] text-[#8B899A] hover:text-[#EDEBE6] border border-[#33323C]'
            }`}
            title={isListening ? 'Stop microphone dictation' : 'Start speaking aloud via microphone'}
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
          </button>
        )}
      </div>

      {/* Editor Surface Container with Overlay Layer */}
      <div className="relative rounded-lg bg-[#1C1B22] border border-[#33323C] focus-within:border-[#C97B4A] transition-colors shadow-inner overflow-hidden min-h-[220px]">
        {/* Backdrop Highlight Layer (Identical metrics to textarea) */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-y-auto select-none text-transparent"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            lineHeight: '1.625',
          }}
        >
          {tokens.map((token, i) =>
            token.isFiller ? (
              <mark
                key={i}
                className="bg-[#C97B4A]/30 text-transparent border-b-2 border-[#C97B4A] rounded-xs font-semibold px-0.5"
              >
                {token.text}
              </mark>
            ) : (
              <span key={i}>{token.text}</span>
            )
          )}
          {/* Add a trailing space to match textarea scroll height */}
          <span> </span>
        </div>

        {/* Interactive Textarea Foreground */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder="Speak/type freely about your last job or project — we're tracking filler words in real time..."
          rows={7}
          className="relative z-10 w-full h-full p-4 font-mono text-sm leading-relaxed text-[#EDEBE6] placeholder-[#8B899A]/40 bg-transparent resize-y focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            lineHeight: '1.625',
          }}
        />
      </div>

      {/* Live Caught Pill Cloud / Prompt Helper */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8B899A]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase text-[#8B899A]/70">Detected instances:</span>
          {stats.detectedList.length === 0 ? (
            <span className="text-[#8B899A]/50 italic">None yet — keep speaking cleanly</span>
          ) : (
            <AnimatePresence>
              {stats.detectedList.map((item) => (
                <motion.span
                  key={item.word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C97B4A]/15 border border-[#C97B4A]/40 text-[#EDEBE6] text-[10px]"
                >
                  <span className="font-semibold text-[#C97B4A]">{item.word}</span>
                  <span className="text-[#8B899A]">×{item.count}</span>
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="text-[10px] text-[#8B899A]/60 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C97B4A]" />
          <span>Terracotta marks highlight active filler tokens</span>
        </div>
      </div>
    </div>
  );
}
