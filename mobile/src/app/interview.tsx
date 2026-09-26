import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import { Question, ScoreResult, SessionSummaryResult } from '@/lib/types';
import { createSession, insertQuestions, updateQuestionScore, completeSession } from '@/lib/supabase';
import { generateQuestions, scoreAnswer, generateSessionSummary } from '@/lib/groq';
import { RadialScoreGauge } from '@/components/RadialScoreGauge';
import { QuestionTypeBadge } from '@/components/QuestionTypeBadge';
import { QuestionTimer } from '@/components/QuestionTimer';

type InterviewPhase = 'loading' | 'answering' | 'evaluating' | 'feedback' | 'completing' | 'summary';

export default function InterviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; difficulty?: string }>();

  const roleTitle = (params.role as string) || 'Software Engineer';
  const difficulty = (params.difficulty as string) || 'mid';

  // State
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null);
  const [summary, setSummary] = useState<SessionSummaryResult | null>(null);
  const [expandedSummaryIdx, setExpandedSummaryIdx] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Generating custom interview questions...');

  const currentQ = questions[currentIndex];
  const wordCount = answerInput.trim().split(/\s+/).filter(Boolean).length;

  // Initialize Interview
  useEffect(() => {
    let isMounted = true;

    async function initInterview() {
      try {
        setPhase('loading');
        setLoadingMessage(`Crafting 5 questions for ${roleTitle} (${difficulty} level)...`);

        // 1. Generate questions via Groq (with curated fallback)
        const generated = await generateQuestions(roleTitle, difficulty);

        // 2. Create Supabase session
        const { sessionId: newSessionId } = await createSession(roleTitle, difficulty);
        if (!isMounted) return;
        setSessionId(newSessionId);

        // 3. Insert question rows into Supabase
        const dbQuestions = await insertQuestions(newSessionId, generated);
        if (!isMounted) return;

        const formattedQuestions: Question[] = dbQuestions.map((q, idx) => ({
          id: q.id,
          session_id: newSessionId,
          order_index: q.order_index ?? (idx + 1),
          question_text: q.question_text,
          question_type: q.question_type || 'Technical',
          answer_text: '',
          score: null,
          feedback: '',
          improvement_tip: '',
          strengths: '',
        }));

        setQuestions(formattedQuestions);
        setCurrentIndex(0);
        setAnswerInput('');
        setPhase('answering');
      } catch (err) {
        console.error('Failed to initialize interview:', err);
        Alert.alert(
          'Error',
          'Failed to initialize interview session. Please try again.',
          [{ text: 'Go Back', onPress: () => router.back() }]
        );
      }
    }

    initInterview();

    return () => {
      isMounted = false;
    };
  }, [roleTitle, difficulty]);

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    if (!currentQ) return;
    const finalAnswer = answerInput.trim();

    if (!finalAnswer) {
      Alert.alert(
        'Empty Answer',
        'Would you like to submit an empty answer? This will result in a zero score for this question.',
        [
          { text: 'Keep Typing', style: 'cancel' },
          { text: 'Submit Anyway', style: 'destructive', onPress: () => evaluateAnswer('') },
        ]
      );
      return;
    }

    evaluateAnswer(finalAnswer);
  };

  // Evaluate candidate answer with Groq
  const evaluateAnswer = async (submittedText: string) => {
    if (!currentQ) return;

    setPhase('evaluating');
    setLoadingMessage('AI Evaluator analyzing your response...');

    try {
      // Call Groq evaluation
      const result = await scoreAnswer(currentQ.question_text, submittedText, roleTitle);

      // Update in Supabase
      await updateQuestionScore(
        currentQ.id,
        submittedText,
        result.score,
        result.feedback,
        result.improvement_tip
      );

      // Update local question state
      const updatedList = [...questions];
      updatedList[currentIndex] = {
        ...currentQ,
        answer_text: submittedText,
        score: result.score,
        feedback: result.feedback,
        improvement_tip: result.improvement_tip,
        strengths: result.strengths,
      };

      setQuestions(updatedList);
      setCurrentScore(result);
      setPhase('feedback');
    } catch (err) {
      console.error('Error scoring answer:', err);
      // Fallback display
      const fallbackResult: ScoreResult = {
        score: submittedText.length > 50 ? 75 : 40,
        feedback: 'Your answer was recorded. Clear articulation was noted.',
        improvement_tip: 'Detail specific real-world outcomes and edge cases.',
        strengths: 'Good initial reasoning.',
        source: 'local_fallback',
      };
      setCurrentScore(fallbackResult);
      setPhase('feedback');
    }
  };

  // Auto-submit when timer expires
  const handleTimeUp = () => {
    if (phase === 'answering') {
      Alert.alert(
        "Time's Up!",
        'Your 90-second response window has expired. Submitting whatever you have typed.',
        [{ text: 'OK', onPress: () => evaluateAnswer(answerInput.trim()) }]
      );
    }
  };

  // Retry Answer for Current Question
  const handleRetry = () => {
    setAnswerInput(currentQ.answer_text || '');
    setCurrentScore(null);
    setPhase('answering');
  };

  // Next Question or Wrap-up
  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const nextQ = questions[currentIndex + 1];
      setAnswerInput(nextQ?.answer_text || '');
      setCurrentScore(null);
      setPhase('answering');
    } else {
      // Completed all questions -> Generate summary
      setPhase('completing');
      setLoadingMessage('Synthesizing your full interview performance...');

      try {
        const answersPayload = questions.map((q) => ({
          question_text: q.question_text,
          answer_text: q.answer_text,
          score: q.score ?? 0,
        }));

        const avgScore = Math.round(
          questions.reduce((acc, q) => acc + (q.score ?? 0), 0) / Math.max(1, questions.length)
        );

        // Save session overall score
        await completeSession(sessionId, avgScore);

        // Holistic summary via Groq
        const summaryData = await generateSessionSummary(roleTitle, answersPayload);
        setSummary(summaryData);
        setPhase('summary');
      } catch (err) {
        console.error('Error finalizing session:', err);
        const avgScore = Math.round(
          questions.reduce((acc, q) => acc + (q.score ?? 0), 0) / Math.max(1, questions.length)
        );
        setSummary({
          overall_feedback: `You completed all 5 questions for ${roleTitle} with an average score of ${avgScore}/100.`,
          improvement_tip: 'Review feedback on specific questions and practice structured reasoning with the STAR method.',
          hiring_verdict: avgScore >= 80 ? 'Strong Candidate' : avgScore >= 65 ? 'Promising Candidate' : 'Needs Practice',
        });
        setPhase('summary');
      }
    }
  };

  // RENDER: Loading or Evaluating State
  if (phase === 'loading' || phase === 'evaluating' || phase === 'completing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Palette.accentAmber} />
            <Text style={styles.loadingTitle}>
              {phase === 'loading'
                ? 'Preparing Your Simulation'
                : phase === 'evaluating'
                ? 'Evaluating Response'
                : 'Finalizing Interview'}
            </Text>
            <Text style={styles.loadingSubtitle}>{loadingMessage}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // RENDER: Summary Screen
  if (phase === 'summary' && summary) {
    const avgScore = Math.round(
      questions.reduce((acc, q) => acc + (q.score ?? 0), 0) / Math.max(1, questions.length)
    );

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.summaryScroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.summaryHeader}>
            <Text style={styles.summarySubtitle}>{roleTitle.toUpperCase()} • ROUND COMPLETE</Text>
            <Text style={styles.summaryTitle}>Interview Performance</Text>
          </View>

          {/* Overall Score Gauge Card */}
          <View style={styles.summaryScoreCard}>
            <RadialScoreGauge score={avgScore} size={130} strokeWidth={11} label="Overall Score" />

            <View style={styles.verdictBadge}>
              <Ionicons
                name={
                  summary.hiring_verdict.toLowerCase().includes('strong')
                    ? 'checkmark-circle'
                    : 'sparkles'
                }
                size={16}
                color={Palette.accentAmber}
              />
              <Text style={styles.verdictText}>{summary.hiring_verdict}</Text>
            </View>

            <Text style={styles.summaryFeedback}>{summary.overall_feedback}</Text>

            <View style={styles.summaryTipBox}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={16} color={Palette.accentAmber} />
                <Text style={styles.tipTitle}>Key Takeaway for Promotion</Text>
              </View>
              <Text style={styles.tipContent}>{summary.improvement_tip}</Text>
            </View>
          </View>

          {/* Breakdown Section */}
          <Text style={styles.breakdownHeader}>Question Breakdown ({questions.length})</Text>

          {questions.map((q, idx) => {
            const isExpanded = expandedSummaryIdx === idx;
            const qScore = q.score ?? 0;
            const scoreColor =
              qScore >= 80 ? Palette.success : qScore >= 60 ? Palette.accentAmber : Palette.warning;

            return (
              <View key={q.id || idx} style={styles.questionItemCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedSummaryIdx(isExpanded ? null : idx)}
                  style={styles.questionItemHeader}
                >
                  <View style={styles.questionItemLeft}>
                    <View style={[styles.qScoreBadge, { backgroundColor: `${scoreColor}20`, borderColor: scoreColor }]}>
                      <Text style={[styles.qScoreText, { color: scoreColor }]}>{qScore}</Text>
                    </View>
                    <View style={styles.questionItemMeta}>
                      <Text style={styles.questionNumberText}>Question {idx + 1}</Text>
                      <Text style={styles.questionPreviewText} numberOfLines={isExpanded ? undefined : 2}>
                        {q.question_text}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Palette.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedSection}>
                      <Text style={styles.sectionLabel}>YOUR ANSWER:</Text>
                      <Text style={styles.sectionText}>
                        {q.answer_text ? q.answer_text : 'No answer submitted.'}
                      </Text>
                    </View>

                    {q.feedback ? (
                      <View style={styles.expandedSection}>
                        <Text style={styles.sectionLabel}>EVALUATOR FEEDBACK:</Text>
                        <Text style={styles.sectionText}>{q.feedback}</Text>
                      </View>
                    ) : null}

                    {q.improvement_tip ? (
                      <View style={styles.expandedSection}>
                        <Text style={styles.sectionLabel}>IMPROVEMENT TIP:</Text>
                        <Text style={[styles.sectionText, { color: Palette.accentGold }]}>
                          {q.improvement_tip}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}

          {/* Action CTAs */}
          <View style={styles.summaryActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Practice Another Role</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={() => router.push('/dashboard')}
            >
              <Ionicons name="bar-chart-outline" size={18} color={Palette.accentAmber} />
              <Text style={styles.secondaryButtonText}>View Full Analytics Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // RENDER: Feedback View for Current Question
  if (phase === 'feedback' && currentScore) {
    const isLastQuestion = currentIndex >= questions.length - 1;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.feedbackScroll} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.topProgressText}>
              Question {currentIndex + 1} of {questions.length} Feedback
            </Text>
            {currentQ?.question_type && <QuestionTypeBadge type={currentQ.question_type} size="sm" />}
          </View>

          {/* Score Gauge Card */}
          <View style={styles.feedbackCard}>
            <RadialScoreGauge score={currentScore.score} size={110} strokeWidth={10} label="Question Score" />

            {/* Strengths */}
            {currentScore.strengths && (
              <View style={styles.feedbackSection}>
                <View style={styles.badgeRow}>
                  <Ionicons name="shield-checkmark" size={16} color={Palette.success} />
                  <Text style={[styles.feedbackSectionTitle, { color: Palette.success }]}>
                    Key Strengths
                  </Text>
                </View>
                <Text style={styles.feedbackSectionBody}>{currentScore.strengths}</Text>
              </View>
            )}

            {/* Detailed Critique */}
            <View style={styles.feedbackSection}>
              <View style={styles.badgeRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={Palette.accentAmber} />
                <Text style={[styles.feedbackSectionTitle, { color: Palette.accentAmber }]}>
                  Evaluator Critique
                </Text>
              </View>
              <Text style={styles.feedbackSectionBody}>{currentScore.feedback}</Text>
            </View>

            {/* Improvement Recommendation */}
            <View style={styles.tipBox}>
              <View style={styles.badgeRow}>
                <Ionicons name="rocket-outline" size={16} color={Palette.accentSecondary} />
                <Text style={[styles.feedbackSectionTitle, { color: Palette.accentSecondary }]}>
                  How to Level Up
                </Text>
              </View>
              <Text style={styles.tipText}>{currentScore.improvement_tip}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.feedbackActionButtons}>
            {/* Retry Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons name="arrow-undo-outline" size={18} color={Palette.textSecondary} />
              <Text style={styles.retryButtonText}>Retry Answer</Text>
            </TouchableOpacity>

            {/* Next Question Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.nextButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Complete Interview' : 'Next Question'}
              </Text>
              <Ionicons
                name={isLastQuestion ? 'checkmark-done' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // RENDER: Answering View (Default)
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.answeringScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Progress & Timer Bar */}
          <View style={styles.interviewHeaderBar}>
            <View>
              <Text style={styles.interviewSubtitle}>
                {roleTitle} • {difficulty.toUpperCase()}
              </Text>
              <Text style={styles.questionIndexText}>
                Question {currentIndex + 1} of {questions.length}
              </Text>
            </View>

            {/* Timer */}
            <QuestionTimer
              initialSeconds={90}
              isActive={phase === 'answering'}
              onTimeUp={handleTimeUp}
              resetKey={currentIndex}
            />
          </View>

          {/* Progress Dots */}
          <View style={styles.progressDotsRow}>
            {questions.map((_, idx) => {
              const isDone = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.progressDot,
                    isDone && styles.progressDotDone,
                    isCurrent && styles.progressDotCurrent,
                  ]}
                />
              );
            })}
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.cardTopRow}>
              {currentQ?.question_type && (
                <QuestionTypeBadge type={currentQ.question_type} size="md" />
              )}
              <View style={styles.interviewerTag}>
                <Ionicons name="mic-outline" size={14} color={Palette.accentAmber} />
                <Text style={styles.interviewerTagText}>AI Interviewer</Text>
              </View>
            </View>

            <Text style={styles.questionText}>
              {currentQ ? currentQ.question_text : 'Loading question...'}
            </Text>
          </View>

          {/* Answer Input Card */}
          <View style={styles.answerCard}>
            <View style={styles.answerHeaderRow}>
              <Text style={styles.answerLabel}>YOUR RESPONSE</Text>
              <Text style={styles.wordCountText}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </Text>
            </View>

            <TextInput
              style={styles.textInput}
              multiline
              textAlignVertical="top"
              placeholder="Type your response here... Explain your reasoning, trade-offs, and concrete examples."
              placeholderTextColor={Palette.textMuted}
              value={answerInput}
              onChangeText={setAnswerInput}
              autoFocus
            />

            <View style={styles.inputFooterRow}>
              <Text style={styles.inputHint}>
                Tip: Structure answers with context, actions taken, and quantified results.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.primaryButton, styles.submitButton]}
            onPress={handleSubmitAnswer}
          >
            <Text style={styles.primaryButtonText}>Submit Answer</Text>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingCard: {
    backgroundColor: Palette.bgSecondary,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    width: '100%',
    maxWidth: 360,
  },
  loadingTitle: {
    color: Palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: Palette.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Answering Layout
  answeringScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  interviewHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interviewSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questionIndexText: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginTop: 2,
  },
  progressDotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDotDone: {
    backgroundColor: Palette.success,
  },
  progressDotCurrent: {
    backgroundColor: Palette.accentAmber,
  },

  // Question Card
  questionCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  interviewerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Palette.accentAmber}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  interviewerTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.accentAmber,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Palette.textPrimary,
    lineHeight: 25,
  },

  // Answer Input Card
  answerCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 20,
  },
  answerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 0.8,
  },
  wordCountText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: Palette.bgSurface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Palette.textPrimary,
    minHeight: 180,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    lineHeight: 22,
  },
  inputFooterRow: {
    marginTop: 10,
  },
  inputHint: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontStyle: 'italic',
  },

  // Primary Buttons
  primaryButton: {
    backgroundColor: Palette.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  submitButton: {
    shadowColor: Palette.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Feedback Screen
  feedbackScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topProgressText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  feedbackCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackSection: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  feedbackSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  feedbackSectionBody: {
    fontSize: 14,
    color: Palette.textPrimary,
    lineHeight: 21,
  },
  tipBox: {
    width: '100%',
    backgroundColor: `${Palette.accentSecondary}15`,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Palette.accentSecondary,
    marginTop: 16,
  },
  tipText: {
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 19,
  },
  feedbackActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.bgSecondary,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 6,
  },
  retryButtonText: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Palette.accentPrimary,
    gap: 8,
    shadowColor: Palette.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Summary Screen
  summaryScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  summaryScoreCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    alignItems: 'center',
    marginBottom: 24,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Palette.accentAmber}20`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.accentAmber,
    gap: 6,
    marginTop: 14,
    marginBottom: 14,
  },
  verdictText: {
    color: Palette.accentAmber,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryFeedback: {
    fontSize: 15,
    color: Palette.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryTipBox: {
    backgroundColor: Palette.bgSurface,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: Palette.accentAmber,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentAmber,
    textTransform: 'uppercase',
  },
  tipContent: {
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 19,
  },
  breakdownHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 12,
  },
  questionItemCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 10,
    overflow: 'hidden',
  },
  questionItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  questionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  qScoreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qScoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  questionItemMeta: {
    flex: 1,
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    textTransform: 'uppercase',
  },
  questionPreviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginTop: 2,
  },
  expandedContent: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  expandedSection: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
  summaryActions: {
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Palette.bgSecondary,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 8,
  },
  secondaryButtonText: {
    color: Palette.accentAmber,
    fontSize: 15,
    fontWeight: '600',
  },
});
