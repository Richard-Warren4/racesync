/**
 * PracticeSession entity for race preparation
 *
 * Represents a practice session associated with a race. Practice sessions
 * are generated on-demand when a user schedules practice for a race,
 * not persisted in storage.
 *
 * Three sessions are created per race:
 * 1. Track Familiarization (1-3 days before)
 * 2. Qualifying Simulation (1-3 days before)
 * 3. Race Pace (1-3 days before)
 *
 * Environmental conditions (weather, time of day, temperature) are inherited
 * from the associated race.
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Type of practice session
 */
export type SessionType = 'Track Familiarization' | 'Qualifying Simulation' | 'Race Pace';

/**
 * Permitted session durations (in minutes)
 */
export type SessionDuration = 15 | 30 | 45;

/**
 * Days before race to schedule practice (1-3 days)
 */
export type ScheduleOffset = 1 | 2 | 3;

/**
 * Practice session for race preparation
 */
export interface PracticeSession {
  /**
   * Unique identifier for this practice session (UUID format)
   */
  id: string;

  /**
   * Reference to the associated Race.id
   * Must reference an existing race entity
   */
  raceId: string;

  /**
   * Type of practice session
   */
  sessionType: SessionType;

  /**
   * Session duration in minutes
   * Must be one of: 15, 30, or 45
   */
  durationMinutes: SessionDuration;

  /**
   * Number of days before the race to schedule this session
   * Must be one of: 1, 2, or 3
   */
  scheduleOffsetDays: ScheduleOffset;

  /**
   * Calculated start time for the practice session
   * ISO 8601 local time format, relative to race start time
   * Must precede the actual race start time
   * @example "2024-03-13T14:00:00" (for race on 2024-03-15)
   */
  suggestedStartTime: string;

  /**
   * Weather condition inherited from the associated race
   * Matches Race.weatherCondition
   */
  weatherCondition: string;

  /**
   * Time of day inherited from the associated race
   * Matches Race.timeOfDay
   */
  timeOfDay: string;

  /**
   * Track temperature (optional, race-derived value)
   * Null if not specified by the race
   */
  trackTemperature: string | null;
}

/**
 * Default practice session configurations
 * Used when user selects "Schedule Practice" for a race
 */
export const DEFAULT_PRACTICE_SESSIONS: Array<{
  sessionType: SessionType;
  durationMinutes: SessionDuration;
  scheduleOffsetDays: ScheduleOffset;
}> = [
  {
    sessionType: 'Track Familiarization',
    durationMinutes: 30,
    scheduleOffsetDays: 3,
  },
  {
    sessionType: 'Qualifying Simulation',
    durationMinutes: 45,
    scheduleOffsetDays: 2,
  },
  {
    sessionType: 'Race Pace',
    durationMinutes: 45,
    scheduleOffsetDays: 1,
  },
];

/**
 * Example usage:
 *
 * ```typescript
 * import { Race } from '../../schedules/types/Race';
 *
 * // Creating practice sessions for a race
 * function generatePracticeSessions(race: Race): PracticeSession[] {
 *   const raceStartTime = new Date(race.startTime);
 *
 *   return DEFAULT_PRACTICE_SESSIONS.map((config, index) => {
 *     // Calculate suggested start time (offsetDays before race)
 *     const sessionTime = new Date(raceStartTime);
 *     sessionTime.setDate(sessionTime.getDate() - config.scheduleOffsetDays);
 *
 *     return {
 *       id: `ps_${race.id}_${index}`,
 *       raceId: race.id,
 *       sessionType: config.sessionType,
 *       durationMinutes: config.durationMinutes,
 *       scheduleOffsetDays: config.scheduleOffsetDays,
 *       suggestedStartTime: sessionTime.toISOString().split('T')[0] + 'T' + race.startTime.split('T')[1].substring(0, 8),
 *       weatherCondition: race.weatherCondition,
 *       timeOfDay: race.timeOfDay,
 *       trackTemperature: null, // Could be derived from race if available
 *     };
 *   });
 * }
 *
 * // Example race
 * const race: Race = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'weekly',
 *   tier: null,
 *   trackName: 'Circuit de la Sarthe',
 *   trackConfiguration: '24h Layout',
 *   carClass: 'Hypercar',
 *   startTime: '2024-03-15T14:30:00Z',
 *   durationMinutes: 45,
 *   weatherCondition: 'Dynamic',
 *   timeOfDay: 'Afternoon',
 *   licenseRequirement: 'Silver',
 *   repeatInterval: null,
 *   isLive: false,
 * };
 *
 * // Generate all three practice sessions
 * const sessions = generatePracticeSessions(race);
 *
 * // Result:
 * // sessions[0]: Track Familiarization, 30 min, 3 days before (2024-03-12T14:30:00)
 * // sessions[1]: Qualifying Simulation, 45 min, 2 days before (2024-03-13T14:30:00)
 * // sessions[2]: Race Pace, 45 min, 1 day before (2024-03-14T14:30:00)
 *
 * // Validation: Ensure practice session precedes race
 * function isValidPracticeSession(session: PracticeSession, race: Race): boolean {
 *   const sessionTime = new Date(session.suggestedStartTime);
 *   const raceTime = new Date(race.startTime);
 *   return sessionTime < raceTime;
 * }
 * ```
 */
