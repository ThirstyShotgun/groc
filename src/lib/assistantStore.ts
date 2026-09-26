'use client';

import { useSyncExternalStore } from 'react';
import { localStorageService } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AssistantState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: "Hi! I'm your Prepr Interview Coach. I have direct access to your practice history and performance metrics. Ask me about interview techniques, tricky questions, or how your recent sessions went.",
  timestamp: Date.now(),
};

let state: AssistantState = {
  isOpen: false,
  isLoading: false,
  messages: [INITIAL_MESSAGE],
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const assistantActions = {
  setIsOpen: (isOpen: boolean) => {
    state = { ...state, isOpen };
    emitChange();
  },
  toggleOpen: () => {
    state = { ...state, isOpen: !state.isOpen };
    emitChange();
  },
  clearHistory: () => {
    state = { ...state, messages: [INITIAL_MESSAGE] };
    emitChange();
  },
  sendMessage: async (content: string, currentPage: string) => {
    if (!content.trim() || state.isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const nextMessages = [...state.messages, userMsg];
    state = { ...state, messages: nextMessages, isLoading: true };
    emitChange();

    try {
      let clientSessions = undefined;
      try {
        clientSessions = localStorageService.getSessions();
      } catch {
        // ignore
      }

      const customGroqKey = typeof window !== 'undefined'
        ? localStorage.getItem('prepr_groq_api_key') || undefined
        : undefined;

      const res = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          current_page: currentPage,
          client_sessions: clientSessions,
          groq_key: customGroqKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: data.message || "I didn't receive a response. Please try again.",
        timestamp: Date.now(),
      };

      state = {
        ...state,
        messages: [...state.messages, assistantMsg],
        isLoading: false,
      };
      emitChange();
    } catch (err) {
      console.error('[Assistant] Message send error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I had trouble connecting to the coaching engine. Please try asking again in a moment.",
        timestamp: Date.now(),
      };
      state = {
        ...state,
        messages: [...state.messages, errorMsg],
        isLoading: false,
      };
      emitChange();
    }
  },
};

export function useAssistantStore() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => state,
    () => state
  );
}
