# Feature Specification: Le Mans Ultimate Race Schedule Tracker

**Feature Branch**: `001-lmu-schedule-tracker`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Build RaceSync, a mobile application that helps sim racers track race schedules and plan practice sessions for Le Mans Ultimate."

## Clarifications

### Session 2025-11-15

- Q: How should race schedule data refresh work (automatic vs. manual)? → A: Manual pull-to-refresh with automatic background refresh when app opens (if stale)
- Q: What should display during initial loading before race data appears? → A: Show skeleton/shimmer placeholders for race cards while loading
- Q: How should race schedule updates affect existing favorites and calendar events? → A: Merge updates: keep user's favorites/calendar events, update race details (time/track changes)
- Q: How should system handle multiple calendars on device? → A: Always use device default calendar (no selection needed)
- Q: What is the maximum number of races a user can favorite? → A: No hard limit (store unlimited favorites)

## User Scenarios & Testing

### User Story 1 - View Today's Race Schedule (Priority: P1) 🎯 MVP

A sim racer opens RaceSync to see what races are available today. Within 5 seconds of launching the app (no login required), they see a scrollable list of races categorized as Daily Races (Beginner, Intermediate, Advanced), Weekly Races, and Special Events. Each race card displays track name, car class, start time in local timezone with countdown, duration, weather conditions, time of day progression, and license requirements. The next available race appears at the top of the list.

**Why this priority**: This solves the core problem of "I don't know when races are" and delivers immediate value. Without this, users have no reason to use the app.

**Independent Test**: Can be fully tested by launching the app and verifying race schedule displays within 5 seconds with accurate countdown timers and correctly sorted races.

**Acceptance Scenarios**:

1. **Given** app is launched for the first time, **When** user opens RaceSync, **Then** skeleton/shimmer placeholders for race cards display immediately while data loads
2. **Given** race data is loading, **When** data becomes available, **Then** race schedule displays within 5 seconds with no login or setup required
3. **Given** race schedule is displayed, **When** user views race cards, **Then** each card shows track, car class, countdown timer, duration, weather, time of day, and license requirement
4. **Given** multiple races are available, **When** user views the list, **Then** next available race appears at top, sorted by start time
5. **Given** a race start time is approaching, **When** countdown timer updates, **Then** timer shows human-readable format ("in 23 minutes", "in 1h 45m") and updates every minute
6. **Given** a race is currently running, **When** user views that race card, **Then** card displays "LIVE NOW" with pulsing visual indicator
7. **Given** races are categorized by type, **When** user views race cards, **Then** daily races show blue color, weekly races show teal, special events show red

---

### User Story 2 - Filter Race Schedule by Type (Priority: P2)

A sim racer wants to focus on specific race types. They tap a filter button and select from options: All Races, Daily Only, Weekly Only, Special Events Only, or Favorited Races Only. The race list updates immediately to show only races matching the selected filter.

**Why this priority**: Helps users quickly find races they care about, reducing cognitive load when scanning the schedule. Enhances usability without being critical for MVP.

**Independent Test**: Can be tested by applying each filter option and verifying only matching races appear in the filtered list.

**Acceptance Scenarios**:

1. **Given** race schedule is displayed, **When** user taps "Daily Only" filter, **Then** only daily races (blue cards) appear in the list
2. **Given** race schedule is displayed, **When** user taps "Weekly Only" filter, **Then** only weekly races (teal cards) appear in the list
3. **Given** race schedule is displayed, **When** user taps "Special Events Only" filter, **Then** only special event races (red cards) appear in the list
4. **Given** user has favorited races, **When** user taps "Favorited Races Only" filter, **Then** only starred races appear in the list
5. **Given** a filter is active, **When** user taps "All Races" filter, **Then** complete race schedule displays with all race types

---

### User Story 3 - Add Race to Calendar (Priority: P2)

A sim racer wants to remember when a race starts. They tap "Add to Calendar" on a race card, which creates a calendar event with race title, track name, start time with 15-minute pre-race buffer, and race details (car, weather, conditions) in the event description. The user can choose to add with or without practice sessions.

**Why this priority**: Solves the problem of "missing races I wanted to join" by integrating with user's existing calendar system. Critical for user retention but not required for initial value delivery.

**Independent Test**: Can be tested by adding a race to calendar and verifying calendar event contains correct details with 15-minute buffer and option to include/exclude practice sessions.

**Acceptance Scenarios**:

1. **Given** user views a race card, **When** user taps "Add to Calendar", **Then** system prompts "Add with practice sessions?" with Yes/No options
2. **Given** user selects "No" to practice sessions, **When** calendar event is created, **Then** event includes race title, track, start time minus 15 minutes, duration, and race details in description
3. **Given** user selects "Yes" to practice sessions, **When** calendar integration proceeds, **Then** Practice Planner interface opens (User Story 4)
4. **Given** calendar event is created successfully, **When** user returns to race schedule, **Then** race card shows visual indicator (checkmark) that it has been added to calendar
5. **Given** user's device calendar permissions are denied, **When** user taps "Add to Calendar", **Then** system displays clear message requesting calendar permission with link to device settings

---

### User Story 4 - Plan Practice Sessions with Race Conditions (Priority: P3)

A sim racer wants to prepare for a competitive race by practicing with exact race conditions. After choosing "Add with Practice" when adding a race to calendar, the Practice Planner suggests three practice sessions: Track Familiarization (30 min), Qualifying Simulation (15 min), and Race Pace Session (45 min). Each session includes exact race conditions (weather, time of day) in the calendar description so users can replicate them in-game. Sessions are added as separate calendar events on days leading up to the race.

**Why this priority**: Solves the advanced problem of "practicing with correct conditions" for competitive racers. Valuable for retention and differentiation but not critical for MVP launch.

**Independent Test**: Can be tested by choosing "Add with Practice" and verifying three separate practice session calendar events are created with correct race conditions in descriptions and appropriate scheduling before the race.

**Acceptance Scenarios**:

1. **Given** user chooses "Add with Practice", **When** Practice Planner opens, **Then** three suggested practice sessions display: Track Familiarization (30 min), Qualifying Simulation (15 min), Race Pace Session (45 min)
2. **Given** practice sessions are displayed, **When** user reviews session details, **Then** each session shows time of day, weather, and track temperature matching exact race conditions
3. **Given** user confirms practice plan, **When** calendar events are created, **Then** Track Familiarization is scheduled 3 days before race, Qualifying Simulation 2 days before, Race Pace Session 1 day before
4. **Given** practice calendar events are created, **When** user views calendar, **Then** each event includes session name, duration, and exact race conditions (weather, time of day, temperature) in description
5. **Given** race is less than 3 days away, **When** user adds practice sessions, **Then** system schedules available sessions on remaining days before race with adjusted timing

---

### User Story 5 - Favorite Races for Quick Access (Priority: P2)

A sim racer regularly participates in specific races and wants quick access to them. They tap a star icon on race cards to mark them as favorites. Favorited races persist across app sessions and can be filtered using "Favorited Races Only" filter. Favorited races also trigger notifications 15 minutes before start time.

**Why this priority**: Enhances personalization and repeat usage. Helps users focus on races they care about most. Important for engagement but not blocking MVP value.

**Independent Test**: Can be tested by favoriting races, closing and reopening app to verify persistence, filtering by favorites, and confirming notifications appear 15 minutes before favorited race starts.

**Acceptance Scenarios**:

1. **Given** user views a race card, **When** user taps star icon, **Then** race is marked as favorited with filled star icon and stored locally on device
2. **Given** user has favorited races, **When** user closes and reopens app, **Then** favorited races retain their starred status
3. **Given** user has favorited races, **When** user applies "Favorited Races Only" filter, **Then** only starred races appear in schedule
4. **Given** user has favorited a race, **When** 15 minutes remain before race start, **Then** local notification appears reminding user of race start time
5. **Given** user taps filled star icon on favorited race, **When** star is tapped again, **Then** race is unfavorited, star becomes hollow, and notification is cancelled
6. **Given** user has favorited a race, **When** race schedule updates with changed race time/track, **Then** favorite status persists with updated race details and calendar/notification timing adjusted
7. **Given** user has favorited a race, **When** race schedule updates and race no longer exists, **Then** favorite status is removed and associated notifications are cancelled

---

### User Story 6 - View Smart Scheduling for Repeating Races (Priority: P3)

A sim racer wants to plan their gaming session around multiple daily races that repeat throughout the day. For daily races running every 40 minutes, the race card shows "Next slots today" with upcoming times like "18:40, 19:20, 20:00, 20:40". This helps users see at a glance when they can join this race type throughout the evening.

**Why this priority**: Quality of life feature for daily race participants. Helps with session planning but not essential for core value delivery.

**Independent Test**: Can be tested by viewing daily race cards and verifying "Next slots today" displays accurate upcoming times based on race repeat interval.

**Acceptance Scenarios**:

1. **Given** daily race repeats every 40 minutes, **When** user views race card, **Then** card shows "Next slots today" with next 4 upcoming time slots
2. **Given** daily race has multiple slots remaining today, **When** current time advances, **Then** "Next slots today" updates to show next 4 slots from current time
3. **Given** daily race has fewer than 4 slots remaining today, **When** user views race card, **Then** card shows remaining slots for today only
4. **Given** last slot of the day has passed, **When** user views daily race card, **Then** card shows "Next slot: tomorrow at [time]"

---

### User Story 7 - Receive Notifications for Upcoming Races (Priority: P3)

A sim racer wants reminders for races they've added to calendar or favorited. The app sends local notifications 15 minutes before favorited races, 1 hour before weekly/special events added to calendar, and when scheduled practice sessions are about to begin.

**Why this priority**: Prevents users from missing races they've committed to. Valuable for retention but notifications can be added post-MVP without impacting core functionality.

**Independent Test**: Can be tested by favoriting races, adding races to calendar, scheduling practice sessions, then verifying notifications appear at correct times (15 min before favorites, 1 hour before weekly/special, at practice session times).

**Acceptance Scenarios**:

1. **Given** user has favorited a race, **When** 15 minutes remain before race start, **Then** local notification displays with race name, track, and "starts in 15 minutes"
2. **Given** user added weekly/special event to calendar, **When** 1 hour remains before race start, **Then** notification displays with race details and "starts in 1 hour"
3. **Given** user scheduled practice sessions, **When** practice session start time arrives, **Then** notification displays with session type, duration, and race conditions
4. **Given** user has notification permissions denied, **When** user favorites a race or adds to calendar, **Then** app displays one-time prompt explaining notification benefits and requesting permission
5. **Given** user unfavorites a race, **When** favorite is removed, **Then** associated notification is cancelled

---

### Edge Cases

- What happens when user's device timezone changes while viewing race schedule? Race times and countdowns should recalculate to new local timezone automatically.
- How does system handle calendar integration when user has multiple calendars on device? System always uses device default calendar without prompting user to select.
- What happens when race schedule data is unavailable or stale (older than 24 hours)? Display last known schedule with visual indicator "Last updated [time ago]". Automatic background refresh triggers when app opens; users can also manually pull-to-refresh.
- How does system handle countdown timers when app is in background? Timers should update when app returns to foreground to show current accurate countdown.
- What happens when user tries to add race to calendar but event creation fails? Display clear error message with retry option and manual export option.
- How does system handle practice session scheduling when race is less than 3 days away? Compress practice sessions into available days or allow user to manually adjust timing.
- What happens when user denies notification permissions but favorites races? Store favorites locally and display in-app reminder that notifications are disabled with option to enable in settings.
- How does system display races when none are scheduled for current day? Show message "No races scheduled today. Next race: [date] at [time]" with next available race highlighted.
- What happens when schedule updates and a favorited race's time changes? Preserve favorite status, update race details (new time, track, conditions), and update associated calendar event and notifications with new timing.
- What happens when a favorited race no longer exists in updated schedule? Remove favorite status, cancel associated notifications, mark calendar event as cancelled (if applicable).

## Requirements

### Functional Requirements

- **FR-001**: System MUST display skeleton/shimmer placeholders for race cards immediately upon app launch while data loads
- **FR-002**: System MUST display race schedule within 5 seconds of app launch with no login or account creation required
- **FR-003**: System MUST show races categorized as Daily Races (Beginner, Intermediate, Advanced), Weekly Races, and Special Events
- **FR-004**: System MUST display for each race: track name, configuration, car class, start time in local timezone, countdown timer, duration, weather conditions, time of day progression, and license requirements
- **FR-005**: System MUST sort races by start time with next available race displayed at top of list
- **FR-006**: System MUST update countdown timers every minute showing human-readable format ("in 23 minutes", "in 1h 45m")
- **FR-007**: System MUST display "LIVE NOW" indicator with pulsing visual for races currently in progress
- **FR-008**: System MUST color-code race cards by type: daily=blue, weekly=teal, special events=red
- **FR-009**: System MUST provide filter options: All Races, Daily Only, Weekly Only, Special Events Only, Favorited Races Only
- **FR-010**: System MUST allow users to add races to device calendar with single tap
- **FR-011**: System MUST create calendar events with race title, track, start time with 15-minute pre-race buffer, and race details in description
- **FR-012**: System MUST create calendar events in device default calendar without prompting user to select calendar
- **FR-013**: System MUST prompt user to add with or without practice sessions when adding race to calendar
- **FR-014**: System MUST allow users to favorite races by tapping star icon on race cards
- **FR-015**: System MUST persist favorited races locally on device across app sessions
- **FR-016**: System MUST provide Practice Planner suggesting three sessions: Track Familiarization (30 min), Qualifying Simulation (15 min), Race Pace Session (45 min)
- **FR-017**: System MUST include exact race conditions (weather, time of day, track temperature) in practice session calendar event descriptions
- **FR-018**: System MUST schedule practice sessions on days leading up to race: Track Familiarization 3 days before, Qualifying Simulation 2 days before, Race Pace Session 1 day before
- **FR-019**: System MUST display "Next slots today" for daily races showing next 4 upcoming time slots based on repeat interval
- **FR-020**: System MUST send local notification 15 minutes before favorited race starts
- **FR-021**: System MUST send local notification 1 hour before weekly/special events added to calendar
- **FR-022**: System MUST send notifications when scheduled practice sessions are about to begin
- **FR-023**: System MUST recalculate race times and countdowns when device timezone changes
- **FR-024**: System MUST mark race cards with visual indicator (checkmark) when race has been added to calendar
- **FR-025**: System MUST cache race schedule data locally for 24 hours maximum
- **FR-026**: System MUST display "Last updated [time ago]" indicator when showing cached schedule data
- **FR-027**: System MUST provide pull-to-refresh gesture allowing users to manually refresh race schedule data at any time
- **FR-028**: System MUST automatically refresh race schedule in background when app opens if cached data is stale (older than 24 hours)
- **FR-029**: System MUST provide clear error messages with actionable next steps when calendar integration fails
- **FR-030**: System MUST request calendar permissions before creating calendar events
- **FR-031**: System MUST request notification permissions before sending notifications
- **FR-032**: System MUST allow users to remove favorite status by tapping filled star icon
- **FR-033**: System MUST cancel associated notifications when race is unfavorited
- **FR-034**: System MUST display Le Mans Ultimate race schedules following established patterns: Daily Race A (Beginner), Daily Race B (Intermediate), Daily Race C (Advanced), Weekly Races (Tuesday/Thursday evenings), Special Events (weekend endurance races)
- **FR-035**: System MUST preserve user favorites when race schedule updates, merging updated race details (time, track, conditions) with existing favorite status
- **FR-036**: System MUST update calendar events when race details change (time, track, conditions) for races previously added to calendar
- **FR-037**: System MUST remove favorite status and cancel notifications when a favorited race no longer exists in updated schedule data

### Key Entities

- **Race**: Represents a scheduled race event with attributes: unique identifier, race type (daily/weekly/special), skill tier (beginner/intermediate/advanced), track name, track configuration, car class (LMP2/Hypercar/LMGT3/Multi-class), start time (UTC), duration (minutes), weather condition (Clear/Dynamic/Real Weather), time of day progression (Morning/Sunset/Full Day Cycle), license requirement (Bronze/Silver/Gold), repeat interval (for daily races), currently live status
- **Race Category**: Defines race grouping with attributes: category name (Daily/Weekly/Special), visual color code (blue/teal/red), filter identifier
- **Favorite**: User's saved preference for a race with attributes: race identifier, favorited timestamp, notification enabled status, persisted locally on device
- **Calendar Event**: External calendar integration with attributes: event title, location (track name), start time, end time, description (race details and conditions), calendar identifier, created timestamp
- **Practice Session**: Suggested training period with attributes: session type (Track Familiarization/Qualifying Simulation/Race Pace), duration (minutes), suggested schedule offset (days before race), race conditions (weather, time of day, track temperature), associated race identifier
- **Notification**: Local device notification with attributes: notification type (favorite reminder/calendar reminder/practice reminder), trigger time, notification title, notification body, associated race or session identifier, delivery status

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view today's race schedule within 5 seconds of opening app for first time with zero configuration
- **SC-002**: Users can add race to calendar with maximum 2 taps (tap race card, tap "Add to Calendar")
- **SC-003**: Users can plan practice sessions matching exact race conditions with all session details automatically populated
- **SC-004**: Users receive notification reminders for favorited races and never miss a race they intended to join
- **SC-005**: Countdown timers update every minute and display accurate time remaining in human-readable format
- **SC-006**: 90% of users successfully view race schedule and understand race types (daily/weekly/special) on first use without help documentation
- **SC-007**: Calendar integration success rate exceeds 95% (less than 5% failure rate for calendar event creation)
- **SC-008**: Favorited races persist across 100% of app sessions with zero data loss
- **SC-009**: Race schedule displays correctly for users across all timezones with accurate local time conversion
- **SC-010**: App displays sample Le Mans Ultimate race schedule following realistic patterns: 40-minute intervals for daily races, Tuesday/Thursday weekly races, occasional weekend special events

## Assumptions

- Users have iOS or Android devices with calendar app installed and accessible
- Users grant calendar permissions when prompted (or understand limitation if denied)
- Users grant notification permissions for reminder functionality (or understand limitation if denied)
- Race schedule data follows predictable patterns (daily races every 40 minutes, weekly races on specific days)
- Sample race data will be used in first version until API integration available
- Users understand sim racing terminology (LMP2, Hypercar, LMGT3, qualifying, race pace)
- Device has accurate timezone settings for correct local time display
- Users want to use their device's native calendar rather than in-app calendar
- 15-minute pre-race buffer is appropriate for most users to load game and join lobby
- Practice session timing (3 days, 2 days, 1 day before race) follows competitive racing best practices
- Local device storage is sufficient for storing favorited races and cached schedule data
- No hard limit on number of favorited races; storage impact minimal for race identifiers
- Users are focused on Le Mans Ultimate exclusively in this version (no multi-sim support yet)

## Out of Scope

The following features are explicitly excluded from this specification:

- User accounts, authentication, or cloud-based data storage
- Social features including friend lists, sharing race participation, or chat
- Race results, leaderboards, or performance tracking
- Car setups, telemetry data, or driving analytics
- Support for multiple sim racing games (only Le Mans Ultimate in initial version)
- Custom notification rules beyond standard reminders (15 min favorites, 1 hour weekly/special)
- Weather forecasts or predicted track temperature changes
- Team or league management features
- Integration with real API (using sample data in first version)
- Custom calendar event modifications beyond standard template
- In-app race countdown widgets or lock screen widgets
- Voice commands or Siri/Google Assistant integration
- Apple Watch or Android Wear companion apps
- Offline mode for adding to calendar without internet (calendar requires device connectivity)
