'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'prepr_sidebar_expanded';

let isExpanded = false;

// Initialize from localStorage if on client
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      isExpanded = saved === 'true';
    }
  } catch {
    // Ignore storage errors
  }
}

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const sidebarActions = {
  toggle: () => {
    isExpanded = !isExpanded;
    try {
      localStorage.setItem(STORAGE_KEY, String(isExpanded));
    } catch {
      // Ignore storage errors
    }
    emitChange();
  },
  setExpanded: (val: boolean) => {
    isExpanded = val;
    try {
      localStorage.setItem(STORAGE_KEY, String(isExpanded));
    } catch {
      // Ignore storage errors
    }
    emitChange();
  },
};

export function useSidebarStore() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => isExpanded,
    () => false
  );
}
