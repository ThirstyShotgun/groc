'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[PWA] Service worker registration failed:', err));
    }

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
    const isDismissed = sessionStorage.getItem('prepr_pwa_dismissed') === 'true';

    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setIsIOS(true);
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('prepr_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 p-4 rounded-2xl bg-[#24232B]/95 backdrop-blur-xl border border-[#33323C] shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 font-mono text-xs select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1C1B22] border border-[#33323C] flex items-center justify-center text-xs font-bold text-[#C97B4A] shrink-0">
              P
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#EDEBE6] tracking-tight">
                Install Prepr App
              </h4>
              <p className="text-[10px] text-[#8B899A]">
                {isIOS ? 'Run full-screen from home screen' : 'Instant native app experience'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#8B899A] hover:text-[#EDEBE6] p-1 rounded-md transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {isIOS ? (
          <div className="p-2.5 rounded-lg bg-[#1C1B22] border border-[#33323C] text-[11px] text-[#EDEBE6] flex items-center gap-2">
            <Share className="w-4 h-4 text-[#C97B4A] shrink-0" />
            <span>Tap <strong>Share</strong>, then select <strong>Add to Home Screen</strong>.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-lg bg-[#C97B4A] hover:bg-[#B86B3B] text-[#EDEBE6] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Prepr</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-lg bg-[#1C1B22] hover:bg-[#33323C] border border-[#33323C] text-[#8B899A] hover:text-[#EDEBE6] text-xs transition-colors"
            >
              Later
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
