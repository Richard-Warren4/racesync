/**
 * Race category color constants for UI
 * Used for color-coded race type indicators throughout the app
 */

export const RACE_COLORS = {
  daily: '#2563eb', // Blue
  weekly: '#14b8a6', // Teal
  special: '#dc2626', // Red
} as const;

export type RaceColorKey = keyof typeof RACE_COLORS;
