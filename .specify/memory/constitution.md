# RaceSync Constitution

<!--
Sync Impact Report:
Version Change: NEW → 1.0.0
Modified Principles: N/A (initial version)
Added Sections: All sections (initial constitution creation)
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md - verified Constitution Check section aligns
  ✅ spec-template.md - verified requirements structure supports user-first principles
  ✅ tasks-template.md - verified task categorization supports TDD and component independence
Follow-up TODOs: None
-->

## Core Principles

### I. Mobile-First User Experience

RaceSync MUST be designed for mobile-first interaction with the following non-negotiable constraints:

- **One-handed operation**: All primary features accessible with thumb navigation while seated at a sim rig
- **Offline-first architecture**: Core functionality (viewing schedules, practice planning) works without network connectivity
- **Progressive disclosure**: Start with essential value (race schedules) then reveal advanced features (telemetry, analytics)
- **Speed to value**: First-time users see race schedules within 10 seconds of app launch
- **Native conventions**: Strict adherence to iOS Human Interface Guidelines and Material Design principles
- **Accessibility from day one**: Screen reader support, high contrast modes, and proper touch targets (minimum 44pt) required for all UI

**Rationale**: Sim racers need quick access to information between practice sessions. Complex desktop-style interfaces fail this use case. Mobile-first ensures the app serves real racer workflows.

### II. Component Independence & Testability

Every component MUST be independently testable and follow these rules:

- **Functional components only**: React hooks-based architecture, no class components permitted
- **Component size limit**: Maximum 200 lines per file; extract sub-components when exceeded
- **Single responsibility**: Each component handles one logical concern
- **Prop-driven behavior**: Components receive all data via props or context, no hidden dependencies
- **Self-contained tests**: Every component has co-located test file verifying isolated behavior
- **TypeScript enforcement**: Full type coverage required; no `any` types without explicit justification

**Rationale**: Independent components enable parallel development, reliable testing, and confident refactoring. Small, focused components reduce cognitive load and maintenance burden.

### III. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all business-critical logic following strict red-green-refactor:

- **Tests first**: Write failing tests BEFORE implementation code
- **User approval gate**: Test scenarios must be reviewed and approved before implementation begins
- **Critical paths require tests**: Race time calculations, timezone conversions, calendar integration, data parsing
- **Device integration tests**: Calendar, notifications, local storage must have integration test coverage
- **Red-Green-Refactor cycle**: Tests fail → implement minimum code to pass → refactor → repeat
- **Manual device testing**: Real device testing required before each release (not just simulators)

**Rationale**: RaceSync handles time-sensitive race data where errors directly impact user trust. TDD ensures correctness for critical calculations (timezone math, race start times) and prevents regressions.

### IV. Performance & Resource Constraints

RaceSync MUST meet these measurable performance standards:

- **Load time**: App launch to interactive UI in under 2 seconds on 3-year-old devices (iPhone 11, Samsung Galaxy S10 equivalent)
- **Bundle size**: Initial download under 10MB; lazy load premium features
- **Memory ceiling**: Maximum 100MB RAM during normal operation (viewing schedules, calendar sync)
- **Frame rate**: 60fps scrolling on all lists and navigation transitions
- **Battery efficiency**: Background refresh and calendar sync operations must not cause measurable battery drain
- **API resilience**: Graceful degradation when offline or when RaceControl.gg API unavailable

**Rationale**: Mobile users expect instant responsiveness and efficient resource usage. Performance constraints prevent feature bloat and ensure app remains usable on older devices.

### V. Privacy-First Data Handling

User data privacy MUST be protected through these enforceable standards:

- **Local-first storage**: All user data stays on device unless user explicitly enables cloud sync
- **No tracking in MVP**: Zero analytics, telemetry, or usage tracking until post-MVP with user consent
- **One-way calendar integration**: App writes to user calendar but NEVER reads calendar contents
- **Data transparency**: Clear data management UI showing what's stored, with one-tap delete-all option
- **Cache expiration**: Race schedule data cached maximum 24 hours then refreshed
- **Optional cloud sync**: iCloud/Google Drive sync is opt-in with clear explanation of what syncs
- **No account requirement**: Full functionality available without creating accounts or providing email

**Rationale**: Sim racers value privacy and should not sacrifice personal data to view race schedules. Local-first architecture builds trust and ensures app works even without backend services.

## User Experience Standards

### Interaction Design Requirements

- **Immediate feedback**: All user actions (tap, swipe, scroll) provide instant visual response
- **Smart defaults**: Auto-detect timezone, suggest next race slot based on current time, remember preferences
- **Forgiving UX**: Allow undo for destructive actions; confirm before calendar modifications
- **Contextual help**: In-app guidance for first-time features without requiring external documentation
- **Error recovery**: Clear error messages with actionable next steps, never generic "something went wrong"

### Platform Integration

- **Native components**: Use React Native native modules for calendars, notifications, storage
- **System theming**: Respect iOS dark mode and Android Material You theming
- **Haptic feedback**: Appropriate haptics for confirmations, warnings, and selections (iOS)
- **Share integration**: Native share sheet for race schedules, practice plans

## Code Quality Standards

### File & Module Organization

- **Feature-based structure**: Organize by feature domain (schedules, calendar, practice) not technical layer
- **Co-located tests**: Test files live adjacent to implementation files
- **Barrel exports**: Use index files to create clean public APIs for feature modules
- **No circular dependencies**: Enforce acyclic dependency graph via linting

### Documentation Requirements

- **Code comments for why, not what**: Explain business logic, racing domain concepts, non-obvious decisions
- **Racing domain glossary**: Maintain shared vocabulary (stint, quali, race window, practice slot)
- **Architecture decisions**: Document architectural choices in code comments or ADR files
- **README currency**: README always reflects current setup instructions and project state

### Dependency Management

- **Minimal dependencies**: Prefer React Native built-in solutions over third-party libraries
- **Justified additions**: New dependencies require written justification of why native solution insufficient
- **Security updates**: Dependencies scanned and updated monthly minimum
- **Bundle impact analysis**: Measure bundle size impact before adding dependencies

## Development Workflow

### Version Control

- **Feature branches**: Meaningful names following pattern `feat/feature-name`, `fix/bug-description`
- **Semantic commits**: Commit messages explain why, not just what (e.g., "Add calendar integration to reduce friction for race planning")
- **Small commits**: Commit after each logical unit of work (one test passing, one component extracted)
- **No force-push to main**: Protect main branch, require PR review

### Code Review

- **All changes reviewed**: No direct commits to main; all changes via pull request
- **Constitution compliance**: Reviewers verify adherence to these principles
- **Test coverage check**: PR cannot merge if tests missing for new business logic
- **Performance verification**: Reviewer tests on physical device for user-facing changes

### Quality Gates

- **TypeScript compilation**: Zero errors, warnings must be justified
- **Linting**: ESLint and Prettier checks must pass
- **Tests passing**: All tests green before merge
- **Build verification**: App builds successfully for iOS and Android

## Architecture Constraints

### Technology Stack (Non-Negotiable)

- **Framework**: React Native for cross-platform mobile development
- **Language**: TypeScript with strict mode enabled
- **State management**: React Context + hooks for global state; avoid Redux unless justified
- **Storage**: AsyncStorage for MVP; migrate to SQLite when data exceeds 5MB
- **Navigation**: React Navigation v6+ following platform conventions

### Backend Architecture

- **No backend for MVP**: All functionality works using device storage
- **API-ready design**: Abstract data layer to support future RaceControl.gg integration
- **Optimistic UI**: Update UI immediately, sync in background when connected
- **Retry logic**: Failed API calls automatically retry with exponential backoff

### Data Layer

- **Repository pattern**: Abstract storage behind repository interfaces
- **Type-safe schemas**: Define TypeScript interfaces for all persisted entities
- **Migration support**: Plan for schema migrations when data structure changes
- **Race data adapters**: Abstract sim-specific logic (iRacing, ACC) into swappable adapters

## Governance

### Constitution Authority

This constitution supersedes all other development practices, guidelines, and preferences. When in doubt, these principles take precedence.

### Amendment Procedure

1. **Proposal**: Document proposed change with rationale in GitHub issue
2. **Impact analysis**: Identify affected code, tests, documentation
3. **Team review**: All active contributors must review and approve
4. **Migration plan**: For breaking changes, create step-by-step migration guide
5. **Version bump**: Increment CONSTITUTION_VERSION according to semantic versioning:
   - MAJOR: Backward-incompatible changes (removing/redefining principles)
   - MINOR: New principles or material expansions
   - PATCH: Clarifications, wording fixes, non-semantic refinements
6. **Documentation update**: Update this file and all referencing templates

### Compliance Review

- **PR reviews**: Every pull request checked against Core Principles compliance
- **Monthly audits**: Review codebase alignment with constitution principles
- **Complexity justification**: Any violation requires documented justification in PR description
- **Refactoring debt**: Track constitution violations as technical debt items

### Versioning Policy

- Constitution changes follow semantic versioning
- Version number appears in footer of this document
- Major version changes require team meeting and approval
- All templates in `.specify/templates/` must reference current constitution version

**Version**: 1.0.0 | **Ratified**: 2025-11-15 | **Last Amended**: 2025-11-15
