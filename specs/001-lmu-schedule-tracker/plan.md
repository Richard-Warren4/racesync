# Implementation Plan: Le Mans Ultimate Race Schedule Tracker

**Branch**: `001-lmu-schedule-tracker` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lmu-schedule-tracker/spec.md`

## Summary

RaceSync is a mobile-first application for sim racers to track Le Mans Ultimate race schedules and plan practice sessions. The MVP delivers race schedule viewing within 5 seconds (no login), calendar integration with 2-tap ease, and offline-first architecture using React Native with TypeScript. Users can view categorized races (Daily/Weekly/Special), favorite races for quick access, add races to device calendar with optional practice sessions, and receive notifications for upcoming events. Sample race data powers the initial version with architecture ready for future API integration.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled
**Primary Dependencies**: React Native 0.73+, React Navigation v6+, @react-native-community/async-storage, @react-native-community/datetimepicker, react-native-calendars
**Storage**: AsyncStorage for MVP (favorites, cached schedule data); migrate to SQLite when data exceeds 5MB
**Testing**: Jest + React Native Testing Library for unit/integration tests, Detox for E2E testing
**Target Platform**: iOS 15+ and Android 10+ (3-year-old device equivalent: iPhone 11, Samsung Galaxy S10)
**Project Type**: Mobile (React Native cross-platform)
**Performance Goals**: <2s load time, <10MB bundle size, <100MB memory, 60fps scrolling, <5s race schedule display on first launch
**Constraints**: Offline-first (core features work without network), local-first storage (no cloud accounts), one-handed thumb navigation, 200-line component limit, no class components
**Scale/Scope**: ~20-30 screens (race list, filters, calendar integration, practice planner, settings), sample data for 3 race categories (Daily A/B/C, Weekly, Special Events), unlimited favorites storage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with RaceSync Constitution v1.0.0:

- [x] **Mobile-First UX**: Feature accessible via one-handed thumb navigation? YES - scrollable race list, tap interactions only. Offline-capable? YES - AsyncStorage caches schedule for 24h. <10s to value? YES - target 5s to display race schedule on first launch with skeleton loading states.
- [x] **Component Independence**: All components <200 lines? YES - component extraction required when limit exceeded. Functional components with hooks? YES - no class components permitted. TypeScript strict? YES - strict mode enabled, no `any` types without justification.
- [x] **TDD Required**: Tests written first? YES - red-green-refactor cycle mandatory. Critical paths (time math, calendar, parsing) covered? YES - timezone conversions, countdown calculations, calendar integration, schedule data parsing all require tests before implementation.
- [x] **Performance**: Load <2s? YES - skeleton loaders + AsyncStorage read. Bundle <10MB? YES - React Native bundler with code splitting. Memory <100MB? YES - lightweight schedule data structures. 60fps scrolling? YES - FlatList with virtualization.
- [x] **Privacy-First**: Data local-first? YES - AsyncStorage only, no cloud sync in MVP. No tracking without consent? YES - zero analytics in MVP. Calendar write-only? YES - no calendar read permissions requested.
- [x] **Dependency Justified**: New dependencies documented with rationale? YES - see Dependencies section in research.md (Phase 0).
- [x] **Architecture Constraints**: React Native? YES. TypeScript strict mode? YES. Repository pattern for data? YES - ScheduleRepository abstracts AsyncStorage.

**Violations**: None

## Project Structure

### Documentation (this feature)

```text
specs/001-lmu-schedule-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── schedule-api.yaml # OpenAPI spec for future RaceControl.gg integration
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Mobile React Native project structure
src/
├── features/
│   ├── schedules/
│   │   ├── components/           # RaceCard, RaceList, FilterBar, SkeletonLoader
│   │   ├── hooks/                # useRaceSchedule, useCountdownTimer, useRaceFilters
│   │   ├── screens/              # ScheduleScreen
│   │   ├── services/             # ScheduleRepository, RaceDataParser
│   │   └── types/                # Race, RaceCategory, RaceFilter types
│   ├── favorites/
│   │   ├── components/           # FavoriteButton, FavoritesList
│   │   ├── hooks/                # useFavorites
│   │   ├── services/             # FavoritesRepository
│   │   └── types/                # Favorite type
│   ├── calendar/
│   │   ├── components/           # CalendarButton, PracticePlanner
│   │   ├── hooks/                # useCalendarIntegration
│   │   ├── services/             # CalendarService
│   │   └── types/                # CalendarEvent, PracticeSession types
│   └── notifications/
│       ├── hooks/                # useNotifications
│       ├── services/             # NotificationService
│       └── types/                # Notification type
├── shared/
│   ├── components/               # Button, Card, EmptyState, ErrorBoundary
│   ├── hooks/                    # useTimezone, usePullToRefresh
│   ├── utils/                    # dateUtils, timezoneUtils, formatters
│   └── constants/                # colors, spacing, raceTypes
├── navigation/
│   └── AppNavigator.tsx          # React Navigation setup
└── App.tsx                       # Root component

__tests__/
├── unit/
│   ├── features/
│   │   ├── schedules/
│   │   ├── favorites/
│   │   ├── calendar/
│   │   └── notifications/
│   └── shared/
│       └── utils/                # Critical: timezone, date calculations
├── integration/
│   ├── calendar-integration.test.ts
│   ├── notification-scheduling.test.ts
│   ├── schedule-refresh.test.ts
│   └── favorites-persistence.test.ts
└── e2e/
    ├── race-schedule-view.e2e.ts
    ├── favorite-race.e2e.ts
    └── calendar-add.e2e.ts
```

**Structure Decision**: Mobile React Native project using feature-based organization (Option 3 adapted). Each feature (schedules, favorites, calendar, notifications) is self-contained with its own components, hooks, services, and types. This structure supports:
- Feature independence for parallel development
- Co-located tests with implementation
- Clear domain boundaries (schedule management, favorites, calendar integration, notifications)
- Easy extraction to libraries if needed for future multi-sim support

No backend/API code needed in MVP - using sample data embedded in app. Future API integration abstracted behind repository interfaces.

## Complexity Tracking

No constitution violations requiring justification.
