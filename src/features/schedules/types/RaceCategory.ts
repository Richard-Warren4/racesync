/**
 * Race category entity for classification and filtering
 *
 * Represents the static categorization system for races with associated
 * visual styling and filter keys. These are predefined constants, not
 * persisted in storage.
 *
 * @see specs/001-lmu-schedule-tracker/data-model.md for complete specifications
 */

/**
 * Category name classification
 */
export type CategoryName = 'Daily' | 'Weekly' | 'Special';

/**
 * Filter key for race filtering operations
 */
export type FilterKey = 'daily' | 'weekly' | 'special' | 'all' | 'favorites';

/**
 * Hexadecimal color code for category visual styling
 * Must be 6-digit hex format
 */
export type ColorCode = string;

/**
 * Race category definition with styling and filtering metadata
 */
export interface RaceCategory {
  /**
   * Classification identifier
   */
  name: CategoryName;

  /**
   * Visual styling color in hexadecimal format
   * Daily: #2563eb (blue)
   * Weekly: #14b8a6 (teal)
   * Special: #dc2626 (red)
   */
  colorCode: ColorCode;

  /**
   * Filter key for querying races by category
   */
  filterKey: FilterKey;
}

/**
 * Predefined category constants
 * These are static values, not stored in AsyncStorage
 */
export const RACE_CATEGORIES: Record<CategoryName, RaceCategory> = {
  Daily: {
    name: 'Daily',
    colorCode: '#2563eb',
    filterKey: 'daily',
  },
  Weekly: {
    name: 'Weekly',
    colorCode: '#14b8a6',
    filterKey: 'weekly',
  },
  Special: {
    name: 'Special',
    colorCode: '#dc2626',
    filterKey: 'special',
  },
};

/**
 * Helper function to get category by filter key
 */
export const getCategoryByFilterKey = (filterKey: FilterKey): RaceCategory | undefined => {
  if (filterKey === 'all' || filterKey === 'favorites') {
    return undefined;
  }

  const categoryName = filterKey.charAt(0).toUpperCase() + filterKey.slice(1) as CategoryName;
  return RACE_CATEGORIES[categoryName];
};

/**
 * Example usage:
 *
 * ```typescript
 * // Using predefined constants
 * const dailyCategory = RACE_CATEGORIES.Daily;
 * console.log(dailyCategory.colorCode); // "#2563eb"
 *
 * // Creating a custom category reference
 * const category: RaceCategory = {
 *   name: 'Weekly',
 *   colorCode: '#14b8a6',
 *   filterKey: 'weekly'
 * };
 *
 * // Getting category by filter key
 * const foundCategory = getCategoryByFilterKey('special');
 * if (foundCategory) {
 *   console.log(foundCategory.name); // "Special"
 *   console.log(foundCategory.colorCode); // "#dc2626"
 * }
 *
 * // Filter keys for UI
 * const allFilterKeys: FilterKey[] = ['all', 'daily', 'weekly', 'special', 'favorites'];
 * ```
 */
