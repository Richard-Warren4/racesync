# Research: Le Mans Ultimate Race Schedule Tracker

**Date**: 2025-11-15
**Feature**: 001-lmu-schedule-tracker
**Purpose**: Research technical decisions, dependencies, and best practices for mobile race schedule tracking application

## Dependencies Research

### Core Framework & Language

**Decision**: React Native 0.73+ with TypeScript 5.x strict mode

**Rationale**:
- React Native provides true cross-platform mobile development (iOS + Android from single codebase)
- Native performance for 60fps scrolling requirement
- Large ecosystem with mature calendar/notification integrations
- TypeScript strict mode enforces type safety required by constitution
- Active community support and regular updates

**Alternatives Considered**:
- Flutter: Rejected - team would need to learn Dart, less mature calendar integration libraries
- Native iOS/Android separate apps: Rejected - violates DRY principle, doubles maintenance burden
- Expo: Considered for future - bare workflow React Native chosen for full native module access

### Storage Solution

**Decision**: AsyncStorage for MVP, migrate to SQLite when data > 5MB

**Rationale**:
- AsyncStorage is React Native's standard key-value storage
- Sufficient for favorites (race IDs) and 24h cached schedule data
- Simple async API fits hooks pattern
- SQLite migration path clear when data volume grows

**Alternatives Considered**:
- Realm: Rejected - overkill for simple key-value needs in MVP
- SQLite from start: Rejected - unnecessary complexity for MVP data volume
- Redux Persist: Rejected - adds state management complexity unnecessarily

### Calendar Integration

**Decision**: react-native-calendar-events v2.2+

**Rationale**:
- De facto standard for React Native calendar access
- Supports both iOS EventKit and Android Calendar Provider
- Permission handling built-in
- Active maintenance, 2M+ weekly downloads
- Write-only access matches privacy-first constitution requirement

**Alternatives Considered**:
- @react-native-community/calendar: Deprecated, not maintained
- Manual native module: Rejected - reinventing wheel, maintenance burden

### Notifications

**Decision**: @notifee/react-native v7.8+

**Rationale**:
- Most feature-rich React Native notification library
- Supports local scheduled notifications on iOS and Android
- Fine-grained control over timing (15 min before favorites, 1h before special events)
- Handles notification permissions correctly
- Better Android support than alternatives (channels, badges, etc.)

**Alternatives Considered**:
- react-native-push-notification: Rejected - less active maintenance, Android issues
- Firebase Cloud Messaging: Rejected - requires backend, overkill for local notifications

### Navigation

**Decision**: React Navigation v6.x

**Rationale**:
- Official React Native navigation solution
- Declarative API fits React patterns
- Stack, tab, and drawer navigation out of box
- Platform-specific behaviors (iOS swipe-back gestures, Android back button)
- Extensive documentation and community support

**Alternatives Considered**:
- React Native Navigation (Wix): Rejected - native navigation more complex, less React-like
- Expo Router: Rejected - file-based routing unnecessary for 20-30 screen app

### Date/Time Handling

**Decision**: date-fns v3.0+ (no moment.js)

**Rationale**:
- Lightweight (13KB vs moment's 67KB) - critical for 10MB bundle target
- Tree-shakeable - only import functions used
- Immutable - prevents timezone bugs
- TypeScript-first with excellent type definitions
- UTC and timezone conversion utilities

**Alternatives Considered**:
- Moment.js: Rejected - deprecated, too heavy for mobile
- Day.js: Considered - date-fns chosen for better TypeScript support
- Luxon: Rejected - heavier than date-fns, more complexity than needed

### Testing Framework

**Decision**: Jest + React Native Testing Library + Detox (E2E)

**Rationale**:
- Jest is React Native default, zero config
- React Native Testing Library encourages testing user behavior not implementation
- Detox provides gray-box E2E testing on real devices/simulators
- Aligns with TDD constitution requirement

**Alternatives Considered**:
- Enzyme: Rejected - encourages implementation testing, not maintained for React 18+
- Appium: Rejected - slower than Detox, more brittle

## Technical Patterns Research

### Offline-First Architecture

**Decision**: Cache-first with background sync

**Pattern**:
1. On app launch: Read from AsyncStorage immediately (instant display)
2. Check if cache is stale (>24h old)
3. If stale: Background fetch new schedule, update AsyncStorage, re-render
4. Pull-to-refresh: Manual refresh trigger anytime

**Rationale**:
- Meets 5-second load requirement (no network wait)
- Graceful degradation when offline
- Simple caching strategy (24h TTL)
- Aligns with mobile-first UX principles

**Implementation Notes**:
- Store `lastUpdated` timestamp with cached data
- Display "Last updated X ago" indicator to user
- Exponential backoff on failed refreshes

### Repository Pattern for Data Access

**Decision**: Repository classes abstract storage implementation

**Pattern**:
```typescript
interface ScheduleRepository {
  getSchedule(): Promise<Race[]>
  getCachedSchedule(): Promise<Race[] | null>
  saveSchedule(races: Race[]): Promise<void>
  getLastUpdated(): Promise<Date | null>
}

interface FavoritesRepository {
  getFavorites(): Promise<string[]> // race IDs
  addFavorite(raceId: string): Promise<void>
  removeFavorite(raceId: string): Promise<void>
  isFavorite(raceId: string): Promise<boolean>
}
```

**Rationale**:
- Abstracts AsyncStorage implementation details
- Easy to swap SQLite later without changing feature code
- Testable - mock repositories in unit tests
- Single responsibility - repositories handle persistence only

**Alternatives Considered**:
- Direct AsyncStorage calls in components: Rejected - tight coupling, hard to test
- Redux with Redux Persist: Rejected - unnecessary complexity for data access needs

### Timezone Handling

**Decision**: Store all race times in UTC, convert to local timezone on display

**Pattern**:
- Backend/sample data provides race times in UTC
- Calculate local time on device using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Re-calculate countdown timers when timezone changes (via AppState listener)

**Rationale**:
- UTC is universal source of truth
- Handles daylight saving time correctly
- Device timezone detection automatic
- Supports users traveling across timezones

**Critical Test Cases**:
- Countdown displays correctly in multiple timezones
- Race time recalculates when device timezone changes
- DST transitions don't break display

### Race Schedule Update Merging

**Decision**: Merge strategy - preserve favorites, update race details

**Pattern**:
1. Fetch new schedule from source
2. Load existing favorites from AsyncStorage
3. Match favorites to new schedule by race ID
4. If race still exists: Update details, keep favorite
5. If race no longer exists: Remove favorite, cancel notifications
6. Update calendar events with new race times (if permissions granted)

**Rationale**:
- User favorites are valuable - don't delete unnecessarily
- Race details can change (track, time) - need fresh data
- Calendar sync keeps user's calendar accurate

**Implementation Notes**:
- Race ID must be stable across updates (use UUID or composite key)
- Calendar event updates require calendar write permission
- Notify user if favorited race is cancelled/removed

### Component Size Management

**Decision**: Extract sub-components when approaching 150 lines (buffer before 200 limit)

**Pattern**:
- RaceCard component splits into: RaceCardHeader, RaceCardDetails, RaceCardActions
- ScheduleScreen splits into: ScheduleHeader, RaceList, FilterBar
- Co-locate extracted components in same feature directory

**Rationale**:
- 150-line trigger provides buffer before hard 200 limit
- Smaller components easier to test and understand
- Encourages single responsibility

**Alternatives Considered**:
- Wait until 200 lines: Rejected - no buffer for iteration
- 100-line limit: Rejected - too strict, excessive component fragmentation

## Performance Optimization Research

### List Virtualization

**Decision**: FlatList with `windowSize` optimization

**Pattern**:
```typescript
<FlatList
  data={races}
  renderItem={({ item }) => <RaceCard race={item} />}
  keyExtractor={(item) => item.id}
  windowSize={10} // Render 10 screens worth
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
/>
```

**Rationale**:
- FlatList virtualizes off-screen items (memory efficient)
- windowSize balances smooth scrolling vs memory
- Meets 60fps scrolling requirement

**Alternatives Considered**:
- ScrollView with all items: Rejected - memory issues with 50+ races
- SectionList: Considered for future race grouping, FlatList sufficient for MVP

### Skeleton Loading States

**Decision**: Shimmer placeholders with react-native-shimmer-placeholder

**Pattern**:
- Display 5-8 skeleton race cards immediately on launch
- Replace with real data when AsyncStorage read completes
- Animate transition from skeleton to real content

**Rationale**:
- Perceived performance improvement (instant visual feedback)
- Industry standard (Facebook, LinkedIn use skeletons)
- Better UX than blank screen or spinner

**Implementation Notes**:
- Skeleton count matches typical viewport (5-8 cards visible)
- Shimmer animation duration 1.5s for smooth effect

### Bundle Size Optimization

**Decision**: Code splitting with React lazy loading for non-critical features

**Pattern**:
- Core features (schedule view, favorites) in main bundle
- Practice planner lazy-loaded (P3 priority feature)
- Settings screens lazy-loaded
- Use React.lazy() and Suspense

**Rationale**:
- Keeps initial bundle <10MB (constitution requirement)
- Faster initial load for P1 features
- Premium features loaded on-demand

## Sample Data Structure

**Decision**: Embedded JSON file with realistic Le Mans Ultimate race patterns

**Structure**:
```json
{
  "dailyRaces": {
    "raceA": {
      "tier": "beginner",
      "carClass": "LMP2",
      "duration": 15,
      "interval": 40,
      "tracks": ["Monza", "Spa", "Le Mans"]
    },
    "raceB": {
      "tier": "intermediate",
      "carClass": "Hypercar",
      "duration": 20,
      "interval": 40
    },
    "raceC": {
      "tier": "advanced",
      "carClass": "Multi-class",
      "duration": 30,
      "interval": 60
    }
  },
  "weeklyRaces": [
    {
      "day": "Tuesday",
      "time": "19:00 UTC",
      "duration": 45,
      "track": "Spa"
    }
  ],
  "specialEvents": [
    {
      "name": "6 Hours of Spa",
      "date": "2025-12-15T14:00:00Z",
      "duration": 360
    }
  ]
}
```

**Rationale**:
- Mirrors Le Mans Ultimate actual race patterns (40-min daily intervals)
- Realistic for testing and demos
- Easy to update without code changes
- Prepares for future API integration (same structure)

## Summary of Key Decisions

| Area | Decision | Why |
|------|----------|-----|
| Framework | React Native 0.73+ | Cross-platform, native performance, constitution compliant |
| Language | TypeScript 5.x strict | Type safety, constitution requirement |
| Storage | AsyncStorage → SQLite | Simple for MVP, clear migration path |
| Calendar | react-native-calendar-events | Standard library, write-only privacy |
| Notifications | @notifee/react-native | Best local notification support |
| Navigation | React Navigation v6 | Official solution, declarative |
| Date/Time | date-fns v3 | Lightweight, tree-shakeable, timezone support |
| Testing | Jest + RNTL + Detox | TDD-friendly, user-behavior focused |
| Architecture | Offline-first cache | 5s load target, works offline |
| Data Pattern | Repository pattern | Testable, swappable storage |
| Timezone | UTC storage, local display | Handles DST, timezone changes |
| Performance | FlatList + lazy loading | 60fps scrolling, <10MB bundle |

**No unresolved NEEDS CLARIFICATION items remain.** All technical decisions documented with rationale.
