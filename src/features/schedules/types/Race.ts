/**
 * Race type definitions for Le Mans Ultimate schedule tracking
 */

/**
 * Race categories
 */
export type RaceType = 'daily' | 'weekly' | 'special';

/**
 * Difficulty tiers for daily races
 */
export type RaceTier = 'beginner' | 'intermediate' | 'advanced';

/**
 * Car classes available in Le Mans Ultimate
 */
export type CarClass = 'LMP2' | 'Hypercar' | 'LMGT3' | 'Multi-class';

/**
 * Weather conditions
 */
export type WeatherCondition = 'Clear' | 'Dynamic' | 'Real Weather';

/**
 * Time of day settings
 */
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Sunset' | 'Night' | 'Full Day Cycle';

/**
 * License requirements
 */
export type LicenseRequirement = 'Bronze' | 'Silver' | 'Gold';

/**
 * Main Race interface
 * Represents a single race event in Le Mans Ultimate
 */
export interface Race {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Race category */
  type: RaceType;

  /** Difficulty tier (for daily races only) */
  tier?: RaceTier;

  /** Track/circuit name */
  trackName: string;

  /** Specific track layout/configuration */
  trackConfiguration: string;

  /** Car class for this race */
  carClass: CarClass;

  /** Race start time in ISO 8601 UTC format */
  startTime: string;

  /** Race duration in minutes */
  durationMinutes: number;

  /** Weather conditions */
  weatherCondition: WeatherCondition;

  /** Time of day setting */
  timeOfDay: TimeOfDay;

  /** Minimum license required */
  licenseRequirement: LicenseRequirement;

  /** Repeat interval in minutes (null for non-repeating races) */
  repeatInterval: number | null;

  /** Whether the race is currently live/active */
  isLive: boolean;
}
