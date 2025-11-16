/**
 * Notification entity for scheduled alerts
 *
 * Represents scheduled push notifications for races and practice sessions.
 * Notifications are tracked via `racesync:scheduled-notifications` in AsyncStorage
 * to maintain mappings between platform notification IDs and app entities.
 *
 * Timing rules:
 * - Favorite reminders: 15 minutes before race start
 * - Calendar reminders: 1 hour before race start (weekly/special races only)
 * - Practice reminders: At practice session start time
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Type of notification
 */
export type NotificationType = 'favorite-reminder' | 'calendar-reminder' | 'practice-reminder';

/**
 * Notification delivery status
 */
export type DeliveryStatus = 'scheduled' | 'delivered' | 'cancelled';

/**
 * Scheduled notification for race or practice session
 */
export interface Notification {
  /**
   * Platform-specific notification identifier
   * Assigned by the device's notification system
   */
  id: string;

  /**
   * Type of notification
   */
  notificationType: NotificationType;

  /**
   * Scheduled delivery timestamp
   * ISO 8601 UTC format
   * Must be in the future when notification is created
   * @example "2024-03-15T14:15:00Z" (15 min before 14:30 race)
   */
  triggerTime: string;

  /**
   * Notification heading displayed to user
   * @example "Race Starting Soon!"
   * @example "Practice Session Reminder"
   */
  title: string;

  /**
   * Notification body content
   * @example "Your Hypercar race at Circuit de la Sarthe starts in 15 minutes"
   * @example "Track Familiarization session starts now"
   */
  body: string;

  /**
   * Reference to associated Race.id
   * Null if this notification is for a practice session only
   * Note: One of raceId or practiceSessionId must be non-null
   */
  raceId: string | null;

  /**
   * Reference to associated PracticeSession.id
   * Null if this notification is for a race
   * Note: One of raceId or practiceSessionId must be non-null
   */
  practiceSessionId: string | null;

  /**
   * Current delivery status
   */
  deliveryStatus: DeliveryStatus;
}

/**
 * AsyncStorage key for notification mappings
 */
export const NOTIFICATIONS_STORAGE_KEY = 'racesync:scheduled-notifications';

/**
 * Helper type for notifications collection
 */
export type NotificationsCollection = Notification[];

/**
 * Notification timing constants (in minutes)
 */
export const NOTIFICATION_TIMING = {
  FAVORITE_REMINDER: 15,        // 15 minutes before race
  CALENDAR_REMINDER: 60,        // 1 hour before race (weekly/special only)
  PRACTICE_REMINDER: 0,         // At practice session start time
} as const;

/**
 * Example usage:
 *
 * ```typescript
 * import { Race } from '../../schedules/types/Race';
 * import { PracticeSession } from '../../calendar/types/PracticeSession';
 *
 * // Creating a favorite reminder notification
 * function createFavoriteReminder(race: Race): Notification {
 *   const raceStart = new Date(race.startTime);
 *   const triggerTime = new Date(raceStart.getTime() - NOTIFICATION_TIMING.FAVORITE_REMINDER * 60000);
 *
 *   return {
 *     id: `notif_fav_${race.id}`,
 *     notificationType: 'favorite-reminder',
 *     triggerTime: triggerTime.toISOString(),
 *     title: 'Race Starting Soon!',
 *     body: `Your ${race.carClass} race at ${race.trackName} starts in 15 minutes`,
 *     raceId: race.id,
 *     practiceSessionId: null,
 *     deliveryStatus: 'scheduled',
 *   };
 * }
 *
 * // Creating a calendar reminder notification (weekly/special only)
 * function createCalendarReminder(race: Race): Notification | null {
 *   if (race.type === 'daily') {
 *     return null; // Calendar reminders only for weekly/special
 *   }
 *
 *   const raceStart = new Date(race.startTime);
 *   const triggerTime = new Date(raceStart.getTime() - NOTIFICATION_TIMING.CALENDAR_REMINDER * 60000);
 *
 *   return {
 *     id: `notif_cal_${race.id}`,
 *     notificationType: 'calendar-reminder',
 *     triggerTime: triggerTime.toISOString(),
 *     title: 'Race in 1 Hour',
 *     body: `${race.carClass} race at ${race.trackName} starts at ${new Date(race.startTime).toLocaleTimeString()}`,
 *     raceId: race.id,
 *     practiceSessionId: null,
 *     deliveryStatus: 'scheduled',
 *   };
 * }
 *
 * // Creating a practice session reminder
 * function createPracticeReminder(session: PracticeSession, race: Race): Notification {
 *   return {
 *     id: `notif_practice_${session.id}`,
 *     notificationType: 'practice-reminder',
 *     triggerTime: session.suggestedStartTime,
 *     title: 'Practice Session Reminder',
 *     body: `${session.sessionType} session for ${race.trackName} starts now`,
 *     raceId: race.id,
 *     practiceSessionId: session.id,
 *     deliveryStatus: 'scheduled',
 *   };
 * }
 *
 * // Validation: Ensure trigger time is in the future
 * function isValidNotification(notification: Notification): boolean {
 *   const triggerTime = new Date(notification.triggerTime);
 *   const now = new Date();
 *   return triggerTime > now;
 * }
 *
 * // Validation: Ensure one of raceId or practiceSessionId is set
 * function hasValidReference(notification: Notification): boolean {
 *   const hasRace = notification.raceId !== null;
 *   const hasPractice = notification.practiceSessionId !== null;
 *   return (hasRace || hasPractice) && !(hasRace && hasPractice);
 * }
 *
 * // Update notification status after delivery
 * function markAsDelivered(notification: Notification): Notification {
 *   return {
 *     ...notification,
 *     deliveryStatus: 'delivered',
 *   };
 * }
 *
 * // Cancel a scheduled notification
 * function cancelNotification(notification: Notification): Notification {
 *   return {
 *     ...notification,
 *     deliveryStatus: 'cancelled',
 *   };
 * }
 * ```
 */
