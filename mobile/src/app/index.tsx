import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ROLE_PRESETS = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Go Engineer',
  'Product Manager',
  'DevOps & Cloud',
];

const SENIORITY_LEVELS = [
  { id: 'entry', label: 'Junior' },
  { id: 'mid', label: 'Mid-Level' },
  { id: 'senior', label: 'Senior' },
  { id: 'lead', label: 'Staff / Lead' },
];

export default function LandingScreen() {
  const router = useRouter();
  const [roleTitle, setRoleTitle] = useState('Full Stack Engineer');
  const [seniority, setSeniority] = useState('senior');

  const handleStart = () => {
    if (!roleTitle.trim()) return;
    router.push({
      pathname: '/interview',
      params: {
        role: roleTitle.trim(),
        difficulty: seniority,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>P</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Prepr</Text>
            <Text style={styles.brandTagline}>AI Mock Interview Simulator</Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroPill}>
            <Ionicons name="sparkles" size={13} color={Palette.accentAmber} />
            <Text style={styles.heroPillText}>GROQ LLM + SUPABASE REALTIME</Text>
          </View>

          <Text style={styles.heroHeadline}>
            Master Technical Interviews with Instant Feedback
          </Text>

          <Text style={styles.heroSubhead}>
            Experience real interview pressure with timed questions, live 0–100 scoring, and actionable coaching tailored to your exact role.
          </Text>
        </View>

        {/* Setup Card */}
        <View style={styles.setupCard}>
          <Text style={styles.sectionLabel}>TARGET JOB ROLE</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={18} color={Palette.accentAmber} style={styles.inputIcon} />
            <TextInput
              value={roleTitle}
              onChangeText={setRoleTitle}
              placeholder="e.g. Senior Backend Engineer"
              placeholderTextColor="rgba(184, 175, 201, 0.45)"
              style={styles.textInput}
            />
          </View>

          {/* Quick presets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
            {ROLE_PRESETS.map((p) => {
              const isSelected = roleTitle === p;
              return (
                <TouchableOpacity
                  key={p}
                  activeOpacity={0.7}
                  onPress={() => setRoleTitle(p)}
                  style={[
                    styles.presetPill,
                    isSelected && styles.presetPillSelected,
                  ]}
                >
                  <Text style={[styles.presetPillText, isSelected && styles.presetPillTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Seniority Selector */}
          <Text style={[styles.sectionLabel, { marginTop: 18 }]}>TARGET SENIORITY</Text>
          <View style={styles.seniorityRow}>
            {SENIORITY_LEVELS.map((lvl) => {
              const isSelected = seniority === lvl.id;
              return (
                <TouchableOpacity
                  key={lvl.id}
                  activeOpacity={0.7}
                  onPress={() => setSeniority(lvl.id)}
                  style={[
                    styles.seniorityBtn,
                    isSelected && styles.seniorityBtnSelected,
                  ]}
                >
                  <Text style={[styles.seniorityText, isSelected && styles.seniorityTextSelected]}>
                    {lvl.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStart}
            disabled={!roleTitle.trim()}
            style={[styles.primaryButton, !roleTitle.trim() && { opacity: 0.5 }]}
          >
            <Text style={styles.primaryButtonText}>Start Practicing Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#14121F" />
          </TouchableOpacity>
        </View>

        {/* Secondary Dashboard CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/dashboard')}
          style={styles.dashboardCardBtn}
        >
          <View style={styles.dashIconBox}>
            <Ionicons name="stats-chart" size={20} color={Palette.accentAmber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dashBtnTitle}>View Analytics & History</Text>
            <Text style={styles.dashBtnSub}>Track your practice streak and historical score progression</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textSecondary} />
        </TouchableOpacity>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresRow}>
          <View style={styles.featureBox}>
            <Ionicons name="timer-outline" size={22} color={Palette.accentSecondary} />
            <Text style={styles.featureTitle}>90s Timer</Text>
            <Text style={styles.featureDesc}>Realistic pressure simulations</Text>
          </View>
          <View style={styles.featureBox}>
            <Ionicons name="speedometer-outline" size={22} color={Palette.accentAmber} />
            <Text style={styles.featureTitle}>0–100 Scores</Text>
            <Text style={styles.featureDesc}>Detailed critique per answer</Text>
          </View>
          <View style={styles.featureBox}>
            <Ionicons name="flame-outline" size={22} color={Palette.accentGold} />
            <Text style={styles.featureTitle}>Daily Streaks</Text>
            <Text style={styles.featureDesc}>Build interview readiness</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 15,
    paddingBottom: 40,
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.accentAmber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.accentAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#14121F',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '400',
  },
  heroCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(224, 164, 88, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(224, 164, 88, 0.3)',
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 0.5,
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.textPrimary,
    lineHeight: 28,
  },
  heroSubhead: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    fontWeight: '300',
  },
  setupCard: {
    backgroundColor: Palette.bgSecondary,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.accentAmber,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  presetsRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Palette.bgSurface,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginRight: 8,
  },
  presetPillSelected: {
    backgroundColor: 'rgba(224, 164, 88, 0.2)',
    borderColor: Palette.accentAmber,
  },
  presetPillText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  presetPillTextSelected: {
    color: Palette.accentAmber,
    fontWeight: '600',
  },
  seniorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seniorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Palette.bgSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  seniorityBtnSelected: {
    backgroundColor: Palette.accentAmber,
    borderColor: Palette.accentAmber,
  },
  seniorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  seniorityTextSelected: {
    color: '#14121F',
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: Palette.accentAmber,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Palette.accentAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14121F',
  },
  dashboardCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgSecondary,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 12,
  },
  dashIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(224, 164, 88, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashBtnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  dashBtnSub: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  featureBox: {
    flex: 1,
    backgroundColor: 'rgba(59, 53, 96, 0.5)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(184, 175, 201, 0.12)',
    alignItems: 'center',
    gap: 4,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 4,
  },
  featureDesc: {
    fontSize: 10,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});
