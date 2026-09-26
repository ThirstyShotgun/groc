'use client';

import React from 'react';
import { useSidebarStore } from '@/lib/sidebarStore';

interface Props {
  children: React.ReactNode;
}

export default function AppLayoutContainer({ children }: Props) {
  const isExpanded = useSidebarStore();

  return (
    <div
      className={`min-h-screen flex flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExpanded ? 'md:pl-60' : 'md:pl-16'
      } pl-0 relative z-10`}
    >
      {children}
    </div>
  );
}
