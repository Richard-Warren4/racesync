/**
 * Favorite entity for tracking user-favorited races
 *
 * Represents a user's favorited race with notification preferences.
 * Favorites are stored in AsyncStorage under the key `racesync:favorites`
 * as a JSON array.
 *
 * State transitions:
 * - Created: When user taps star icon on a race
 * - Deleted: When user untaps star OR when the associated race is removed
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Favorite race entry with notification settings
 */
export interface Favorite {
  /**
   * References the Race.id of the favorited race
   * Must reference an existing race entity
   */
  raceId: string;

  /**
   * Timestamp when the race was favorited
   * ISO 8601 UTC format
   * @example "2024-03-15T10:30:00Z"
   */
  favoritedAt: string;

  /**
   * Whether 15-minute reminder notifications are enabled for this race
   * When true, a notification will be scheduled 15 minutes before race start
   */
  notificationEnabled: boolean;
}

/**
 * AsyncStorage key for favorites persistence
 */
export const FAVORITES_STORAGE_KEY = 'racesync:favorites';

/**
 * Helper type for favorites collection
 */
export type FavoritesCollection = Favorite[];

/**
 * Example usage:
 *
 * ```typescript
 * // Creating a new favorite when user taps star icon
 * const newFavorite: Favorite = {
 *   raceId: '550e8400-e29b-41d4-a716-446655440000',
 *   favoritedAt: new Date().toISOString(),
 *   notificationEnabled: true
 * };
 *
 * // Storing favorites in AsyncStorage
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * async function saveFavorites(favorites: FavoritesCollection): Promise<void> {
 *   await AsyncStorage.setItem(
 *     FAVORITES_STORAGE_KEY,
 *     JSON.stringify(favorites)
 *   );
 * }
 *
 * async function loadFavorites(): Promise<FavoritesCollection> {
 *   const data = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
 *   return data ? JSON.parse(data) : [];
 * }
 *
 * // Adding a favorite
 * const favorites = await loadFavorites();
 * favorites.push(newFavorite);
 * await saveFavorites(favorites);
 *
 * // Removing a favorite (when user untaps or race is deleted)
 * const updatedFavorites = favorites.filter(f => f.raceId !== '550e8400-e29b-41d4-a716-446655440000');
 * await saveFavorites(updatedFavorites);
 *
 * // Checking if a race is favorited
 * const isFavorited = (raceId: string, favorites: FavoritesCollection): boolean => {
 *   return favorites.some(f => f.raceId === raceId);
 * };
 *
 * // Toggling notification for a favorite
 * const toggleNotification = (raceId: string, favorites: FavoritesCollection): FavoritesCollection => {
 *   return favorites.map(f =>
 *     f.raceId === raceId
 *       ? { ...f, notificationEnabled: !f.notificationEnabled }
 *       : f
 *   );
 * };
 * ```
 */
