'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SpotlightCard from '@/components/SpotlightCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface ScoreChartProps {
  data: Array<{ date: string; score: number; role: string }>;
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted || !data || data.length === 0) {
    return (
      <div className="bg-[#24232B] border border-[#33323C] rounded p-8 min-h-[200px] flex flex-col items-center justify-center text-center font-mono">
        <p className="text-xs text-[#8B899A] uppercase tracking-wider mb-1">
          NO EVALUATION RECORDS FOUND
        </p>
        <p className="text-[#8B899A]/70 text-xs max-w-sm mb-3">
          Complete a mock interview to establish your historical score trajectory.
        </p>
        <Link
          href="/interview"
          data-cursor-text="START"
          className="px-4 py-1.5 rounded bg-[#33323C] hover:bg-[#444350] text-[#EDEBE6] text-xs font-mono uppercase tracking-wider transition-colors"
        >
          CALIBRATE BASELINE
        </Link>
      </div>
    );
  }

  return (
    <SpotlightCard cursorText="CHART" className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#33323C] pb-3">
        <div>
          <span className="text-[10px] font-mono text-[#8B899A] uppercase tracking-[0.2em] block">
            HISTORICAL PROGRESSION
          </span>
          <h3 className="text-lg font-bold text-[#EDEBE6] font-heading mt-0.5">
            Score Progression Curve
          </h3>
        </div>
        <div className="text-[11px] font-mono text-[#8B899A]">
          TARGET BENCHMARK: 80% (STAFF BAR)
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreTerracotta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C97B4A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C97B4A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#33323C" />
            <XAxis
              dataKey="date"
              stroke="#8B899A"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
              axisLine={{ stroke: '#33323C' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#8B899A"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
              axisLine={{ stroke: '#33323C' }}
            />
            <ReferenceLine y={80} stroke="#8B899A" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#1C1B22] border border-[#33323C] p-3 rounded shadow-xl text-xs font-mono">
                      <div className="text-[10px] text-[#8B899A] uppercase">{item.date}</div>
                      <div className="font-semibold text-[#EDEBE6] mt-0.5">{item.role}</div>
                      <div className="text-[#C97B4A] font-bold text-sm mt-1">
                        SCORE: {item.score}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#C97B4A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#scoreTerracotta)"
              dot={{ fill: '#C97B4A', stroke: '#1C1B22', strokeWidth: 1.5, r: 3 }}
              activeDot={{ fill: '#EDEBE6', stroke: '#C97B4A', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SpotlightCard>
  );
}
