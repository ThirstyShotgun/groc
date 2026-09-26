import { useState, useCallback } from 'react';
import { QuestionItem, EvaluateAnswerResponse } from '@/types/question';
import { QuestionRecord } from '@/types/session';
import { generateInterviewQuestions } from '@/features/question-generator/services';
import { evaluateAnswer, persistInterviewSession } from '@/features/interview-flow/services';
import { getPreferences } from '@/lib/preferences';

export type InterviewStage = 'setup' | 'question_active' | 'feedback_active' | 'summary';

export function useInterviewFlow(initialRole = 'Senior Frontend Engineer') {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [roleTitle, setRoleTitle] = useState(initialRole);
  const [difficulty, setDifficulty] = useState<string>(() => getPreferences().defaultDifficulty);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluateAnswerResponse | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<QuestionRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startInterview = useCallback(async () => {
    if (!roleTitle.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateInterviewQuestions({ role_title: roleTitle.trim(), difficulty });
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setCurrentIndex(0);
        setCompletedQuestions([]);
        setAnswerInput('');
        setCurrentEvaluation(null);
        setStage('question_active');
      } else {
        setErrorMessage('Unable to generate questions. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error generating questions.');
    } finally {
      setIsGenerating(false);
    }
  }, [roleTitle, difficulty]);

  const submitAnswer = useCallback(
    async (overrideAnswer?: string) => {
      const activeQ = questions[currentIndex];
      if (!activeQ || isSubmitting) return;

      const finalAnswer = (overrideAnswer !== undefined ? overrideAnswer : answerInput).trim();
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const evalRes = await evaluateAnswer({
          question_text: activeQ.question_text,
          answer_text: finalAnswer,
          role_title: roleTitle,
          question_type: activeQ.question_type
        });

        setCurrentEvaluation(evalRes);

        const record: QuestionRecord = {
          question_text: activeQ.question_text,
          answer_text: finalAnswer,
          score: evalRes.score,
          feedback: evalRes.feedback,
          improvement_tip: evalRes.improvement_tip,
          order_index: currentIndex + 1
        };

        const updated = [...completedQuestions.filter((q) => q.order_index !== currentIndex + 1), record];
        setCompletedQuestions(updated);
        setStage('feedback_active');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Evaluation failed.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [questions, currentIndex, answerInput, isSubmitting, roleTitle, completedQuestions]
  );

  const nextQuestion = useCallback(async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setAnswerInput('');
      setCurrentEvaluation(null);
      setStage('question_active');
    } else {
      // Interview complete, calculate final score and persist
      const scores = completedQuestions.map((q) => q.score ?? 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      await persistInterviewSession({
        role_title: roleTitle,
        overall_score: avgScore,
        difficulty,
        questions: completedQuestions.map((q, idx) => ({
          question_text: q.question_text,
          answer_text: q.answer_text ?? '',
          score: q.score ?? 0,
          feedback: q.feedback ?? '',
          improvement_tip: q.improvement_tip ?? '',
          order_index: idx + 1
        }))
      });
      setStage('summary');
    }
  }, [currentIndex, questions.length, completedQuestions, roleTitle, difficulty]);

  const resetInterview = useCallback(() => {
    setStage('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswerInput('');
    setCurrentEvaluation(null);
    setCompletedQuestions([]);
    setErrorMessage(null);
  }, []);

  const overallScore = completedQuestions.length > 0
    ? Math.round(completedQuestions.reduce((acc, q) => acc + (q.score ?? 0), 0) / completedQuestions.length)
    : 0;

  return {
    stage,
    roleTitle,
    setRoleTitle,
    difficulty,
    setDifficulty,
    questions,
    currentQuestion: questions[currentIndex],
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
  };
}
