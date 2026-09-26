/**
 * Prepr Theme Tokens - "Dusky Blueberry Autumn"
 * Deep blueberry-toned backgrounds with warm rust/amber accents and cream typography.
 */

import { Platform } from 'react-native';

export const Palette = {
  // Backgrounds
  bgPrimary: '#2E2A47',      // Deep dusky blueberry
  bgSecondary: '#3B3560',    // Lighter dusky blueberry for card surfaces
  bgSurface: '#242038',      // Darker inset surface for inputs & badges
  bgCard: 'rgba(59, 53, 96, 0.85)', // Semi-transparent glass card
  
  // Accents
  accentPrimary: '#C1652F',  // Warm rust
  accentSecondary: '#E07A5F',// Vibrant amber rust
  accentAmber: '#E0A458',    // Warm golden autumn amber
  accentGold: '#D4A373',     // Muted gold
  
  // Text
  textPrimary: '#F5EDE1',    // Warm cream
  textSecondary: '#B8AFC9',  // Dusty lavender
  textMuted: 'rgba(184, 175, 201, 0.65)',
  
  // Badges & States
  technical: '#38BDF8',      // Cyan
  behavioral: '#E0A458',     // Amber
  situational: '#C084FC',    // Violet
  success: '#7D9D7C',        // Soft sage
  warning: '#FF5C5C',        // Warm red alert
  
  // Borders
  borderLight: 'rgba(184, 175, 201, 0.2)',
  borderActive: 'rgba(224, 164, 88, 0.45)',
};

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.bgPrimary,
    card: Palette.bgSecondary,
    tint: Palette.accentAmber,
  },
  dark: {
    text: Palette.textPrimary,
    background: Palette.bgPrimary,
    card: Palette.bgSecondary,
    tint: Palette.accentAmber,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});
