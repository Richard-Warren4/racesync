/**
 * CalendarEvent entity for device calendar integration
 *
 * Represents a race or practice session added to the device's native calendar.
 * Events include a 15-minute buffer before the actual start time to allow for
 * preparation.
 *
 * Storage: Mappings tracked via `racesync:calendar-mappings` in AsyncStorage
 * to maintain associations between calendar events and races/practice sessions.
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Calendar event for race or practice session
 */
export interface CalendarEvent {
  /**
   * Platform-specific calendar event identifier
   * Assigned by the device's native calendar system
   */
  eventId: string;

  /**
   * Reference to associated Race.id
   * Null if this event is for a practice session
   */
  raceId: string | null;

  /**
   * Reference to associated PracticeSession.id
   * Null if this event is for a race
   * Note: One of raceId or practiceSessionId must be non-null
   */
  practiceSessionId: string | null;

  /**
   * Event heading displayed in calendar
   * @example "LMU Race: Circuit de la Sarthe - Hypercar"
   * @example "Practice: Qualifying Simulation - Spa"
   */
  title: string;

  /**
   * Track name for the event location field
   * @example "Circuit de la Sarthe"
   */
  location: string;

  /**
   * Event start time in ISO 8601 local time format
   * Includes 15-minute buffer before actual race/session start
   * @example "2024-03-15T14:15:00" (for race starting at 14:30)
   */
  startTime: string;

  /**
   * Event end time in ISO 8601 local time format
   * Calculated as startTime + duration
   * @example "2024-03-15T15:15:00" (for 45-minute race with buffer)
   */
  endTime: string;

  /**
   * Detailed description of the race/session
   * Includes relevant metadata like car class, weather, time of day, etc.
   * @example "Hypercar race at Circuit de la Sarthe\nWeather: Dynamic\nTime: Afternoon\nLicense: Silver"
   */
  description: string;

  /**
   * Device calendar identifier where this event was created
   * Platform-specific calendar ID (e.g., primary calendar, work calendar)
   */
  calendarId: string;

  /**
   * Timestamp when this event was added to the calendar
   * ISO 8601 UTC format
   * @example "2024-03-15T10:30:00Z"
   */
  createdAt: string;
}

/**
 * AsyncStorage key for calendar event mappings
 */
export const CALENDAR_MAPPINGS_STORAGE_KEY = 'racesync:calendar-mappings';

/**
 * Helper type for calendar mappings collection
 */
export type CalendarMapping = {
  eventId: string;
  raceId?: string;
  practiceSessionId?: string;
};

/**
 * Example usage:
 *
 * ```typescript
 * // Creating a calendar event for a race
 * const raceCalendarEvent: CalendarEvent = {
 *   eventId: 'cal_550e8400-e29b-41d4-a716-446655440000',
 *   raceId: '550e8400-e29b-41d4-a716-446655440000',
 *   practiceSessionId: null,
 *   title: 'LMU Race: Circuit de la Sarthe - Hypercar',
 *   location: 'Circuit de la Sarthe',
 *   startTime: '2024-03-15T14:15:00', // 15 min before 14:30 start
 *   endTime: '2024-03-15T15:30:00',   // 14:15 + 45 min + 15 min buffer
 *   description: 'Hypercar race at Circuit de la Sarthe\nWeather: Dynamic\nTime: Afternoon\nLicense: Silver',
 *   calendarId: 'primary',
 *   createdAt: '2024-03-10T10:30:00Z'
 * };
 *
 * // Creating a calendar event for a practice session
 * const practiceCalendarEvent: CalendarEvent = {
 *   eventId: 'cal_550e8400-e29b-41d4-a716-446655440001',
 *   raceId: null,
 *   practiceSessionId: 'ps_550e8400-e29b-41d4-a716-446655440000',
 *   title: 'Practice: Qualifying Simulation - Spa',
 *   location: 'Spa-Francorchamps',
 *   startTime: '2024-03-13T14:15:00',
 *   endTime: '2024-03-13T14:45:00',
 *   description: 'Qualifying Simulation practice session\nDuration: 30 minutes\nWeather: Dynamic',
 *   calendarId: 'primary',
 *   createdAt: '2024-03-10T10:30:00Z'
 * };
 *
 * // Validation helper: ensure one of raceId or practiceSessionId is set
 * function isValidCalendarEvent(event: CalendarEvent): boolean {
 *   const hasRace = event.raceId !== null;
 *   const hasPractice = event.practiceSessionId !== null;
 *   return (hasRace && !hasPractice) || (!hasRace && hasPractice);
 * }
 *
 * // Validation helper: ensure start time is before end time
 * function hasValidTimeRange(event: CalendarEvent): boolean {
 *   return new Date(event.startTime) < new Date(event.endTime);
 * }
 * ```
 */
