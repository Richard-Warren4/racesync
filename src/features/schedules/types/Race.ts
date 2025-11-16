/**
 * Race entity for Le Mans Ultimate race schedules
 *
 * Represents a single racing event with all metadata including timing,
 * track configuration, vehicle class, and environmental conditions.
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Race type classification for filtering and organization
 */
export type RaceType = 'daily' | 'weekly' | 'special';

/**
 * Skill level tier (required for daily races, optional for weekly/special)
 */
export type RaceTier = 'beginner' | 'intermediate' | 'advanced';

/**
 * Vehicle category for the race
 */
export type CarClass = 'LMP2' | 'Hypercar' | 'LMGT3' | 'Multi-class';

/**
 * Weather conditions for the race
 */
export type WeatherCondition = 'Clear' | 'Dynamic' | 'Real Weather';

/**
 * Time of day setting for the race
 */
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Sunset' | 'Night' | 'Full Day Cycle';

/**
 * Minimum license requirement (safety rating)
 */
export type LicenseRequirement = 'Bronze' | 'Silver' | 'Gold';

/**
 * Complete race entity with all scheduling and configuration metadata
 */
export interface Race {
  /**
   * Unique, stable identifier (UUID format)
   */
  id: string;

  /**
   * Race category for filtering and organization
   */
  type: RaceType;

  /**
   * Skill level tier
   * Required for daily races, null for weekly/special events
   */
  tier: RaceTier | null;

  /**
   * Circuit identifier (e.g., "Circuit de la Sarthe")
   */
  trackName: string;

  /**
   * Track variant designation (e.g., "No Chicanes", "24h Layout")
   * Null if default configuration
   */
  trackConfiguration: string | null;

  /**
   * Vehicle category for this race
   */
  carClass: CarClass;

  /**
   * Race start time in ISO 8601 UTC format
   * @example "2024-03-15T14:30:00Z"
   */
  startTime: string;

  /**
   * Race duration in minutes
   * Must be positive number
   */
  durationMinutes: number;

  /**
   * Weather conditions for the race
   */
  weatherCondition: WeatherCondition;

  /**
   * Time of day setting
   */
  timeOfDay: TimeOfDay;

  /**
   * Minimum safety rating required to participate
   */
  licenseRequirement: LicenseRequirement;

  /**
   * Minutes between race repeats for daily races
   * Null for weekly and special events
   */
  repeatInterval: number | null;

  /**
   * Computed property: true if current time falls within race window
   * Calculated at runtime, not persisted
   */
  isLive: boolean;
}

/**
 * Example usage:
 *
 * ```typescript
 * const dailyRace: Race = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'daily',
 *   tier: 'intermediate',
 *   trackName: 'Circuit de la Sarthe',
 *   trackConfiguration: '24h Layout',
 *   carClass: 'Hypercar',
 *   startTime: '2024-03-15T14:30:00Z',
 *   durationMinutes: 45,
 *   weatherCondition: 'Dynamic',
 *   timeOfDay: 'Afternoon',
 *   licenseRequirement: 'Silver',
 *   repeatInterval: 120,
 *   isLive: false
 * };
 *
 * const specialRace: Race = {
 *   id: '550e8400-e29b-41d4-a716-446655440001',
 *   type: 'special',
 *   tier: null,
 *   trackName: 'Spa-Francorchamps',
 *   trackConfiguration: null,
 *   carClass: 'Multi-class',
 *   startTime: '2024-03-20T18:00:00Z',
 *   durationMinutes: 360,
 *   weatherCondition: 'Real Weather',
 *   timeOfDay: 'Full Day Cycle',
 *   licenseRequirement: 'Gold',
 *   repeatInterval: null,
 *   isLive: true
 * };
 * ```
 */
