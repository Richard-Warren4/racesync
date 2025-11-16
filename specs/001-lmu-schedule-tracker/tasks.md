---

description: "Task list for Le Mans Ultimate Race Schedule Tracker implementation"
---

# Tasks: Le Mans Ultimate Race Schedule Tracker

**Input**: Design documents from `/specs/001-lmu-schedule-tracker/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD is mandatory per constitution. Tests MUST be written and verified to fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile React Native**: `src/features/`, `src/shared/`, `__tests__/`
- Feature-based organization: schedules, favorites, calendar, notifications
- Tests co-located with implementation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize React Native project with TypeScript template in project root
- [ ] T002 Configure TypeScript strict mode in tsconfig.json with all strict flags enabled
- [ ] T003 [P] Install core dependencies: react-native@0.73+, react-navigation@6+, date-fns@3+
- [ ] T004 [P] Install storage dependencies: @react-native-async-storage/async-storage
- [ ] T005 [P] Install calendar dependencies: react-native-calendar-events@2.2+
- [ ] T006 [P] Install notification dependencies: @notifee/react-native@7.8+
- [ ] T007 [P] Install testing dependencies: jest, @testing-library/react-native, detox
- [ ] T008 [P] Configure ESLint with React Native and TypeScript rules in .eslintrc.js
- [ ] T009 [P] Configure Prettier with 100-char line width in .prettierrc
- [ ] T010 Create feature-based directory structure: src/features/{schedules,favorites,calendar,notifications}
- [ ] T011 Create shared directory structure: src/shared/{components,hooks,utils,constants}
- [ ] T012 Create test directory structure: __tests__/{unit,integration,e2e}
- [ ] T013 [P] Configure Jest for React Native in jest.config.js
- [ ] T014 [P] Configure Detox for E2E testing in .detoxrc.json (iOS and Android)
- [ ] T015 Create src/shared/constants/raceTypes.ts with race category constants (daily/weekly/special colors)
- [ ] T016 Create src/shared/constants/spacing.ts with consistent spacing values for mobile UI

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T017 Create TypeScript types in src/features/schedules/types/Race.ts (Race interface with all 17 attributes from data-model.md)
- [x] T018 [P] Create TypeScript types in src/features/schedules/types/RaceCategory.ts (RaceCategory interface)
- [x] T019 [P] Create TypeScript types in src/features/favorites/types/Favorite.ts (Favorite interface)
- [x] T020 [P] Create TypeScript types in src/features/calendar/types/CalendarEvent.ts (CalendarEvent interface)
- [x] T021 [P] Create TypeScript types in src/features/calendar/types/PracticeSession.ts (PracticeSession interface)
- [x] T022 [P] Create TypeScript types in src/features/notifications/types/Notification.ts (Notification interface)
- [x] T023 Create sample race data in src/data/sampleSchedule.json matching data-model.md structure (Daily A/B/C, Weekly, Special)
- [x] T024 Create AsyncStorage keys constants in src/shared/constants/storageKeys.ts (racesync:schedule, racesync:favorites, etc.)
- [x] T025 Create src/shared/utils/dateUtils.ts with isValidISOString, parseUTC, formatLocalTime functions
- [x] T026 Create src/shared/utils/timezoneUtils.ts with getDeviceTimezone, convertUTCToLocal, recalculateOnTimezoneChange functions
- [x] T027 Create src/shared/utils/formatters.ts with formatCountdown, formatDuration, formatRaceTitle helper functions
- [x] T028 Create src/navigation/AppNavigator.tsx with React Navigation stack navigator setup
- [x] T029 Create src/App.tsx root component with navigation container and error boundary

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Today's Race Schedule (Priority: P1) 🎯 MVP

**Goal**: Users can view race schedule within 5 seconds of app launch with skeleton loading, categorized races, real-time countdowns, and color-coded race types

**Independent Test**: Launch app and verify race schedule displays within 5 seconds with accurate countdown timers, correctly sorted races, skeleton placeholders during load, and proper color coding (blue/teal/red)

### Tests for User Story 1 (TDD - Write and verify FAIL before implementation) ⚠️

- [x] T030 [P] [US1] Unit test for Race type validation in __tests__/unit/features/schedules/types/Race.test.ts
- [x] T031 [P] [US1] Unit test for countdown calculation in __tests__/unit/shared/utils/formatters.test.ts (test multiple time ranges)
- [x] T032 [P] [US1] Unit test for timezone conversion in __tests__/unit/shared/utils/timezoneUtils.test.ts (test DST, timezone changes)
- [x] T033 [P] [US1] Unit test for isLive calculation in __tests__/unit/shared/utils/dateUtils.test.ts (test race start/end boundaries)
- [x] T034 [P] [US1] Unit test for race sorting by start time in __tests__/unit/features/schedules/utils/raceSorting.test.ts
- [x] T035 [P] [US1] Integration test for schedule data loading from AsyncStorage in __tests__/integration/schedule-cache.test.ts
- [x] T036 [P] [US1] Integration test for schedule refresh on stale data in __tests__/integration/schedule-refresh.test.ts
- [x] T037 [US1] E2E test for race schedule view in __tests__/e2e/race-schedule-view.e2e.ts (launch app, verify 5s load, check race cards)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 1

- [x] T038 [P] [US1] Create ScheduleRepository interface in src/features/schedules/services/ScheduleRepository.ts (getSchedule, getCachedSchedule, saveSchedule, getLastUpdated methods)
- [x] T039 [US1] Implement AsyncStorageScheduleRepository in src/features/schedules/services/AsyncStorageScheduleRepository.ts (implements ScheduleRepository interface)
- [x] T040 [P] [US1] Create RaceDataParser service in src/features/schedules/services/RaceDataParser.ts (parse JSON to Race objects with validation)
- [x] T041 [US1] Create useRaceSchedule hook in src/features/schedules/hooks/useRaceSchedule.ts (loads from repository, manages loading state, handles refresh)
- [x] T042 [P] [US1] Create useCountdownTimer hook in src/features/schedules/hooks/useCountdownTimer.ts (updates every 60s, calculates countdown from race startTime)
- [x] T043 [P] [US1] Create SkeletonLoader component in src/features/schedules/components/SkeletonLoader.tsx (<200 lines, shimmer effect, 5-8 skeleton cards)
- [x] T044 [P] [US1] Create RaceCard component in src/features/schedules/components/RaceCard.tsx (<200 lines, displays race details with color coding)
- [x] T045 [US1] Create RaceList component in src/features/schedules/components/RaceList.tsx (FlatList with virtualization, windowSize=10, sorted by start time)
- [x] T046 [US1] Create ScheduleScreen in src/features/schedules/screens/ScheduleScreen.tsx (main screen, shows SkeletonLoader then RaceList, pull-to-refresh)
- [x] T047 [US1] Add pull-to-refresh functionality to ScheduleScreen using usePullToRefresh hook
- [x] T048 [US1] Implement automatic background refresh on app open when data stale (>24h) in useRaceSchedule hook
- [x] T049 [US1] Add "Last updated X ago" indicator to ScheduleScreen header
- [x] T050 [US1] Wire ScheduleScreen to AppNavigator as initial route

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view race schedules within 5 seconds with skeleton loading states.

---

## Phase 4: User Story 2 - Filter Race Schedule by Type (Priority: P2)

**Goal**: Users can filter races by type (All/Daily/Weekly/Special/Favorites) to quickly find races they care about

**Independent Test**: Apply each filter option (Daily Only, Weekly Only, Special Events Only, Favorited Races Only, All Races) and verify only matching races appear in the filtered list

### Tests for User Story 2 (TDD - Write and verify FAIL before implementation) ⚠️

- [x] T051 [P] [US2] Unit test for filter logic in __tests__/unit/features/schedules/utils/raceFilters.test.ts (test each filter type)
- [x] T052 [US2] Integration test for filter persistence in __tests__/integration/filter-persistence.test.ts (verify selected filter persists across app restarts)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 2

- [x] T053 [P] [US2] Create RaceFilter type in src/features/schedules/types/RaceFilter.ts ("all" | "daily" | "weekly" | "special" | "favorites")
- [x] T054 [P] [US2] Create useRaceFilters hook in src/features/schedules/hooks/useRaceFilters.ts (manages selected filter state, persists to AsyncStorage)
- [x] T055 [P] [US2] Create filter utility functions in src/features/schedules/utils/raceFilters.ts (filterByType, filterByFavorites)
- [x] T056 [P] [US2] Create FilterBar component in src/features/schedules/components/FilterBar.tsx (<200 lines, button group for filter options)
- [x] T057 [US2] Integrate FilterBar into ScheduleScreen above RaceList
- [x] T058 [US2] Update RaceList component to filter races based on selected filter from useRaceFilters hook
- [x] T059 [US2] Add visual indicator to FilterBar showing active filter

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can filter race schedule by type.

---

## Phase 5: User Story 3 - Add Race to Calendar (Priority: P2)

**Goal**: Users can add races to device calendar with 2 taps (tap race card, tap "Add to Calendar"), creating calendar event with 15-min buffer and race details

**Independent Test**: Tap "Add to Calendar" on race card, verify calendar event created with correct details (15-min buffer, race info in description), and race card shows checkmark indicator

### Tests for User Story 3 (TDD - Write and verify FAIL before implementation) ⚠️

- [ ] T060 [P] [US3] Unit test for calendar event creation in __tests__/unit/features/calendar/services/CalendarService.test.ts (verify 15-min buffer, description format)
- [ ] T061 [P] [US3] Unit test for calendar permission handling in __tests__/unit/features/calendar/hooks/useCalendarIntegration.test.ts
- [ ] T062 [US3] Integration test for calendar integration in __tests__/integration/calendar-integration.test.ts (create event, verify in calendar, test permission flows)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 3

- [ ] T063 [P] [US3] Create CalendarService in src/features/calendar/services/CalendarService.ts (requestPermission, createRaceEvent, updateRaceEvent methods)
- [ ] T064 [P] [US3] Create CalendarMappingRepository in src/features/calendar/services/CalendarMappingRepository.ts (track eventId to raceId associations in AsyncStorage)
- [ ] T065 [US3] Create useCalendarIntegration hook in src/features/calendar/hooks/useCalendarIntegration.ts (manages permissions, creates events, tracks mappings)
- [ ] T066 [P] [US3] Create CalendarButton component in src/features/calendar/components/CalendarButton.tsx (<200 lines, shows "Add to Calendar" or checkmark if added)
- [ ] T067 [US3] Add CalendarButton to RaceCard component (tap to add to calendar)
- [ ] T068 [US3] Implement "Add with practice sessions?" prompt dialog when CalendarButton tapped
- [ ] T069 [US3] Update calendar events when race details change during schedule refresh (call updateRaceEvent from useRaceSchedule)
- [ ] T070 [US3] Handle calendar permission denial with clear error message and link to settings

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can add races to calendar with 2 taps.

---

## Phase 6: User Story 4 - Plan Practice Sessions with Race Conditions (Priority: P3)

**Goal**: Users can add practice sessions when adding race to calendar, creating 3 sessions (Track Familiarization, Qualifying Simulation, Race Pace) with exact race conditions

**Independent Test**: Choose "Add with Practice" when adding race to calendar, verify three separate practice session calendar events created with correct race conditions in descriptions and scheduled 3/2/1 days before race

### Tests for User Story 4 (TDD - Write and verify FAIL before implementation) ⚠️

- [ ] T071 [P] [US4] Unit test for practice session generation in __tests__/unit/features/calendar/services/PracticeSessionGenerator.test.ts (verify 3 sessions, correct offsets, race conditions copied)
- [ ] T072 [P] [US4] Unit test for practice session scheduling when race <3 days away in __tests__/unit/features/calendar/utils/practiceScheduling.test.ts
- [ ] T073 [US4] Integration test for practice session calendar integration in __tests__/integration/practice-sessions.test.ts (create sessions, verify calendar events)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 4

- [ ] T074 [P] [US4] Create PracticeSessionGenerator service in src/features/calendar/services/PracticeSessionGenerator.ts (generateSessionsForRace method creates 3 sessions with race conditions)
- [ ] T075 [P] [US4] Create practice scheduling utilities in src/features/calendar/utils/practiceScheduling.ts (calculateSessionStartTime, compressSessionsIfNeeded for <3 day races)
- [ ] T076 [P] [US4] Create PracticePlanner component in src/features/calendar/components/PracticePlanner.tsx (<200 lines, shows 3 suggested sessions with details)
- [ ] T077 [US4] Integrate PracticePlanner modal into calendar flow (opens when "Yes" to practice sessions prompt)
- [ ] T078 [US4] Implement session confirmation and calendar event creation in PracticePlanner (calls CalendarService.createPracticeEvent for each session)
- [ ] T079 [US4] Add practice session details to calendar event descriptions (session type, duration, exact race conditions)

**Checkpoint**: At this point, User Stories 1-4 should all work independently. Users can plan practice sessions matching race conditions.

---

## Phase 7: User Story 5 - Favorite Races for Quick Access (Priority: P2)

**Goal**: Users can favorite races by tapping star icon, favorites persist across sessions, and favorited races can be filtered

**Independent Test**: Favorite races by tapping star, close and reopen app to verify persistence, filter by "Favorited Races Only", and confirm notifications appear 15 minutes before favorited race starts

### Tests for User Story 5 (TDD - Write and verify FAIL before implementation) ⚠️

- [ ] T080 [P] [US5] Unit test for favorites persistence in __tests__/unit/features/favorites/services/FavoritesRepository.test.ts
- [ ] T081 [P] [US5] Unit test for favorite race merging on schedule update in __tests__/unit/features/schedules/services/ScheduleMerger.test.ts
- [ ] T082 [US5] Integration test for favorites persistence in __tests__/integration/favorites-persistence.test.ts (add favorite, restart app, verify persisted)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 5

- [ ] T083 [P] [US5] Create FavoritesRepository in src/features/favorites/services/FavoritesRepository.ts (getFavorites, addFavorite, removeFavorite, isFavorite methods)
- [ ] T084 [US5] Implement AsyncStorageFavoritesRepository in src/features/favorites/services/AsyncStorageFavoritesRepository.ts
- [ ] T085 [P] [US5] Create useFavorites hook in src/features/favorites/hooks/useFavorites.ts (manages favorite state, persists to repository)
- [ ] T086 [P] [US5] Create FavoriteButton component in src/features/favorites/components/FavoriteButton.tsx (<200 lines, star icon, filled when favorited)
- [ ] T087 [US5] Add FavoriteButton to RaceCard component (tap to toggle favorite)
- [ ] T088 [US5] Implement favorite status preservation on schedule update in ScheduleMerger service (merge favorites with new race data)
- [ ] T089 [US5] Remove favorite status and cancel notifications when favorited race no longer exists in updated schedule
- [ ] T090 [US5] Update filter logic to support "Favorited Races Only" filter using useFavorites hook

**Checkpoint**: At this point, User Stories 1-3 and 5 should all work independently. Users can favorite races with persistence.

---

## Phase 8: User Story 6 - View Smart Scheduling for Repeating Races (Priority: P3)

**Goal**: Users can see "Next slots today" for daily races showing next 4 upcoming time slots based on repeat interval

**Independent Test**: View daily race card and verify "Next slots today" displays accurate upcoming times (e.g., "18:40, 19:20, 20:00, 20:40") based on 40-minute interval

### Tests for User Story 6 (TDD - Write and verify FAIL before implementation) ⚠️

- [ ] T091 [P] [US6] Unit test for next slots calculation in __tests__/unit/features/schedules/utils/nextSlots.test.ts (test various times of day, edge cases at midnight)
- [ ] T092 [US6] Integration test for next slots display in __tests__/integration/next-slots-display.test.ts

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 6

- [ ] T093 [P] [US6] Create next slots calculation in src/features/schedules/utils/nextSlots.ts (getNextSlots function returns next 4 slots for daily races)
- [ ] T094 [P] [US6] Create NextSlotsDisplay component in src/features/schedules/components/NextSlotsDisplay.tsx (<200 lines, shows "Next slots today: HH:MM, HH:MM, HH:MM, HH:MM")
- [ ] T095 [US6] Add NextSlotsDisplay to RaceCard component for daily races only (conditional rendering based on race.type)
- [ ] T096 [US6] Handle edge case when fewer than 4 slots remain today (show remaining slots only)
- [ ] T097 [US6] Handle edge case when no slots remain today (show "Next slot: tomorrow at [time]")

**Checkpoint**: At this point, User Stories 1-6 should all work independently. Users can view smart scheduling for daily races.

---

## Phase 9: User Story 7 - Receive Notifications for Upcoming Races (Priority: P3)

**Goal**: Users receive local notifications 15 minutes before favorited races, 1 hour before weekly/special events added to calendar, and when practice sessions start

**Independent Test**: Favorite a race, add weekly/special event to calendar, schedule practice sessions, then verify notifications appear at correct times (15 min before favorites, 1 hour before weekly/special, at practice session times)

### Tests for User Story 7 (TDD - Write and verify FAIL before implementation) ⚠️

- [ ] T098 [P] [US7] Unit test for notification scheduling in __tests__/unit/features/notifications/services/NotificationService.test.ts (verify trigger times, notification content)
- [ ] T099 [P] [US7] Unit test for notification cancellation on unfavorite in __tests__/unit/features/notifications/hooks/useNotifications.test.ts
- [ ] T100 [US7] Integration test for notification scheduling in __tests__/integration/notification-scheduling.test.ts (schedule, verify OS notification created)

**Verify all tests FAIL** before proceeding to implementation

### Implementation for User Story 7

- [ ] T101 [P] [US7] Create NotificationService in src/features/notifications/services/NotificationService.ts (requestPermission, scheduleNotification, cancelNotification methods)
- [ ] T102 [P] [US7] Create NotificationMappingRepository in src/features/notifications/services/NotificationMappingRepository.ts (track notificationId to raceId/practiceSessionId in AsyncStorage)
- [ ] T103 [US7] Create useNotifications hook in src/features/notifications/hooks/useNotifications.ts (manages permissions, schedules/cancels notifications)
- [ ] T104 [US7] Integrate notification scheduling into useFavorites hook (schedule 15-min notification when race favorited, cancel when unfavorited)
- [ ] T105 [US7] Integrate notification scheduling into useCalendarIntegration hook (schedule 1h notification for weekly/special events, practice session notifications)
- [ ] T106 [US7] Handle notification permission denial with one-time prompt explaining benefits and requesting permission
- [ ] T107 [US7] Update notification timing when favorited race time changes during schedule refresh
- [ ] T108 [US7] Cancel notifications when favorited race no longer exists in updated schedule

**Checkpoint**: All user stories should now be independently functional. Users receive notifications for favorited races and calendar events.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T109 [P] Create EmptyState component in src/shared/components/EmptyState.tsx (<200 lines, shows "No races scheduled today" with next race info)
- [ ] T110 [P] Create ErrorBoundary component in src/shared/components/ErrorBoundary.tsx (<200 lines, catches React errors, shows user-friendly message)
- [ ] T111 [P] Add EmptyState to RaceList when no races match filter
- [ ] T112 [P] Add ErrorBoundary to App.tsx wrapping navigation container
- [ ] T113 [P] Implement haptic feedback on tap interactions (iOS) in RaceCard, FavoriteButton, CalendarButton
- [ ] T114 [P] Implement dark mode support using system theme detection in all components
- [ ] T115 [P] Add accessibility labels to all interactive components (screen reader support)
- [ ] T116 [P] Ensure all touch targets are minimum 44pt (iOS HIG requirement)
- [ ] T117 [P] Add loading states to all async operations (calendar, notifications, favorites)
- [ ] T118 [P] Add error handling with user-friendly messages and retry options for all API calls
- [ ] T119 [P] Performance optimization: Memoize expensive calculations (countdown timers, next slots) using useMemo
- [ ] T120 [P] Performance optimization: Memoize component re-renders using React.memo for RaceCard, FilterBar
- [ ] T121 [P] Bundle size optimization: Lazy load PracticePlanner component using React.lazy and Suspense
- [ ] T122 [P] Add performance monitoring: Track app launch time, race list render time
- [ ] T123 Verify app meets <2s load time target on iPhone 11 / Samsung Galaxy S10 equivalent devices
- [ ] T124 Verify bundle size <10MB target using React Native bundle analyzer
- [ ] T125 Verify memory usage <100MB during normal operation using Xcode Instruments / Android Profiler
- [ ] T126 Verify 60fps scrolling on race list with 50+ races using Flipper performance monitor
- [ ] T127 Run all unit tests and verify 100% pass rate
- [ ] T128 Run all integration tests and verify 100% pass rate
- [ ] T129 Run all E2E tests on iOS simulator and verify 100% pass rate
- [ ] T130 Run all E2E tests on Android emulator and verify 100% pass rate
- [ ] T131 Test on real iOS device (iPhone 11 or older) and verify all features work
- [ ] T132 Test on real Android device (Samsung Galaxy S10 or older) and verify all features work
- [ ] T133 Validate quickstart.md instructions by having new developer follow setup steps
- [ ] T134 Update README.md with project status, setup instructions, and feature overview

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (filters work independently)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (calendar integration standalone)
- **User Story 4 (P3)**: Depends on User Story 3 (uses CalendarService) - Should implement after US3
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (favorites independent)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (next slots calculation standalone)
- **User Story 7 (P3)**: Depends on User Story 5 (uses favorites) and User Story 3 (uses calendar) - Should implement after US3 and US5

### Within Each User Story

- Tests (TDD mandatory) MUST be written and FAIL before implementation
- Types before services
- Services before hooks
- Hooks before components
- Components before screens
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (different files)
- All Foundational tasks marked [P] can run in parallel (different type files)
- Once Foundational phase completes:
  - User Stories 1, 2, 3, 5, 6 can start in parallel (independent, no cross-story dependencies)
  - User Story 4 should start after User Story 3 (depends on CalendarService)
  - User Story 7 should start after User Stories 3 and 5 (depends on CalendarService and favorites)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write tests first):
Task T030: Unit test for Race type validation
Task T031: Unit test for countdown calculation
Task T032: Unit test for timezone conversion
Task T033: Unit test for isLive calculation
Task T034: Unit test for race sorting
Task T035: Integration test for schedule data loading
Task T036: Integration test for schedule refresh
# Verify all FAIL, then proceed to implementation

# Launch all parallelizable components for User Story 1 together:
Task T038: ScheduleRepository interface
Task T040: RaceDataParser service
Task T042: useCountdownTimer hook
Task T043: SkeletonLoader component
Task T044: RaceCard component

# Then sequential dependent tasks:
Task T039: AsyncStorageScheduleRepository (depends on T038 interface)
Task T041: useRaceSchedule hook (depends on T038, T039 repositories)
Task T045: RaceList component (depends on T044 RaceCard)
Task T046: ScheduleScreen (depends on T043, T045 components)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T016)
2. Complete Phase 2: Foundational (T017-T029) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T030-T050)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Launch app, verify race schedule displays within 5 seconds
   - Verify skeleton loading states appear immediately
   - Verify countdown timers update every minute
   - Verify pull-to-refresh works
   - Verify "Last updated" indicator shows correctly
5. Deploy/demo MVP if ready (fully functional race schedule viewer)

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready (T001-T029)
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 5 (Favorites) → Test independently → **Deploy/Demo** (users can now favorite races)
4. Add User Story 2 (Filters) → Test independently → **Deploy/Demo** (users can filter by type and favorites)
5. Add User Story 3 (Calendar) → Test independently → **Deploy/Demo** (users can add to calendar)
6. Add User Story 4 (Practice Planner) → Test independently → **Deploy/Demo** (competitive racers can plan practice)
7. Add User Story 6 (Smart Scheduling) → Test independently → **Deploy/Demo** (daily racers see next slots)
8. Add User Story 7 (Notifications) → Test independently → **Deploy/Demo** (users get reminders)
9. Add Polish (Phase 10) → Final release

Each story adds value without breaking previous stories. Users get progressive features with each deployment.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T029)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T030-T050) - MVP race schedule view
   - **Developer B**: User Story 5 (T080-T090) - Favorites system
   - **Developer C**: User Story 2 (T051-T059) - Filters (lightweight, can start immediately)
3. After User Story 3 completes:
   - **Developer D**: User Story 4 (T071-T079) - Practice planner (depends on US3)
4. After User Stories 3 and 5 complete:
   - **Developer E**: User Story 7 (T098-T108) - Notifications (depends on US3 and US5)
5. **Developer F**: User Story 6 (T091-T097) - Smart scheduling (independent, can start anytime after foundational)

Stories complete and integrate independently, then merge to main.

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD is mandatory**: Verify tests fail before implementing (constitution requirement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Component size limit: 200 lines maximum (constitution requirement)
- TypeScript strict mode enforced: no `any` types without justification
- All async operations need loading states and error handling
- Performance targets: <2s load, <10MB bundle, <100MB memory, 60fps scrolling

---

## Task Summary

**Total Tasks**: 134
**Setup Phase**: 16 tasks
**Foundational Phase**: 13 tasks
**User Story 1 (P1 MVP)**: 21 tasks (8 tests + 13 implementation)
**User Story 2 (P2)**: 9 tasks (2 tests + 7 implementation)
**User Story 3 (P2)**: 11 tasks (3 tests + 8 implementation)
**User Story 4 (P3)**: 9 tasks (3 tests + 6 implementation)
**User Story 5 (P2)**: 11 tasks (3 tests + 8 implementation)
**User Story 6 (P3)**: 7 tasks (2 tests + 5 implementation)
**User Story 7 (P3)**: 11 tasks (3 tests + 8 implementation)
**Polish Phase**: 26 tasks

**Parallel Opportunities**: 67 tasks marked [P] can run in parallel

**MVP Scope** (User Story 1 only): 50 tasks (Setup + Foundational + US1)

**Independent Test Criteria**:
- US1: Launch app, verify 5s load with skeleton states, accurate countdowns, sorted races
- US2: Apply filters, verify only matching races shown
- US3: Add to calendar with 2 taps, verify calendar event with 15-min buffer
- US4: Add with practice, verify 3 practice sessions created with race conditions
- US5: Favorite race, restart app, verify persistence and filter works
- US6: View daily race, verify "Next slots today" shows correct times
- US7: Favorite race, verify notification appears 15 min before start

All tasks follow required checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
