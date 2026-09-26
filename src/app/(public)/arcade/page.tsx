'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ArcadeHub from '@/features/arcade/components/ArcadeHub';
import FillerReflexGame from '@/features/arcade/components/FillerReflexGame';
import { fetchPersonalBests } from '@/lib/arcade-service';
import { ArcadeGameType, PersonalBests } from '@/types/arcade';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import InteractiveButton from '@/components/ui/InteractiveButton';

function ArcadeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameParam = searchParams.get('game') as ArcadeGameType | null;

  const [activeGame, setActiveGame] = useState<'hub' | ArcadeGameType>(
    gameParam === 'filler_reflex' || gameParam === 'pitch_60' ? gameParam : 'hub'
  );

  const [personalBests, setPersonalBests] = useState<PersonalBests>({
    fillerReflexBest: null,
    pitchBest: null,
    fillerHistory: [],
    pitchHistory: [],
  });

  const loadScores = () => {
    fetchPersonalBests().then((pb) => {
      setPersonalBests(pb);
    });
  };

  useEffect(() => {
    loadScores();
  }, [activeGame]);

  const handleSelectGame = (game: ArcadeGameType) => {
    setActiveGame(game);
    router.replace(`/arcade?game=${game}`);
  };

  const handleBackToHub = () => {
    setActiveGame('hub');
    router.replace('/arcade');
    loadScores();
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 pt-2">
      {activeGame === 'hub' && (
        <ArcadeHub onSelectGame={handleSelectGame} personalBests={personalBests} />
      )}

      {activeGame === 'filler_reflex' && (
        <FillerReflexGame onBackToHub={handleBackToHub} />
      )}

      {activeGame === 'pitch_60' && (
        <div className="bg-[#24232B] border border-[#33323C] rounded p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C97B4A]/15 border border-[#C97B4A]/30 text-[#C97B4A]">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-[#EDEBE6]">
              60-Second Pitch Drill
            </h2>
            <p className="text-xs sm:text-sm text-[#8B899A] max-w-md mx-auto leading-relaxed">
              Game 1 (Filler Word Reflex) is currently active. 60-Second Pitch will be calibrated and activated immediately next.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleBackToHub}
              className="px-4 py-2 rounded bg-[#1C1B22] border border-[#33323C] text-xs font-mono text-[#8B899A] hover:text-[#EDEBE6] flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arcade</span>
            </button>
            <InteractiveButton
              variant="primary"
              onClick={() => handleSelectGame('filler_reflex')}
              className="px-5 py-2 rounded text-xs font-semibold"
            >
              Play Game 1 (Filler Reflex)
            </InteractiveButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArcadePage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center font-mono text-xs text-[#8B899A]">
          INITIALIZING PRACTICE ARCADE ENGINE...
        </div>
      }
    >
      <ArcadeContent />
    </Suspense>
  );
}
