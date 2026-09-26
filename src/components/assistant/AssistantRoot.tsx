'use client';

import React, { useSyncExternalStore } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAssistantStore } from '@/lib/assistantStore';
import AssistantFAB from './AssistantFAB';
import AssistantPanel from './AssistantPanel';

const noopSubscribe = () => () => {};

export default function AssistantRoot() {
  const { isOpen } = useAssistantStore();
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  if (!isClient) return null;

  return (
    <div className="relative z-50">
      <AssistantFAB />
      <AnimatePresence>
        {isOpen && <AssistantPanel key="assistant-panel" />}
      </AnimatePresence>
    </div>
  );
}
