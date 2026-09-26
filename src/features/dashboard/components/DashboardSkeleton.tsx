import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto pb-16">
      {/* Top Bar Skeleton */}
      <div className="flex justify-between items-center border-b border-[#33323C] pb-4">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-[#24232B] rounded" />
          <div className="h-7 w-56 bg-[#24232B] rounded" />
        </div>
        <div className="h-9 w-40 bg-[#33323C] rounded" />
      </div>

      {/* Metrics Row Skeleton (5 cols + 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-[#24232B] rounded p-6 h-48 border border-[#33323C]" />
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-7 bg-[#24232B] rounded p-5 h-24 border border-[#33323C]" />
          <div className="sm:col-span-5 bg-[#24232B] rounded p-5 h-24 border border-[#33323C]" />
          <div className="sm:col-span-12 bg-[#1C1B22] rounded p-4 h-16 border border-[#33323C]" />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#24232B] rounded p-6 h-64 border border-[#33323C]" />

      {/* History List Skeleton */}
      <div className="bg-[#24232B] rounded p-6 space-y-3 border border-[#33323C]">
        <div className="h-3 w-36 bg-[#1C1B22] rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full bg-[#1C1B22] rounded border border-[#33323C]" />
        ))}
      </div>
    </div>
  );
}
