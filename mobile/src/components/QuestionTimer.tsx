import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Palette } from '@/constants/theme';

interface QuestionTimerProps {
  initialSeconds?: number;
  isActive: boolean;
  onTimeUp: () => void;
  resetKey: string | number;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  initialSeconds = 90,
  isActive,
  onTimeUp,
  resetKey,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsPaused(false);
  }, [resetKey, initialSeconds]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    if (timeLeft <= 0) {
      onTimeUpRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft]);

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, timeLeft / initialSeconds));
  const offset = circumference * (1 - ratio);

  const isUrgent = timeLeft <= 15;
  const isWarning = timeLeft <= 30 && !isUrgent;

  const color = isUrgent
    ? Palette.warning
    : isWarning
    ? Palette.accentSecondary
    : Palette.accentAmber;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setIsPaused(!isPaused)}
      style={[
        styles.container,
        {
          backgroundColor: isUrgent ? `${Palette.warning}15` : `${Palette.bgSurface}90`,
          borderColor: isUrgent ? Palette.warning : Palette.borderLight,
        },
      ]}
    >
      <View style={styles.svgWrapper}>
        <Svg width={34} height={34}>
          <Circle
            cx={17}
            cy={17}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={3}
            fill="transparent"
          />
          <Circle
            cx={17}
            cy={17}
            r={radius}
            stroke={color}
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            transform="rotate(-90 17 17)"
          />
        </Svg>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.timeText, { color }]}>{timeFormatted}</Text>
        <Text style={styles.statusText}>{isPaused ? 'PAUSED' : 'LEFT'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  svgWrapper: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 8,
    color: 'rgba(184, 175, 201, 0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
