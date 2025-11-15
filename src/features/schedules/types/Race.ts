/**
 * Race category types for Le Mans Ultimate
 */
export type RaceCategory = 'Hypercar' | 'LMP2' | 'LMGT3' | 'Multi-class';

/**
 * Represents a race in the Le Mans Ultimate schedule
 */
export interface Race {
  /** Unique identifier for the race */
  id: string;

  /** Race title/name */
  title: string;

  /** Race category (Hypercar, LMP2, etc.) */
  category: RaceCategory;

  /** Track/circuit name */
  track: string;

  /** Start time in ISO 8601 format (UTC) */
  startTime: string;

  /** Race duration in minutes */
  durationMinutes: number;

  /** Series or championship name */
  series?: string;

  /** Whether this race is favorited by the user */
  isFavorite?: boolean;
}
