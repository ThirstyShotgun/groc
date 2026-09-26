'use client';

import React from 'react';
import AnimatedHero3D from '@/components/hero/AnimatedHero3D';
import InteractiveDemoTeaser from '@/components/landing/InteractiveDemoTeaser';
import ResultsProofSection from '@/components/landing/ResultsProofSection';
import EditorialManifesto from '@/components/landing/EditorialManifesto';
import BenchmarkTracks from '@/components/landing/BenchmarkTracks';
import EvaluationArchitecture from '@/components/landing/EvaluationArchitecture';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import TerminalCallout from '@/components/landing/TerminalCallout';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full max-w-6xl mx-auto">
      <AnimatedHero3D />
      <InteractiveDemoTeaser />
      <ResultsProofSection />
      <EditorialManifesto />
      <BenchmarkTracks />
      <EvaluationArchitecture />
      <LandingFaqSection />
      <TerminalCallout />
    </div>
  );
}
