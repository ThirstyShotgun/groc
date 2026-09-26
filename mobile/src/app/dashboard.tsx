import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Palette } from '@/constants/theme';
import { InterviewSession, Question } from '@/lib/types';
import { fetchAllSessions, calculateStreak, StreakData } from '@/lib/supabase';
import { RadialScoreGauge } from '@/components/RadialScoreGauge';
import { QuestionTypeBadge } from '@/components/QuestionTypeBadge';
import { StreakBadge } from '@/components/StreakBadge';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    practicedToday: false,
    totalDaysPracticed: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllSessions();
      setSessions(data);
      const computedStreak = calculateStreak(data);
      setStreak(computedStreak);
    } catch (err) {
      console.error('Failed to load dashboard sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Compute Metrics
  const scoredSessions = sessions.filter((s) => s.overall_score !== null && s.overall_score !== undefined);
  const totalSessions = sessions.length;
  const avgScore = scoredSessions.length
    ? Math.round(scoredSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / scoredSessions.length)
    : 0;
  const bestScore = scoredSessions.length
    ? Math.max(...scoredSessions.map((s) => s.overall_score || 0))
    : 0;

  let totalQuestionsAnswered = 0;
  sessions.forEach((s) => {
    if (s.questions) {
      totalQuestionsAnswered += s.questions.filter((q) => Boolean(q.answer_text)).length;
    }
  });

  // Prepare Chart Data (chronological order)
  const chartSessions = [...scoredSessions].reverse().slice(-10); // last 10 rounds
  const chartData = chartSessions.map((s, idx) => ({
    value: s.overall_score || 0,
    label: `R${idx + 1}`,
    dataPointText: `${s.overall_score}`,
  }));

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Palette.accentAmber} />
          <Text style={styles.loadingText}>Loading interview telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.accentAmber}
            colors={[Palette.accentAmber]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header & Streak */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerSub}>PREPR ANALYTICS</Text>
            <Text style={styles.headerTitle}>Performance</Text>
          </View>
          <StreakBadge streak={streak} />
        </View>

        {/* 4 Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Rounds */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="layers-outline" size={18} color={Palette.accentAmber} />
            </View>
            <Text style={styles.metricValue}>{totalSessions}</Text>
            <Text style={styles.metricLabel}>Total Rounds</Text>
          </View>

          {/* Average Score */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="speedometer-outline" size={18} color={Palette.accentSecondary} />
            </View>
            <Text style={styles.metricValue}>{avgScore ? `${avgScore}%` : '—'}</Text>
            <Text style={styles.metricLabel}>Avg. Score</Text>
          </View>

          {/* Best Score */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="trophy-outline" size={18} color={Palette.accentGold} />
            </View>
            <Text style={styles.metricValue}>{bestScore ? `${bestScore}%` : '—'}</Text>
            <Text style={styles.metricLabel}>Best Score</Text>
          </View>

          {/* Questions Practiced */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="checkmark-done-circle-outline" size={18} color={Palette.success} />
            </View>
            <Text style={styles.metricValue}>{totalQuestionsAnswered}</Text>
            <Text style={styles.metricLabel}>Questions</Text>
          </View>
        </View>

        {/* Score Progression Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Score Progression Trend</Text>
              <Text style={styles.chartSub}>Recent rounds telemetry</Text>
            </View>
            {chartData.length > 0 && (
              <View style={styles.trendPill}>
                <Ionicons name="trending-up" size={14} color={Palette.accentAmber} />
                <Text style={styles.trendPillText}>Live Groq AI</Text>
              </View>
            )}
          </View>

          {chartData.length >= 2 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 85}
                height={170}
                areaChart
                curved
                color={Palette.accentAmber}
                thickness={3}
                startFillColor={Palette.accentAmber}
                endFillColor="rgba(224, 164, 88, 0.02)"
                startOpacity={0.35}
                endOpacity={0.0}
                initialSpacing={20}
                spacing={(screenWidth - 120) / Math.max(1, chartData.length)}
                yAxisColor={Palette.borderLight}
                xAxisColor={Palette.borderLight}
                yAxisTextStyle={{ color: Palette.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: Palette.textSecondary, fontSize: 10 }}
                noOfSections={4}
                maxValue={100}
                dataPointsColor={Palette.accentPrimary}
                dataPointsRadius={4}
                textFontSize={10}
                textColor={Palette.textPrimary}
              />
            </View>
          ) : (
            <View style={styles.emptyChartBox}>
              <Ionicons name="pulse-outline" size={32} color={Palette.textSecondary} />
              <Text style={styles.emptyChartText}>
                Complete at least 2 interview rounds to generate your trend curve!
              </Text>
            </View>
          )}
        </View>

        {/* Session History Header */}
        <View style={styles.historyHeaderRow}>
          <Text style={styles.sectionTitle}>Interview History</Text>
          <Text style={styles.sectionCount}>{sessions.length} sessions</Text>
        </View>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Ionicons name="document-text-outline" size={42} color={Palette.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Mock Sessions Yet</Text>
            <Text style={styles.emptyStateBody}>
              Start your first practice round now to get instant Groq-powered evaluations and track your growth!
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptyCTA}
              onPress={() => router.push('/')}
            >
              <Text style={styles.emptyCTAText}>Launch First Session</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          sessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const score = session.overall_score;
            const scoreColor =
              score && score >= 80
                ? Palette.success
                : score && score >= 60
                ? Palette.accentAmber
                : Palette.warning;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  style={styles.sessionHeaderRow}
                >
                  <View style={styles.sessionHeaderLeft}>
                    <View
                      style={[
                        styles.sessionScoreRing,
                        { borderColor: score !== null ? scoreColor : Palette.borderLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sessionScoreNumber,
                          { color: score !== null ? scoreColor : Palette.textSecondary },
                        ]}
                      >
                        {score !== null ? score : '—'}
                      </Text>
                    </View>

                    <View style={styles.sessionMeta}>
                      <Text style={styles.sessionRoleTitle} numberOfLines={1}>
                        {session.role_title}
                      </Text>
                      <View style={styles.sessionTagsRow}>
                        <Text style={styles.sessionDate}>{formatDate(session.created_at)}</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.sessionDifficulty}>
                          {(session.difficulty || 'mid').toUpperCase()}
                        </Text>
                        {session.questions && (
                          <>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text style={styles.sessionQCount}>
                              {session.questions.length} Qs
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Palette.textSecondary}
                  />
                </TouchableOpacity>

                {/* Expanded Session Questions */}
                {isExpanded && (
                  <View style={styles.expandedSessionBox}>
                    <Text style={styles.expandedTitle}>Questions in this Round:</Text>

                    {session.questions && session.questions.length > 0 ? (
                      session.questions.map((q, qIdx) => {
                        const qScore = q.score;
                        const qColor =
                          qScore && qScore >= 80
                            ? Palette.success
                            : qScore && qScore >= 60
                            ? Palette.accentAmber
                            : Palette.warning;

                        return (
                          <View key={q.id || qIdx} style={styles.questionSubCard}>
                            <View style={styles.subCardTop}>
                              <View style={styles.subCardLeft}>
                                <Text style={styles.subQNumber}>Q{qIdx + 1}</Text>
                                {q.question_type && (
                                  <QuestionTypeBadge type={q.question_type} size="sm" />
                                )}
                              </View>
                              {qScore !== null && qScore !== undefined && (
                                <View
                                  style={[
                                    styles.qScorePill,
                                    { backgroundColor: `${qColor}20`, borderColor: qColor },
                                  ]}
                                >
                                  <Text style={[styles.qScorePillText, { color: qColor }]}>
                                    {qScore}/100
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text style={styles.subQuestionText}>{q.question_text}</Text>

                            {q.answer_text ? (
                              <View style={styles.subAnswerBox}>
                                <Text style={styles.subAnswerLabel}>Answer:</Text>
                                <Text style={styles.subAnswerText} numberOfLines={3}>
                                  {q.answer_text}
                                </Text>
                              </View>
                            ) : null}

                            {q.feedback ? (
                              <View style={styles.subFeedbackBox}>
                                <Text style={styles.subFeedbackLabel}>Evaluator Feedback:</Text>
                                <Text style={styles.subFeedbackText}>{q.feedback}</Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.noQuestionsText}>No questions recorded for this session.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Bottom CTA to practice */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.startPracticeBtn}
            onPress={() => router.push('/')}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.startPracticeBtnText}>Start New Mock Interview</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingText: {
    color: Palette.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.textPrimary,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: (screenWidth - 52) / 2,
    backgroundColor: Palette.bgSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Palette.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },

  // Chart Card
  chartCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  chartSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Palette.accentAmber}18`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.accentAmber,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: 10,
  },
  emptyChartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyChartText: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },

  // History List
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateBody: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  emptyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emptyCTAText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Session Card
  sessionCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sessionScoreRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgSurface,
  },
  sessionScoreNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  sessionMeta: {
    flex: 1,
  },
  sessionRoleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 3,
  },
  sessionTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDate: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  dotSeparator: {
    fontSize: 10,
    color: Palette.textSecondary,
  },
  sessionDifficulty: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accentAmber,
  },
  sessionQCount: {
    fontSize: 11,
    color: Palette.textSecondary,
  },

  // Expanded Session Box
  expandedSessionBox: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  expandedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 10,
  },
  noQuestionsText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontStyle: 'italic',
  },
  questionSubCard: {
    backgroundColor: Palette.bgSurface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 10,
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subQNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentAmber,
  },
  qScorePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  qScorePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subQuestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
  },
  subAnswerBox: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },
  subAnswerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.textSecondary,
    marginBottom: 2,
  },
  subAnswerText: {
    fontSize: 12,
    color: Palette.textPrimary,
    lineHeight: 16,
  },
  subFeedbackBox: {
    marginTop: 6,
    padding: 8,
    backgroundColor: `${Palette.accentAmber}10`,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Palette.accentAmber,
  },
  subFeedbackLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accentAmber,
    marginBottom: 2,
  },
  subFeedbackText: {
    fontSize: 12,
    color: Palette.textPrimary,
    lineHeight: 16,
  },

  // Bottom Actions
  bottomActions: {
    marginTop: 10,
  },
  startPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.accentPrimary,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    shadowColor: Palette.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  startPracticeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
