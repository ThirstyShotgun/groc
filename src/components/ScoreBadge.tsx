import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
  hex: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-[#7D9D7C]/15',
      text: 'text-[#7D9D7C]',
      border: 'border-[#7D9D7C]/30',
      label: 'Strong',
      hex: '#7D9D7C',
    };
  } else if (score >= 60) {
    return {
      bg: 'bg-[#C5A265]/15',
      text: 'text-[#C5A265]',
      border: 'border-[#C5A265]/30',
      label: 'Solid',
      hex: '#C5A265',
    };
  } else {
    return {
      bg: 'bg-[#B86B60]/15',
      text: 'text-[#B86B60]',
      border: 'border-[#B86B60]/30',
      label: 'Needs Focus',
      hex: '#B86B60',
    };
  }
}

export default function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  const { bg, text, border, label } = getScoreColor(score);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
    lg: 'text-sm px-4 py-1.5 rounded-full font-semibold',
    xl: 'text-xl px-5 py-2 rounded-full font-bold tracking-tight',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border transition-all ${bg} ${text} ${border} ${sizeClasses} font-mono`}
    >
      <span>{score}/100</span>
      {showLabel && (
        <span className="text-[0.85em] font-normal opacity-80 border-l border-current pl-1.5 ml-0.5">
          {label}
        </span>
      )}
    </span>
  );
}
