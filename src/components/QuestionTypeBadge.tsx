'use client';

import React from 'react';

interface QuestionTypeBadgeProps {
  type?: string;
  size?: 'sm' | 'md';
}

export const QuestionTypeBadge: React.FC<QuestionTypeBadgeProps> = ({
  type = 'Technical',
  size = 'md'
}) => {
  const normalized = (type || 'Technical').toLowerCase();

  let label = 'TECHNICAL';
  if (normalized.includes('behavior')) {
    label = 'BEHAVIORAL';
  } else if (normalized.includes('situation') || normalized.includes('scenario')) {
    label = 'SITUATIONAL';
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded bg-[#1C1B22] text-[#EDEBE6] border border-[#33323C] uppercase tracking-wider ${sizeClasses}`}
      title={`${label} interview rubric`}
    >
      [{label}]
    </span>
  );
};
