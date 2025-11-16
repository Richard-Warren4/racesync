/**
 * Unit tests for countdown calculation and formatting utilities
 *
 * Test ID: T031
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Countdown calculation for multiple time ranges
 * - Formatting for days + hours, hours + minutes, minutes only
 * - Edge cases: "Starting now" (<1 min), "Live" (already started)
 * - Duration formatting
 * - Race title formatting
 * - Time range calculation across day boundaries
 */

import { formatCountdown, formatDuration, formatRaceTitle, formatTimeRange } from '../../../../src/shared/utils/formatters';
import { Race } from '../../../../src/features/schedules/types/Race';

describe('Countdown Calculation (formatCountdown)', () => {
  // Mock Date.now() for predictable testing
  const MOCK_NOW = new Date('2024-03-15T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Multiple time ranges', () => {
    it('should format countdown with days and hours (>24 hours away)', () => {
      // 2 days 6 hours from now = 54 hours = 2024-03-17T18:00:00Z
      const startTime = '2024-03-17T18:00:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('2d 6h');
    });

    it('should format countdown with hours and minutes (1-24 hours away)', () => {
      // 2 hours 30 minutes from now = 2024-03-15T14:30:00Z
      const startTime = '2024-03-15T14:30:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('2h 30m');
    });

    it('should format countdown with minutes only (<1 hour away)', () => {
      // 45 minutes from now = 2024-03-15T12:45:00Z
      const startTime = '2024-03-15T12:45:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('45m');
    });

    it('should show "Starting now" when less than 1 minute away', () => {
      // 30 seconds from now
      const startTime = new Date(MOCK_NOW + 30000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('Starting now');
    });

    it('should show "Live" when race already started', () => {
      // 30 minutes ago = 2024-03-15T11:30:00Z
      const startTime = '2024-03-15T11:30:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('Live');
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly 1 minute away', () => {
      // Exactly 60 seconds = 1 minute
      const startTime = new Date(MOCK_NOW + 60000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('1m');
    });

    it('should handle exactly 1 hour away', () => {
      // Exactly 60 minutes
      const startTime = new Date(MOCK_NOW + 3600000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('1h 0m');
    });

    it('should handle exactly 24 hours away', () => {
      // Exactly 24 hours = 1 day
      const startTime = new Date(MOCK_NOW + 86400000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('1d 0h');
    });

    it('should handle race starting exactly at 0 seconds from now', () => {
      const startTime = new Date(MOCK_NOW).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('Starting now');
    });

    it('should handle large time differences (7 days)', () => {
      // 7 days from now
      const startTime = new Date(MOCK_NOW + 7 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('7d 0h');
    });

    it('should handle fractional hours correctly', () => {
      // 1 hour 15 minutes from now
      const startTime = new Date(MOCK_NOW + 75 * 60 * 1000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('1h 15m');
    });

    it('should round down partial minutes', () => {
      // 2 minutes 30 seconds from now
      const startTime = new Date(MOCK_NOW + 150000).toISOString();
      const result = formatCountdown(startTime);

      expect(result).toBe('2m');
    });
  });

  describe('Time boundary scenarios', () => {
    it('should handle countdown across day boundary', () => {
      // Current time: 23:30, race at 01:30 tomorrow (2 hours from now)
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-15T23:30:00Z').getTime());
      const startTime = '2024-03-16T01:30:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('2h 0m');
    });

    it('should handle countdown across month boundary', () => {
      // Current time: March 31, race on April 2 (2 days 6 hours)
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-31T12:00:00Z').getTime());
      const startTime = '2024-04-02T18:00:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('2d 6h');
    });

    it('should handle countdown across year boundary', () => {
      // Current time: Dec 31, race on Jan 2 next year
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-12-31T12:00:00Z').getTime());
      const startTime = '2025-01-02T12:00:00Z';
      const result = formatCountdown(startTime);

      expect(result).toBe('2d 0h');
    });
  });
});

describe('Duration Formatting (formatDuration)', () => {
  it('should format minutes only for durations under 1 hour', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(30)).toBe('30 min');
    expect(formatDuration(15)).toBe('15 min');
  });

  it('should format hours and minutes for durations >= 1 hour', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(120)).toBe('2h 0m');
    expect(formatDuration(360)).toBe('6h 0m');
  });

  it('should handle exactly 1 hour', () => {
    expect(formatDuration(60)).toBe('1h 0m');
  });

  it('should handle very long durations (24h race)', () => {
    expect(formatDuration(1440)).toBe('24h 0m');
  });

  it('should handle zero duration', () => {
    expect(formatDuration(0)).toBe('0 min');
  });

  it('should handle negative durations gracefully', () => {
    expect(formatDuration(-30)).toBe('0 min');
  });
});

describe('Race Title Formatting (formatRaceTitle)', () => {
  it('should format race title with car class and track name', () => {
    const race: Race = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'daily',
      tier: 'intermediate',
      trackName: 'Circuit de la Sarthe',
      trackConfiguration: '24h Layout',
      carClass: 'Hypercar',
      startTime: '2024-03-15T14:30:00Z',
      durationMinutes: 45,
      weatherCondition: 'Dynamic',
      timeOfDay: 'Afternoon',
      licenseRequirement: 'Silver',
      repeatInterval: 120,
      isLive: false
    };

    const result = formatRaceTitle(race);
    expect(result).toBe('Hypercar - Circuit de la Sarthe');
  });

  it('should format title for different car classes', () => {
    const baseRace: Partial<Race> = {
      type: 'daily',
      tier: 'beginner',
      trackName: 'Monza',
      trackConfiguration: null,
      startTime: '2024-03-15T14:30:00Z',
      durationMinutes: 30,
      weatherCondition: 'Clear',
      timeOfDay: 'Morning',
      licenseRequirement: 'Bronze',
      repeatInterval: 60,
      isLive: false
    };

    const lmp2Race = { ...baseRace, id: '1', carClass: 'LMP2' } as Race;
    const lmgt3Race = { ...baseRace, id: '2', carClass: 'LMGT3' } as Race;
    const multiClassRace = { ...baseRace, id: '3', carClass: 'Multi-class' } as Race;

    expect(formatRaceTitle(lmp2Race)).toBe('LMP2 - Monza');
    expect(formatRaceTitle(lmgt3Race)).toBe('LMGT3 - Monza');
    expect(formatRaceTitle(multiClassRace)).toBe('Multi-class - Monza');
  });
});

describe('Time Range Formatting (formatTimeRange)', () => {
  it('should format time range within same day', () => {
    // 14:30 - 15:15 (45 min race)
    const result = formatTimeRange('2024-03-15T14:30:00Z', 45);

    // Note: This will be in local timezone, but we're testing UTC interpretation
    // Result format: "HH:mm - HH:mm"
    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('should format time range across midnight', () => {
    // 23:00 - 01:00 (2 hour race crossing midnight)
    const result = formatTimeRange('2024-03-15T23:00:00Z', 120);

    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
    // Verify the format includes both times
    const [start, end] = result.split(' - ');
    expect(start).toBeDefined();
    expect(end).toBeDefined();
  });

  it('should handle short races (30 minutes)', () => {
    const result = formatTimeRange('2024-03-15T10:00:00Z', 30);
    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('should handle long races (6 hours)', () => {
    const result = formatTimeRange('2024-03-15T12:00:00Z', 360);
    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('should handle very long races (24 hours)', () => {
    const result = formatTimeRange('2024-03-15T12:00:00Z', 1440);
    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('should handle zero duration gracefully', () => {
    const result = formatTimeRange('2024-03-15T14:30:00Z', 0);
    expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
    // Start and end time should be the same
    const [start, end] = result.split(' - ');
    expect(start).toBe(end);
  });

  it('should handle negative duration gracefully', () => {
    const result = formatTimeRange('2024-03-15T14:30:00Z', -30);
    // Should treat negative as zero
    const [start, end] = result.split(' - ');
    expect(start).toBe(end);
  });
});
