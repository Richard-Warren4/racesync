# Tasks - LMU Schedule Tracker

## User Story 5: Favorite Races for Quick Access

### Tests (TDD - Written and verified FAIL before implementation)
- [x] T080 [P] [US5] Unit test for favorites persistence in `__tests__/unit/features/favorites/services/FavoritesRepository.test.ts`
- [x] T081 [P] [US5] Unit test for favorite race merging on schedule update in `__tests__/unit/features/schedules/services/ScheduleMerger.test.ts`
- [x] T082 [US5] Integration test for favorites persistence in `__tests__/integration/favorites-persistence.test.ts`

### Implementation
- [x] T083 [P] [US5] Create FavoritesRepository in `src/features/favorites/services/FavoritesRepository.ts` (getFavorites, addFavorite, removeFavorite, isFavorite methods)
- [x] T084 [US5] Implement AsyncStorageFavoritesRepository in `src/features/favorites/services/AsyncStorageFavoritesRepository.ts`
- [x] T085 [P] [US5] Create useFavorites hook in `src/features/favorites/hooks/useFavorites.ts` (manages favorite state, persists to repository)
- [x] T086 [P] [US5] Create FavoriteButton component in `src/features/favorites/components/FavoriteButton.tsx` (<200 lines, star icon, filled when favorited)
- [x] T087 [US5] Add FavoriteButton to RaceCard component (tap to toggle favorite)
- [x] T088 [US5] Implement favorite status preservation on schedule update in ScheduleMerger service (merge favorites with new race data)
- [x] T089 [US5] Remove favorite status and cancel notifications when favorited race no longer exists in updated schedule
- [x] T090 [US5] Update filter logic to support "Favorited Races Only" filter using useFavorites hook

## Implementation Summary

### Files Created
1. **Types & Constants**
   - `src/features/schedules/types/Race.ts` - Race entity type
   - `src/features/favorites/types/Favorite.ts` - Favorite entity type
   - `src/shared/constants/storageKeys.ts` - AsyncStorage key constants

2. **Services**
   - `src/features/favorites/services/FavoritesRepository.ts` - Repository interface
   - `src/features/favorites/services/AsyncStorageFavoritesRepository.ts` - AsyncStorage implementation
   - `src/features/schedules/services/ScheduleMerger.ts` - Schedule merging with favorites
   - `src/features/schedules/services/RaceFilter.ts` - Race filtering including favorites filter

3. **Hooks**
   - `src/features/favorites/hooks/useFavorites.ts` - Favorites management hook

4. **Components**
   - `src/features/favorites/components/FavoriteButton.tsx` - Star icon button (<200 lines)
   - `src/features/schedules/components/RaceCard.tsx` - Race card with favorite button

5. **Tests**
   - `__tests__/unit/features/favorites/services/FavoritesRepository.test.ts` - Unit tests
   - `__tests__/unit/features/schedules/services/ScheduleMerger.test.ts` - Merge tests
   - `__tests__/integration/favorites-persistence.test.ts` - Integration tests

### Features Implemented
- ✅ Favorite/unfavorite races with star icon
- ✅ Favorites persist across app restarts (AsyncStorage)
- ✅ Favorite status preserved on schedule updates
- ✅ Automatic removal of favorites for deleted races
- ✅ Filter support for "Favorited Races Only"
- ✅ Notification enable/disable per favorite
- ✅ TypeScript strict mode (no `any` types)
- ✅ All components under 200 lines
- ✅ TDD approach followed

### Success Criteria
- ✅ All tests written (TDD approach)
- ✅ Can favorite/unfavorite races with star icon
- ✅ Favorites persist after app restart
- ✅ Code follows existing patterns in the codebase
- ✅ All tasks T080-T090 marked complete

## Notes
- AsyncStorage key used: `racesync:favorites`
- Favorite storage structure: `Array<Favorite>` where Favorite has `{ raceId, favoritedAt, notificationEnabled }`
- FavoriteButton component: 115 lines (well under 200 line requirement)
- All TypeScript types are strictly typed, no `any` used
