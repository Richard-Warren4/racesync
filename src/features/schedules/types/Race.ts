/**
 * Race entity representing a single race event
 */
export interface Race {
  /**
   * Unique identifier for the race
   */
  id: string;

  /**
   * Name of the race event
   */
  name: string;

  /**
   * Date and time when the race starts
   */
  startTime: Date;

  /**
   * Date and time when the race ends
   */
  endTime: Date;

  /**
   * Location where the race takes place
   */
  location: string;

  /**
   * Category/type of the race (e.g., "Varsity", "JV", "Novice")
   */
  category: string;

  /**
   * Optional description or notes about the race
   */
  description?: string;

  /**
   * Whether this race is favorited by the user
   * This field is managed by the favorites feature
   */
  isFavorited?: boolean;
}
