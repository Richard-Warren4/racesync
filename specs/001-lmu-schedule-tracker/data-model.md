# Data Model: Le Mans Ultimate Race Schedule Tracker

**Date**: 2025-11-15
**Feature**: 001-lmu-schedule-tracker
**Purpose**: Define entities, relationships, and validation rules for race schedule tracking

## Entity Definitions

### Race

Represents a scheduled race event in Le Mans Ultimate.

**Attributes**:
- `id`: string (UUID) - Unique identifier, stable across schedule updates
- `type`: "daily" | "weekly" | "special" - Race category for filtering
- `tier`: "beginner" | "intermediate" | "advanced" | null - Skill level (null for weekly/special)
- `trackName`: string - Circuit name (e.g., "Spa-Francorchamps")
- `trackConfiguration`: string | null - Track variant (e.g., "Grand Prix", "Endurance")
- `carClass`: "LMP2" | "Hypercar" | "LMGT3" | "Multi-class" - Car category
- `startTime`: string (ISO 8601 UTC) - Race start time in UTC (e.g., "2025-11-15T19:00:00Z")
- `durationMinutes`: number - Race length in minutes (15, 20, 30, 45, 360, etc.)
- `weatherCondition`: "Clear" | "Dynamic" | "Real Weather" - Weather type
- `timeOfDay`: "Morning" | "Afternoon" | "Sunset" | "Night" | "Full Day Cycle" - Time progression
- `licenseRequirement`: "Bronze" | "Silver" | "Gold" - Minimum safety rating
- `repeatInterval`: number | null - Minutes between repeats for daily races (e.g., 40), null for non-repeating
- `isLive`: boolean - Computed property: true if current time is between startTime and startTime + duration

**Validation Rules**:
- `id` MUST be non-empty string, unique across all races
- `startTime` MUST be valid ISO 8601 UTC timestamp
- `durationMinutes` MUST be positive integer
- `repeatInterval` MUST be null for type="weekly" or type="special"
- `tier` MUST be null for type="weekly" or type="special"
- `tier` MUST be non-null for type="daily"

**State Transitions**:
- Race becomes `isLive=true` when current time >= startTime
- Race becomes `isLive=false` when current time > startTime + durationMinutes
- Race removed from schedule when event is past (cleanup after 24h)

**Relationships**:
- One Race → Many Favorites (one-to-many)
- One Race → Many CalendarEvents (one-to-many)
- One Race → One RaceCategory (many-to-one)
- One Race → Many PracticeSessions (one-to-many)

---

### RaceCategory

Defines grouping and visual styling for race types.

**Attributes**:
- `name`: "Daily" | "Weekly" | "Special" - Category identifier
- `colorCode`: string (hex color) - Visual color: Daily=#2563eb (blue), Weekly=#14b8a6 (teal), Special=#dc2626 (red)
- `filterKey`: "daily" | "weekly" | "special" | "all" | "favorites" - Filter identifier

**Validation Rules**:
- `name` MUST be one of predefined values
- `colorCode` MUST be valid 6-digit hex color starting with #

**Relationships**:
- One RaceCategory → Many Races (one-to-many)

**Note**: Categories are static, not persisted. Defined as constants in code.

---

### Favorite

User's saved preference for a race, enabling quick access and notifications.

**Attributes**:
- `raceId`: string (UUID) - Reference to Race.id
- `favoritedAt`: string (ISO 8601 UTC) - Timestamp when favorited
- `notificationEnabled`: boolean - Whether 15-min notification is scheduled (always true when favorited)

**Validation Rules**:
- `raceId` MUST reference existing Race.id
- `favoritedAt` MUST be valid ISO 8601 UTC timestamp

**Storage**:
- Persisted in AsyncStorage as JSON array
- Key: `racesync:favorites`
- Structure: `Array<Favorite>`

**State Transitions**:
- Created when user taps star icon on race card
- Deleted when user untaps star icon
- Deleted when favorited race no longer exists in updated schedule
- `notificationEnabled` toggles if user denies notification permissions

**Relationships**:
- One Favorite → One Race (many-to-one via raceId)

---

### CalendarEvent

External calendar integration representing race or practice session.

**Attributes**:
- `eventId`: string - Platform calendar event identifier (from calendar API)
- `raceId`: string (UUID) | null - Reference to Race.id, null for practice sessions
- `practiceSessionId`: string | null - Reference to PracticeSession if applicable
- `title`: string - Event title (e.g., "LMU Daily Race B - Hypercar at Spa")
- `location`: string - Track name
- `startTime`: string (ISO 8601 local) - Event start in local timezone (15 min before race for buffer)
- `endTime`: string (ISO 8601 local) - Event end in local timezone (startTime + duration)
- `description`: string - Race details: car class, weather, time of day, conditions
- `calendarId`: string - Device calendar identifier (always default calendar)
- `createdAt`: string (ISO 8601 UTC) - Timestamp when added to calendar

**Validation Rules**:
- `eventId` MUST be non-empty string from calendar API
- `startTime` < `endTime` (duration > 0)
- One of `raceId` or `practiceSessionId` MUST be non-null

**Storage**:
- NOT persisted in AsyncStorage (calendar is source of truth)
- Track association via local mapping: `racesync:calendar-mappings`
- Mapping structure: `{ [eventId]: { raceId, practiceSessionId, createdAt } }`

**State Transitions**:
- Created when user taps "Add to Calendar" and confirms
- Updated when race details change (time, track) and schedule refreshes
- Deleted when user removes favorite and race is cancelled

**Relationships**:
- One CalendarEvent → One Race or One PracticeSession (many-to-one)

---

### PracticeSession

Suggested training period for preparing for a specific race.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `raceId`: string (UUID) - Reference to Race.id
- `sessionType`: "Track Familiarization" | "Qualifying Simulation" | "Race Pace" - Session purpose
- `durationMinutes`: number - Session length (30, 15, or 45 minutes)
- `scheduleOffsetDays`: number - Days before race (3, 2, or 1)
- `suggestedStartTime`: string (ISO 8601 local) - Calculated: race.startTime - offsetDays, same time of day
- `weatherCondition`: string - Copied from race (e.g., "Clear")
- `timeOfDay`: string - Copied from race (e.g., "Sunset")
- `trackTemperature`: string | null - Copied from race if available

**Validation Rules**:
- `raceId` MUST reference existing Race.id
- `durationMinutes` MUST be 15, 30, or 45
- `scheduleOffsetDays` MUST be 1, 2, or 3
- `suggestedStartTime` MUST be before race.startTime

**Storage**:
- NOT persisted (generated on-demand when user chooses "Add with Practice")
- Created transiently during practice planning flow

**State Transitions**:
- Generated when user selects "Add with Practice" option
- Three sessions created per race: Track Familiarization (3 days, 30 min), Qualifying Simulation (2 days, 15 min), Race Pace (1 day, 45 min)
- Compressed if race is <3 days away (fit into available days)

**Relationships**:
- One PracticeSession → One Race (many-to-one via raceId)
- One PracticeSession → One CalendarEvent (one-to-one when added to calendar)

---

### Notification

Local device notification for reminding users of upcoming races or practice sessions.

**Attributes**:
- `id`: string - Platform notification identifier
- `notificationType`: "favorite-reminder" | "calendar-reminder" | "practice-reminder" - Notification category
- `triggerTime`: string (ISO 8601 UTC) - When notification should fire
- `title`: string - Notification heading (e.g., "Daily Race B starts in 15 minutes")
- `body`: string - Notification content (e.g., "Hypercar at Spa, Dynamic weather")
- `raceId`: string | null - Reference to Race.id if applicable
- `practiceSessionId`: string | null - Reference to PracticeSession if applicable
- `deliveryStatus`: "scheduled" | "delivered" | "cancelled" - Notification state

**Validation Rules**:
- `triggerTime` MUST be in the future when notification is scheduled
- One of `raceId` or `practiceSessionId` MUST be non-null
- `notificationType="favorite-reminder"` requires `raceId` (not null)
- `notificationType="practice-reminder"` requires `practiceSessionId` (not null)

**Storage**:
- Managed by OS notification system (not in AsyncStorage)
- Track scheduled notifications via: `racesync:scheduled-notifications`
- Mapping structure: `{ [notificationId]: { raceId, practiceSessionId, triggerTime, type } }`

**State Transitions**:
- `scheduled` when user favorites race or adds to calendar
- `delivered` when OS delivers notification at triggerTime
- `cancelled` when user unfavorites race or removes from calendar

**Timing Rules**:
- Favorite reminders: 15 minutes before race.startTime
- Calendar reminders: 1 hour before race.startTime (weekly/special events only)
- Practice reminders: At practiceSession.suggestedStartTime

**Relationships**:
- One Notification → One Race or One PracticeSession (many-to-one)

---

## Entity Relationships Diagram

```
┌─────────────┐       ┌──────────────┐
│RaceCategory │◄──────┤    Race      │
└─────────────┘  1:N  │  (id, type,  │
                      │   tier, ...)  │
                      └───────┬───────┘
                              │
                  ┌───────────┼───────────┬──────────────┐
                  │           │           │              │
                  │ 1:N       │ 1:N       │ 1:N          │ 1:N
                  ▼           ▼           ▼              ▼
          ┌──────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
          │ Favorite │ │CalendarEvent│ │PracticeSession│ │Notification │
          │ (raceId) │ │ (raceId)    │ │   (raceId)    │ │  (raceId)   │
          └──────────┘ └─────────────┘ └───────┬───────┘ └─────────────┘
                                               │
                                               │ 1:1
                                               ▼
                                        ┌─────────────┐
                                        │CalendarEvent│
                                        │(practiceId) │
                                        └─────────────┘
```

---

## Storage Schema (AsyncStorage)

### Key-Value Pairs

| Key | Value Type | Purpose |
|-----|-----------|---------|
| `racesync:schedule` | `{ races: Race[], lastUpdated: string }` | Cached race schedule with timestamp |
| `racesync:favorites` | `Favorite[]` | User's favorited races |
| `racesync:calendar-mappings` | `{ [eventId]: { raceId, practiceSessionId, createdAt } }` | Calendar event associations |
| `racesync:scheduled-notifications` | `{ [notificationId]: { raceId, practiceSessionId, triggerTime, type } }` | Notification tracking |
| `racesync:app-state` | `{ lastOpenedAt: string, hasSeenOnboarding: boolean }` | App metadata |

### Data Volume Estimates

- **Schedule Cache**: ~50 races × 500 bytes = 25KB
- **Favorites**: 50 favorites × 100 bytes = 5KB
- **Calendar Mappings**: 20 events × 150 bytes = 3KB
- **Notification Mappings**: 30 notifications × 100 bytes = 3KB
- **Total**: ~36KB (well under 5MB AsyncStorage threshold)

---

## Migration Strategy (AsyncStorage → SQLite)

**Trigger**: When total storage exceeds 5MB (unlikely in MVP, but constitution requires plan)

**Tables**:
```sql
CREATE TABLE races (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  tier TEXT,
  track_name TEXT NOT NULL,
  track_configuration TEXT,
  car_class TEXT NOT NULL,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  weather_condition TEXT NOT NULL,
  time_of_day TEXT NOT NULL,
  license_requirement TEXT NOT NULL,
  repeat_interval INTEGER,
  is_live BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE favorites (
  race_id TEXT PRIMARY KEY,
  favorited_at TEXT NOT NULL,
  notification_enabled BOOLEAN NOT NULL DEFAULT 1,
  FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE
);

CREATE TABLE calendar_mappings (
  event_id TEXT PRIMARY KEY,
  race_id TEXT,
  practice_session_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_races_start_time ON races(start_time);
CREATE INDEX idx_races_type ON races(type);
CREATE INDEX idx_favorites_race_id ON favorites(race_id);
```

**Migration Steps**:
1. Install `react-native-sqlite-storage`
2. Create SQLite database with schema above
3. Read all AsyncStorage data
4. Bulk insert into SQLite tables
5. Verify data integrity (count records)
6. Update Repository implementations to use SQLite
7. Delete AsyncStorage keys
8. Add migration_version to track schema changes

---

## Computed Properties & Derived Data

### Race.isLive

**Calculation**:
```typescript
const isLive = (race: Race): boolean => {
  const now = new Date();
  const start = new Date(race.startTime);
  const end = new Date(start.getTime() + race.durationMinutes * 60 * 1000);
  return now >= start && now <= end;
};
```

**Usage**: Display "LIVE NOW" badge on race cards

---

### Countdown Timer

**Calculation**:
```typescript
const getCountdown = (race: Race): string => {
  const now = new Date();
  const start = new Date(race.startTime);
  const diffMs = start.getTime() - now.getTime();

  if (diffMs < 0) return "LIVE NOW";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes} minutes`;
};
```

**Update Frequency**: Every 60 seconds (meets FR-006 requirement)

---

### Next Slots Today (Daily Races)

**Calculation**:
```typescript
const getNextSlots = (race: Race): Date[] => {
  if (race.type !== "daily" || !race.repeatInterval) return [];

  const now = new Date();
  const start = new Date(race.startTime);
  const slots: Date[] = [];

  let current = new Date(start);
  while (slots.length < 4 && current.getDate() === now.getDate()) {
    if (current > now) {
      slots.push(new Date(current));
    }
    current = new Date(current.getTime() + race.repeatInterval * 60 * 1000);
  }

  return slots;
};
```

**Usage**: Display "Next slots today: 18:40, 19:20, 20:00, 20:40" for daily races (FR-019)

---

## Validation Functions

### Race Validation

```typescript
const validateRace = (race: Race): string[] => {
  const errors: string[] = [];

  if (!race.id || race.id.trim() === "") {
    errors.push("Race ID is required");
  }

  if (!["daily", "weekly", "special"].includes(race.type)) {
    errors.push(`Invalid race type: ${race.type}`);
  }

  if (race.type === "daily" && !race.tier) {
    errors.push("Daily races must have tier (beginner/intermediate/advanced)");
  }

  if ((race.type === "weekly" || race.type === "special") && race.tier !== null) {
    errors.push("Weekly/special races must not have tier");
  }

  if (!isValidISOString(race.startTime)) {
    errors.push(`Invalid startTime: ${race.startTime}`);
  }

  if (race.durationMinutes <= 0) {
    errors.push(`Invalid duration: ${race.durationMinutes}`);
  }

  return errors;
};
```

---

## Summary

**Total Entities**: 6 (Race, RaceCategory, Favorite, CalendarEvent, PracticeSession, Notification)

**Persisted Entities**: 3 (Race via cache, Favorite, calendar/notification mappings)

**Storage Estimate**: ~36KB (MVP well under 5MB threshold)

**Critical Validations**:
- Race ID uniqueness and stability across updates
- ISO 8601 UTC timestamp format for all dates
- Type-specific tier requirements (daily vs weekly/special)
- Positive duration values
- Future triggerTime for notifications

**Data Integrity**:
- Foreign key relationships enforced at application layer (AsyncStorage has no constraints)
- Cascade deletes handled manually (when race removed, delete favorites/notifications)
- Migration to SQLite planned when storage exceeds 5MB
