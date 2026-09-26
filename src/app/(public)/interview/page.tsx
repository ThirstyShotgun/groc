'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInterviewFlow } from '@/features/interview-flow/hooks/useInterviewFlow';
import InterviewSetupCard from '@/features/interview-flow/components/InterviewSetupCard';
import ProgressTracker from '@/features/interview-flow/components/ProgressTracker';
import QuestionCard from '@/features/interview-flow/components/QuestionCard';
import AnswerEditor from '@/features/interview-flow/components/AnswerEditor';
import FeedbackPanel from '@/features/interview-flow/components/FeedbackPanel';
import SessionSummary from '@/features/interview-flow/components/SessionSummary';

function InterviewFlowContent() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');

  const {
    stage,
    roleTitle,
    setRoleTitle,
    difficulty,
    setDifficulty,
    questions,
    currentQuestion,
    currentIndex,
    answerInput,
    setAnswerInput,
    currentEvaluation,
    completedQuestions,
    overallScore,
    isGenerating,
    isSubmitting,
    errorMessage,
    startInterview,
    submitAnswer,
    nextQuestion,
    resetInterview
  } = useInterviewFlow(urlRole || 'Senior Frontend Engineer');

  useEffect(() => {
    if (urlRole && stage === 'setup') {
      const timer = setTimeout(() => setRoleTitle(urlRole), 0);
      return () => clearTimeout(timer);
    }
  }, [urlRole, stage, setRoleTitle]);

  const [latency, setLatency] = useState('0.9s');
  useEffect(() => {
    const latencies = ['0.8s', '1.1s', '0.9s', '1.2s', '0.7s'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % latencies.length;
      setLatency(latencies[idx]);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full pb-8 pt-0">
      {/* Top Telemetry Docket Bar */}
      <div className="flex items-center justify-between border-b border-[#33323C] pb-2.5 mb-5 text-[10px] font-mono text-[#8B899A]">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C97B4A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C97B4A]" />
          </span>
          <span className="text-[#EDEBE6] font-bold">PREPR ENGINE</span>
          <span className="text-[#33323C]">/</span>
          <span>MODE: ACTIVE SIMULATION</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            LATENCY: <span className="text-[#EDEBE6] font-bold transition-all duration-300">&lt;{latency}</span>
            <span className="w-1 h-1 rounded-full bg-[#C97B4A] animate-pulse" />
          </span>
          <span>•</span>
          <span className="text-[#EDEBE6]">GROQ INFERENCE ONLINE</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 mb-5 border border-[#33323C] bg-[#24232B] text-xs text-[#EDEBE6] rounded font-mono flex items-center justify-between">
          <span className="font-semibold">[SYSTEM NOTICE]: {errorMessage}</span>
        </div>
      )}

      {stage === 'setup' && (
        <InterviewSetupCard
          roleTitle={roleTitle}
          setRoleTitle={setRoleTitle}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isGenerating={isGenerating}
          onStart={startInterview}
        />
      )}

      {(stage === 'question_active' || stage === 'feedback_active') && currentQuestion && (
        <div className="space-y-4">
          <ProgressTracker
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            roleTitle={roleTitle}
          />

          <QuestionCard question={currentQuestion} />

          {stage === 'question_active' && (
            <AnswerEditor
              answerInput={answerInput}
              setAnswerInput={setAnswerInput}
              isSubmitting={isSubmitting}
              onSubmit={(override) => submitAnswer(override)}
              resetKey={currentIndex}
            />
          )}

          {stage === 'feedback_active' && (
            <FeedbackPanel
              evaluation={currentEvaluation}
              onNext={nextQuestion}
              isLastQuestion={currentIndex + 1 === questions.length}
            />
          )}
        </div>
      )}

      {stage === 'summary' && (
        <SessionSummary
          roleTitle={roleTitle}
          overallScore={overallScore}
          completedQuestions={completedQuestions}
          onRestart={resetInterview}
        />
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[#8B899A]">INITIALIZING CALIBRATED INTERVIEW MODULE...</div>}>
      <InterviewFlowContent />
    </Suspense>
  );
}
