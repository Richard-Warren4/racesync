/**
 * Favorite entity representing a user's favorited race
 */
export interface Favorite {
  /**
   * ID of the race that is favorited
   */
  raceId: string;

  /**
   * Timestamp when the race was favorited
   */
  favoritedAt: Date;

  /**
   * Whether notifications are enabled for this favorited race
   */
  notificationEnabled: boolean;
}
