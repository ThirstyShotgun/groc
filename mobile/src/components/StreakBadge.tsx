import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '@/constants/theme';
import { StreakData } from '@/lib/supabase';

interface StreakBadgeProps {
  streak: StreakData;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  const { currentStreak, practicedToday } = streak;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentStreak > 0 ? `${Palette.accentSecondary}20` : `${Palette.bgSurface}90`,
          borderColor: currentStreak > 0 ? Palette.accentSecondary : Palette.borderLight,
        },
      ]}
    >
      <Text style={styles.icon}>🔥</Text>
      <Text
        style={[
          styles.text,
          { color: currentStreak > 0 ? Palette.textPrimary : Palette.textSecondary },
        ]}
      >
        {currentStreak > 0 ? `${currentStreak}-Day Streak` : 'Start Streak'}
      </Text>
      {practicedToday && (
        <View style={styles.todayIndicator}>
          <Text style={styles.todayText}>TODAY</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayIndicator: {
    backgroundColor: `${Palette.success}30`,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 8,
    color: Palette.success,
    fontWeight: '700',
  },
});
