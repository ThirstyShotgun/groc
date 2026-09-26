import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Palette } from '@/constants/theme';

interface RadialScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
}

export const RadialScoreGauge: React.FC<RadialScoreGaugeProps> = ({
  score,
  size = 'md',
  strokeWidth: customStrokeWidth,
  showLabel = true,
}) => {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  let dimension = 110;
  let strokeWidth = customStrokeWidth || 8;
  let fontSize = 26;

  if (typeof size === 'number') {
    dimension = size;
    strokeWidth = customStrokeWidth || Math.round(size * 0.08);
    fontSize = Math.round(size * 0.24);
  } else if (size === 'sm') {
    dimension = 56;
    strokeWidth = customStrokeWidth || 4.5;
    fontSize = 14;
  } else if (size === 'lg') {
    dimension = 140;
    strokeWidth = customStrokeWidth || 10;
    fontSize = 32;
  } else if (size === 'xl') {
    dimension = 170;
    strokeWidth = customStrokeWidth || 12;
    fontSize = 42;
  }

  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - boundedScore / 100);

  // Dynamic color based on score tier
  let strokeColor = Palette.accentAmber;
  let tierLabel = 'Competent';
  let tierColor = Palette.accentAmber;

  if (boundedScore >= 85) {
    strokeColor = Palette.success;
    tierLabel = 'Strong Candidate';
    tierColor = Palette.success;
  } else if (boundedScore >= 70) {
    strokeColor = Palette.accentGold;
    tierLabel = 'Solid Match';
    tierColor = Palette.accentGold;
  } else if (boundedScore >= 50) {
    strokeColor = Palette.accentSecondary;
    tierLabel = 'Promising';
    tierColor = Palette.accentSecondary;
  } else {
    strokeColor = Palette.warning;
    tierLabel = 'Needs Practice';
    tierColor = Palette.warning;
  }

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      <Svg width={dimension} height={dimension} style={styles.svg}>
        {/* Background Track */}
        <Circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="rgba(184, 175, 201, 0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Arc */}
        <Circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        <Text style={[styles.scoreText, { fontSize, color: Palette.textPrimary }]}>
          {boundedScore}
        </Text>
        {dimension >= 70 && (
          <Text style={[styles.subText, { color: Palette.textMuted }]}>/100</Text>
        )}
        {showLabel && dimension >= 100 && (
          <View style={[styles.badge, { backgroundColor: `${tierColor}20`, borderColor: `${tierColor}40` }]}>
            <Text style={[styles.badgeText, { color: tierColor }]}>{tierLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  subText: {
    fontSize: 10,
    marginTop: -2,
    fontFamily: 'monospace',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
