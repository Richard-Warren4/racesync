/**
 * Unit tests for isLive calculation and date utilities
 *
 * Test ID: T033
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - isLive calculation based on start time and duration
 * - Race start/end boundary conditions
 * - ISO 8601 validation
 * - UTC time parsing
 * - Local time formatting
 */

import {
  isValidISOString,
  parseUTC,
  formatLocalTime,
  isRaceLive,
  getCurrentDateInTimezone,
} from '../../../../src/shared/utils/dateUtils';

describe('Date Utilities', () => {
  describe('isValidISOString', () => {
    it('should accept valid ISO 8601 UTC strings with Z suffix', () => {
      const validStrings = [
        '2024-03-15T14:30:00Z',
        '2024-12-31T23:59:59Z',
        '2024-01-01T00:00:00Z',
        '2024-02-29T12:00:00Z', // Leap year
      ];

      validStrings.forEach(str => {
        expect(isValidISOString(str)).toBe(true);
      });
    });

    it('should accept valid ISO 8601 strings with timezone offsets', () => {
      const validStrings = [
        '2024-03-15T14:30:00+02:00',
        '2024-03-15T14:30:00-05:00',
        '2024-03-15T14:30:00+00:00',
        '2024-03-15T14:30:00-08:00',
      ];

      validStrings.forEach(str => {
        expect(isValidISOString(str)).toBe(true);
      });
    });

    it('should reject strings without T separator', () => {
      const invalidStrings = [
        '2024-03-15 14:30:00',
        '2024-03-15',
        '14:30:00',
      ];

      invalidStrings.forEach(str => {
        expect(isValidISOString(str)).toBe(false);
      });
    });

    it('should reject strings without timezone', () => {
      const invalidStrings = [
        '2024-03-15T14:30:00',
        '2024-03-15T14:30',
      ];

      invalidStrings.forEach(str => {
        expect(isValidISOString(str)).toBe(false);
      });
    });

    it('should reject invalid date formats', () => {
      const invalidStrings = [
        'not a date',
        '03/15/2024',
        '2024-13-45T25:70:00Z', // Invalid month/day/time
        '',
        'undefined',
      ];

      invalidStrings.forEach(str => {
        expect(isValidISOString(str)).toBe(false);
      });
    });

    it('should reject non-string values', () => {
      expect(isValidISOString(null as any)).toBe(false);
      expect(isValidISOString(undefined as any)).toBe(false);
      expect(isValidISOString(123 as any)).toBe(false);
      expect(isValidISOString({} as any)).toBe(false);
    });

    it('should handle edge cases for valid dates', () => {
      expect(isValidISOString('1970-01-01T00:00:00Z')).toBe(true);
      expect(isValidISOString('2099-12-31T23:59:59Z')).toBe(true);
      expect(isValidISOString('2000-02-29T12:00:00Z')).toBe(true); // Leap year
    });

    it('should reject invalid leap year dates', () => {
      expect(isValidISOString('2023-02-29T12:00:00Z')).toBe(false); // Not a leap year
    });
  });

  describe('parseUTC', () => {
    it('should parse valid ISO 8601 UTC string to Date object', () => {
      const isoString = '2024-03-15T14:30:00Z';
      const date = parseUTC(isoString);

      expect(date).toBeInstanceOf(Date);
      // JavaScript adds .000 for milliseconds if not present
      expect(date.toISOString()).toContain('2024-03-15T14:30:00');
    });

    it('should parse ISO string with timezone offset to UTC', () => {
      // 14:30:00+02:00 should equal 12:30:00Z
      const isoString = '2024-03-15T14:30:00+02:00';
      const date = parseUTC(isoString);

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2024-03-15T12:30:00.000Z');
    });

    it('should handle negative timezone offsets', () => {
      // 14:30:00-05:00 should equal 19:30:00Z
      const isoString = '2024-03-15T14:30:00-05:00';
      const date = parseUTC(isoString);

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2024-03-15T19:30:00.000Z');
    });

    it('should preserve milliseconds if provided', () => {
      const isoString = '2024-03-15T14:30:00.123Z';
      const date = parseUTC(isoString);

      expect(date.toISOString()).toBe(isoString);
    });
  });

  describe('formatLocalTime', () => {
    const testDate = new Date('2024-03-15T14:30:00Z');

    it('should format date with HH:mm pattern', () => {
      const result = formatLocalTime(testDate, 'HH:mm');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date with MMM d, yyyy pattern', () => {
      const result = formatLocalTime(testDate, 'MMM d, yyyy');
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    it('should format date with yyyy-MM-dd pattern', () => {
      const result = formatLocalTime(testDate, 'yyyy-MM-dd');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format date with full datetime pattern', () => {
      const result = formatLocalTime(testDate, 'yyyy-MM-dd HH:mm:ss');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle custom format patterns', () => {
      const result = formatLocalTime(testDate, 'EEEE, MMMM do');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isRaceLive - Core Functionality', () => {
    const MOCK_NOW = new Date('2024-03-15T12:00:00Z').getTime();

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true when race is currently in progress', () => {
      // Race started 30 minutes ago, duration 60 min, so 30 minutes remaining
      const startTime = '2024-03-15T11:30:00Z';
      const duration = 60;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return false when race has not started yet', () => {
      // Race starts in 2 hours
      const startTime = '2024-03-15T14:00:00Z';
      const duration = 60;

      expect(isRaceLive(startTime, duration)).toBe(false);
    });

    it('should return false when race has already finished', () => {
      // Race started 2 hours ago, duration 60 min, so ended 1 hour ago
      const startTime = '2024-03-15T10:00:00Z';
      const duration = 60;

      expect(isRaceLive(startTime, duration)).toBe(false);
    });
  });

  describe('isRaceLive - Boundary Conditions', () => {
    const MOCK_NOW = new Date('2024-03-15T12:00:00Z').getTime();

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true at exact start time', () => {
      // Current time: 12:00:00, Start time: 12:00:00
      const startTime = '2024-03-15T12:00:00Z';
      const duration = 60;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return true at exact end time', () => {
      // Current time: 12:00:00, Started at 11:00:00, duration 60 min
      // End time: 12:00:00 (should still be considered live)
      const startTime = '2024-03-15T11:00:00Z';
      const duration = 60;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return false one millisecond after end time', () => {
      // Set current time to 1ms after race end
      const raceStart = new Date('2024-03-15T11:00:00Z').getTime();
      const duration = 60;
      const raceEnd = raceStart + duration * 60 * 1000;

      jest.spyOn(Date, 'now').mockReturnValue(raceEnd + 1);

      expect(isRaceLive('2024-03-15T11:00:00Z', duration)).toBe(false);
    });

    it('should return false one millisecond before start time', () => {
      // Set current time to 1ms before race start
      const raceStart = new Date('2024-03-15T12:00:00Z').getTime();

      jest.spyOn(Date, 'now').mockReturnValue(raceStart - 1);

      expect(isRaceLive('2024-03-15T12:00:00Z', 60)).toBe(false);
    });
  });

  describe('isRaceLive - Various Durations', () => {
    const MOCK_NOW = new Date('2024-03-15T12:00:00Z').getTime();

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle short races (15 minutes)', () => {
      const startTime = '2024-03-15T11:50:00Z';
      const duration = 15;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle standard races (45 minutes)', () => {
      const startTime = '2024-03-15T11:30:00Z';
      const duration = 45;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle long races (6 hours)', () => {
      const startTime = '2024-03-15T10:00:00Z';
      const duration = 360;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle very long races (24 hours)', () => {
      const startTime = '2024-03-14T12:00:00Z';
      const duration = 1440;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle zero duration races', () => {
      const startTime = '2024-03-15T12:00:00Z';
      const duration = 0;

      // At exact start time with 0 duration
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle very short races (1 minute)', () => {
      const startTime = '2024-03-15T11:59:30Z';
      const duration = 1;

      expect(isRaceLive(startTime, duration)).toBe(true);
    });
  });

  describe('isRaceLive - Time Boundaries', () => {
    it('should handle races crossing day boundary', () => {
      // Race starts at 23:00 on Mar 15, duration 2 hours, ends 01:00 on Mar 16
      // Current time: 00:00 on Mar 16 (midnight)
      const startTime = '2024-03-15T23:00:00Z';
      const duration = 120;
      const currentTime = new Date('2024-03-16T00:00:00Z').getTime();

      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle races crossing month boundary', () => {
      // Race starts at 23:00 on Mar 31, duration 2 hours, ends 01:00 on Apr 1
      const startTime = '2024-03-31T23:00:00Z';
      const duration = 120;
      const currentTime = new Date('2024-04-01T00:00:00Z').getTime();

      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle races crossing year boundary', () => {
      // Race starts at 23:00 on Dec 31, duration 2 hours, ends 01:00 on Jan 1
      const startTime = '2024-12-31T23:00:00Z';
      const duration = 120;
      const currentTime = new Date('2025-01-01T00:00:00Z').getTime();

      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      expect(isRaceLive(startTime, duration)).toBe(true);
    });
  });

  describe('isRaceLive - Edge Cases', () => {
    const MOCK_NOW = new Date('2024-03-15T12:00:00Z').getTime();

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle negative durations gracefully', () => {
      // Negative duration should be treated as immediate end
      const startTime = '2024-03-15T12:00:00Z';
      const duration = -60;

      // At start time with negative duration, calculation should fail safely
      const result = isRaceLive(startTime, duration);
      expect(typeof result).toBe('boolean');
    });

    it('should handle very large durations', () => {
      // Race that lasts 30 days
      const startTime = '2024-03-01T00:00:00Z';
      const duration = 30 * 24 * 60; // 30 days in minutes

      expect(isRaceLive(startTime, duration)).toBe(true);
    });
  });

  describe('getCurrentDateInTimezone', () => {
    it('should return a Date object for any timezone', () => {
      const date = getCurrentDateInTimezone('America/New_York');
      expect(date).toBeInstanceOf(Date);
    });

    it('should return current moment for UTC', () => {
      const before = Date.now();
      const date = getCurrentDateInTimezone('UTC');
      const after = Date.now();

      const timestamp = date.getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should return same instant for different timezones', () => {
      const nyDate = getCurrentDateInTimezone('America/New_York');
      const parisDate = getCurrentDateInTimezone('Europe/Paris');
      const tokyoDate = getCurrentDateInTimezone('Asia/Tokyo');

      // All should represent the same instant in time (within a few ms)
      const diff1 = Math.abs(nyDate.getTime() - parisDate.getTime());
      const diff2 = Math.abs(parisDate.getTime() - tokyoDate.getTime());

      expect(diff1).toBeLessThan(10); // Within 10ms
      expect(diff2).toBeLessThan(10);
    });

    it('should handle invalid timezone gracefully', () => {
      // The function should still return a date even with invalid timezone
      const date = getCurrentDateInTimezone('Invalid/Timezone');
      expect(date).toBeInstanceOf(Date);
    });
  });
});
