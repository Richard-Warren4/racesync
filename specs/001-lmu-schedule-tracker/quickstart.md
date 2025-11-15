# Quickstart Guide: Le Mans Ultimate Race Schedule Tracker

**Feature**: 001-lmu-schedule-tracker
**Last Updated**: 2025-11-15
**Purpose**: Get developers up and running with RaceSync development environment

## Prerequisites

### Required Tools

- **Node.js**: v18.x or later ([Download](https://nodejs.org/))
- **npm**: v9.x or later (comes with Node.js)
- **Watchman**: For React Native file watching ([Installation](https://facebook.github.io/watchman/docs/install))
- **Git**: Version control

### Platform-Specific Requirements

**iOS Development** (macOS only):
- Xcode 14.3+ from Mac App Store
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`
- iOS Simulator (comes with Xcode)

**Android Development** (macOS, Linux, Windows):
- Android Studio Flamingo (2022.2.1) or later
- Android SDK Platform 33 (Android 13)
- Android SDK Build-Tools 33.0.0
- Android Emulator configured with API 30+ image

### Check Installation

```bash
node --version          # Should be v18.x+
npm --version           # Should be v9.x+
watchman --version      # Should be installed
xcodebuild -version     # iOS only, should be 14.3+
java -version           # Android only, should be Java 11+
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd racesync
git checkout 001-lmu-schedule-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- React Native 0.73+
- TypeScript 5.x
- React Navigation v6
- Testing libraries (Jest, React Native Testing Library, Detox)
- Calendar/notification libraries
- date-fns for date handling

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

This installs native iOS dependencies via CocoaPods.

### 4. Android Setup

No additional steps required - Gradle handles Android dependencies automatically.

---

## Running the App

### iOS Simulator

```bash
npm run ios
```

Or specify device:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

### Android Emulator

1. Start Android Emulator from Android Studio
2. Run:
```bash
npm run android
```

### Physical Devices

**iOS**:
```bash
npm run ios -- --device "Your iPhone Name"
```

**Android**:
```bash
# Ensure device is connected via USB with USB debugging enabled
adb devices  # Verify device is listed
npm run android
```

---

## Development Workflow

### Start Metro Bundler

Metro bundler starts automatically with `npm run ios/android`, but you can start it separately:

```bash
npm start
```

### TypeScript Type Checking

```bash
npm run typecheck
```

Run this before committing to catch type errors.

### Linting

```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint:fix
```

### Code Formatting

```bash
npm run format
```

Check formatting without changes:
```bash
npm run format:check
```

---

## Running Tests

### Unit Tests

```bash
npm test
```

Watch mode for TDD:
```bash
npm run test:watch
```

Coverage report:
```bash
npm run test:coverage
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests (Detox)

**iOS**:
```bash
# Build E2E app (first time only)
npm run e2e:build:ios

# Run E2E tests
npm run e2e:test:ios
```

**Android**:
```bash
# Build E2E app (first time only)
npm run e2e:build:android

# Run E2E tests
npm run e2e:test:android
```

---

## Project Structure Quick Reference

```
racesync/
├── src/
│   ├── features/          # Feature modules (schedules, favorites, calendar, notifications)
│   ├── shared/            # Shared components, hooks, utils
│   ├── navigation/        # React Navigation setup
│   └── App.tsx            # Root component
├── __tests__/             # Tests (unit, integration, e2e)
├── ios/                   # iOS native code
├── android/               # Android native code
├── specs/                 # Feature specifications
│   └── 001-lmu-schedule-tracker/
│       ├── spec.md        # Feature requirements
│       ├── plan.md        # Implementation plan
│       ├── data-model.md  # Entity definitions
│       └── contracts/     # API contracts
└── package.json           # Dependencies and scripts
```

---

## Common Development Tasks

### Add New Dependency

```bash
npm install <package-name>

# iOS: Update CocoaPods
cd ios && pod install && cd ..
```

### Clear Caches (if experiencing issues)

```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Clear iOS build
cd ios && rm -rf build && cd ..

# Clear Android build
cd android && ./gradlew clean && cd ..

# Nuclear option: Clear all caches
npm run clean
```

### Debug on Device

**iOS**: Shake device → "Debug" menu → "Open Debugger"

**Android**: Shake device → "Debug" menu → "Debug"

Or use Chrome DevTools:
```bash
# Open debugger UI
open "http://localhost:8081/debugger-ui/"
```

---

## Sample Data for Testing

Sample race schedule data is embedded in `src/data/sampleSchedule.json`:

- **Daily Race A** (Beginner): LMP2, 15 min, every 40 min
- **Daily Race B** (Intermediate): Hypercar, 20 min, every 40 min
- **Daily Race C** (Advanced): Multi-class, 30 min, every 60 min
- **Weekly Races**: Tuesday/Thursday 19:00 UTC, 45 min
- **Special Events**: Weekend endurance races (6h, 12h)

Modify this file to test different schedules.

---

## Environment Configuration

### Metro Bundler Port

Default: `8081`

Change in `metro.config.js`:
```javascript
module.exports = {
  server: {
    port: 8082, // Custom port
  },
};
```

### TypeScript Configuration

`tsconfig.json` uses **strict mode** (constitution requirement):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

Do not disable strict mode without constitution approval.

---

## Troubleshooting

### "Unable to resolve module" Error

1. Clear Metro cache: `npm start -- --reset-cache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. iOS: `cd ios && pod install && cd ..`

### iOS Build Fails

1. Clean build folder: `cd ios && rm -rf build && cd ..`
2. Reinstall pods: `cd ios && pod install && cd ..`
3. Verify Xcode version: `xcodebuild -version` (should be 14.3+)

### Android Build Fails

1. Clean Gradle: `cd android && ./gradlew clean && cd ..`
2. Check Android SDK installation in Android Studio
3. Verify `ANDROID_HOME` environment variable is set

### App Crashes on Launch

1. Check Metro bundler is running
2. Verify simulator/emulator is booted
3. Check console for error messages
4. Try: `npm run ios -- --reset-cache`

### Calendar/Notification Permissions Not Working

**iOS Simulator**: Some permissions don't work in simulator. Test on physical device.

**Android Emulator**: Ensure Google Play Services are installed (use Play Store image).

---

## Performance Profiling

### React DevTools Profiler

1. Install React DevTools browser extension
2. Open app with debugger enabled
3. Use Profiler tab to record component renders

### Flipper (iOS/Android)

1. Install Flipper desktop app
2. Run app in debug mode
3. Flipper automatically detects running app
4. Use Layout Inspector, Network Inspector, Performance plugins

### Memory Profiling

**iOS**: Xcode Instruments → Allocations
**Android**: Android Studio Profiler → Memory

Target: <100MB memory during normal operation (viewing schedules)

---

## Next Steps

1. **Read the spec**: `specs/001-lmu-schedule-tracker/spec.md`
2. **Review data model**: `specs/001-lmu-schedule-tracker/data-model.md`
3. **Understand architecture**: `specs/001-lmu-schedule-tracker/plan.md`
4. **Run tests**: `npm test` (verify setup)
5. **Start development**: Pick first task from `specs/001-lmu-schedule-tracker/tasks.md` (when created)

---

## Key Commands Cheatsheet

| Command | Purpose |
|---------|---------|
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run unit tests |
| `npm run test:watch` | TDD watch mode |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run e2e:test:ios` | E2E tests (iOS) |
| `npm start -- --reset-cache` | Clear Metro cache |
| `npm run clean` | Nuclear cache clear |

---

## Getting Help

- **Constitution**: `.specify/memory/constitution.md` (development principles)
- **Spec**: `specs/001-lmu-schedule-tracker/spec.md` (requirements)
- **Plan**: `specs/001-lmu-schedule-tracker/plan.md` (architecture)
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

---

**Ready to code!** Follow TDD principles from constitution: write tests first, get approval, then implement.
