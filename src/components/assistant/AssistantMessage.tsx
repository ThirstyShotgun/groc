'use client';

import React from 'react';
import { ChatMessage } from '@/lib/assistantStore';

interface Props {
  message: ChatMessage;
}

export default function AssistantMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-[#24232B] border border-[#33323C] flex items-center justify-center text-[10px] font-bold text-[#C97B4A] shrink-0 mt-0.5">
            P
          </div>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-[#24232B] text-[#EDEBE6] border border-[#33323C]/90 rounded-br-xs'
              : 'bg-[#1C1B22]/90 text-[#EDEBE6] border border-[#33323C]/80 rounded-bl-xs'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
