# RaceSync

A React Native mobile app for tracking race schedules and managing favorites.

## Features

### User Story 5: Favorite Races for Quick Access ✅

- **Favorite/Unfavorite Races**: Tap the star icon on any race card to add it to favorites
- **Persistent Favorites**: Favorites are saved to device storage and persist across app restarts
- **Smart Filtering**: Filter races to show only your favorited races
- **Automatic Cleanup**: Favorites are automatically removed when races are deleted from the schedule
- **Schedule Updates**: Favorite status is preserved when race details are updated

## Project Structure

```
racesync/
├── src/
│   ├── features/
│   │   ├── favorites/
│   │   │   ├── components/
│   │   │   │   └── FavoriteButton.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useFavorites.ts
│   │   │   ├── services/
│   │   │   │   ├── FavoritesRepository.ts
│   │   │   │   └── AsyncStorageFavoritesRepository.ts
│   │   │   └── types/
│   │   │       └── Favorite.ts
│   │   └── schedules/
│   │       ├── components/
│   │       │   └── RaceCard.tsx
│   │       ├── services/
│   │       │   ├── ScheduleMerger.ts
│   │       │   └── RaceFilter.ts
│   │       └── types/
│   │           └── Race.ts
│   └── shared/
│       └── constants/
│           └── storageKeys.ts
├── __tests__/
│   ├── unit/
│   │   └── features/
│   │       ├── favorites/
│   │       │   └── services/
│   │       │       └── FavoritesRepository.test.ts
│   │       └── schedules/
│   │           └── services/
│   │               └── ScheduleMerger.test.ts
│   └── integration/
│       └── favorites-persistence.test.ts
└── specs/
    └── 001-lmu-schedule-tracker/
        └── tasks.md
```

## Technology Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Strict type checking (no `any` types)
- **AsyncStorage**: Persistent local storage
- **Jest**: Testing framework
- **React Testing Library**: Component testing

## Development

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test:unit

# Run integration tests only
npm test:integration
```

### TypeScript

This project uses TypeScript strict mode. All code is fully typed with no `any` types used.

## Key Components

### FavoriteButton

A reusable button component that displays a star icon and toggles favorite status.

- **Location**: `src/features/favorites/components/FavoriteButton.tsx`
- **Props**: `raceId`, `size`, `favoritedColor`, `unfavoritedColor`, `onToggle`, `enableNotifications`
- **Size**: 115 lines (under 200 line requirement)

### useFavorites Hook

React hook for managing favorite state and persistence.

- **Location**: `src/features/favorites/hooks/useFavorites.ts`
- **Returns**: `favorites`, `isLoading`, `isFavorite`, `toggleFavorite`, `addFavorite`, `removeFavorite`, `refresh`

### FavoritesRepository

Interface for managing favorite persistence with AsyncStorage implementation.

- **Interface**: `src/features/favorites/services/FavoritesRepository.ts`
- **Implementation**: `src/features/favorites/services/AsyncStorageFavoritesRepository.ts`
- **Storage Key**: `racesync:favorites`

## Data Models

### Race

```typescript
interface Race {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  location: string;
  category: string;
  description?: string;
  isFavorited?: boolean;
}
```

### Favorite

```typescript
interface Favorite {
  raceId: string;
  favoritedAt: Date;
  notificationEnabled: boolean;
}
```

## Testing

All features are developed using Test-Driven Development (TDD):

1. ✅ Unit tests for FavoritesRepository
2. ✅ Unit tests for ScheduleMerger with favorites
3. ✅ Integration tests for favorites persistence

## License

MIT
