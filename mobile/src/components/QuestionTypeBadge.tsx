import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '@/constants/theme';

interface QuestionTypeBadgeProps {
  type?: string;
  size?: 'sm' | 'md';
}

export const QuestionTypeBadge: React.FC<QuestionTypeBadgeProps> = ({
  type = 'Technical',
  size = 'md',
}) => {
  const norm = (type || 'Technical').toLowerCase();

  let label = 'Technical';
  let color = Palette.technical;

  if (norm.includes('behavior')) {
    label = 'Behavioral';
    color = Palette.behavioral;
  } else if (norm.includes('situation') || norm.includes('scenario')) {
    label = 'Situational';
    color = Palette.situational;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}15`,
          borderColor: `${color}35`,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color, fontSize: isSmall ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
