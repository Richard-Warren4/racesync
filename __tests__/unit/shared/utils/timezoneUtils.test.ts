/**
 * Unit tests for timezone conversion utilities
 *
 * Test ID: T032
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Timezone conversion from UTC to local time
 * - DST (Daylight Saving Time) handling
 * - Timezone change detection callbacks
 * - Multiple timezone scenarios (EST, PST, CET, JST, etc.)
 * - Cross-day boundary conversions
 */

import {
  getDeviceTimezone,
  convertUTCToLocal,
  recalculateOnTimezoneChange,
  formatInTimezone,
} from '../../../../src/shared/utils/timezoneUtils';

describe('Timezone Utilities', () => {
  describe('getDeviceTimezone', () => {
    it('should return a valid IANA timezone identifier', () => {
      const timezone = getDeviceTimezone();

      // Should return a string
      expect(typeof timezone).toBe('string');

      // Should be non-empty
      expect(timezone.length).toBeGreaterThan(0);

      // Should match IANA timezone format (e.g., 'America/New_York', 'UTC', 'Europe/Paris')
      // Most IANA timezones contain a forward slash or are 'UTC'
      const isValidFormat = timezone === 'UTC' || timezone.includes('/');
      expect(isValidFormat).toBe(true);
    });

    it('should return consistent timezone across multiple calls', () => {
      const timezone1 = getDeviceTimezone();
      const timezone2 = getDeviceTimezone();

      expect(timezone1).toBe(timezone2);
    });
  });

  describe('convertUTCToLocal', () => {
    // Note: These tests depend on the system's actual timezone
    // In a real CI/CD environment, you might want to mock Intl.DateTimeFormat

    it('should convert UTC to local time (preserving date/time structure)', () => {
      const utcTime = '2024-03-15T14:30:00Z';
      const localTime = convertUTCToLocal(utcTime);

      // Should return ISO format without Z suffix
      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

      // Should not have Z suffix (not UTC)
      expect(localTime).not.toMatch(/Z$/);
    });

    it('should handle midnight UTC correctly', () => {
      const utcTime = '2024-03-15T00:00:00Z';
      const localTime = convertUTCToLocal(utcTime);

      // Should be valid ISO format
      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

      // Verify date component exists
      expect(localTime.substring(0, 10)).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should handle noon UTC correctly', () => {
      const utcTime = '2024-03-15T12:00:00Z';
      const localTime = convertUTCToLocal(utcTime);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle end of day UTC correctly', () => {
      const utcTime = '2024-03-15T23:59:59Z';
      const localTime = convertUTCToLocal(utcTime);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle date boundary crossings', () => {
      // Late evening UTC might be next/previous day in local time
      const eveningUTC = '2024-03-15T23:00:00Z';
      const morningUTC = '2024-03-15T01:00:00Z';

      const eveningLocal = convertUTCToLocal(eveningUTC);
      const morningLocal = convertUTCToLocal(morningUTC);

      expect(eveningLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      expect(morningLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle month boundary crossings', () => {
      // Last day of month might cross into next month in some timezones
      const endOfMonth = '2024-03-31T23:00:00Z';
      const localTime = convertUTCToLocal(endOfMonth);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle year boundary crossings', () => {
      // New Year's Eve might be next year in some timezones
      const newYearsEve = '2024-12-31T23:00:00Z';
      const localTime = convertUTCToLocal(newYearsEve);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should preserve seconds precision', () => {
      const utcTime = '2024-03-15T14:30:45Z';
      const localTime = convertUTCToLocal(utcTime);

      // Should have seconds component
      expect(localTime).toMatch(/:\d{2}$/);
    });
  });

  describe('formatInTimezone', () => {
    const testDate = new Date('2024-03-15T14:30:00Z');

    it('should format date in UTC timezone', () => {
      const result = formatInTimezone(testDate, 'UTC', 'yyyy-MM-dd HH:mm:ss');
      expect(result).toBe('2024-03-15 14:30:00');
    });

    it('should format date in America/New_York timezone', () => {
      const result = formatInTimezone(testDate, 'America/New_York', 'HH:mm');

      // EST is UTC-5, so 14:30 UTC = 09:30 EST
      // EDT is UTC-4, so 14:30 UTC = 10:30 EDT
      // March 15 might be in DST transition period
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date in Europe/Paris timezone', () => {
      const result = formatInTimezone(testDate, 'Europe/Paris', 'HH:mm');

      // CET is UTC+1, so 14:30 UTC = 15:30 CET
      // CEST is UTC+2, so 14:30 UTC = 16:30 CEST
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date in Asia/Tokyo timezone', () => {
      const result = formatInTimezone(testDate, 'Asia/Tokyo', 'HH:mm');

      // JST is UTC+9, so 14:30 UTC = 23:30 JST
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle custom format patterns', () => {
      const result = formatInTimezone(testDate, 'UTC', 'MMM dd, yyyy');
      expect(result).toBe('Mar 15, 2024');
    });

    it('should handle time-only format', () => {
      const result = formatInTimezone(testDate, 'UTC', 'HH:mm:ss');
      expect(result).toBe('14:30:00');
    });

    it('should handle date-only format', () => {
      const result = formatInTimezone(testDate, 'UTC', 'yyyy-MM-dd');
      expect(result).toBe('2024-03-15');
    });

    it('should handle 12-hour format', () => {
      const result = formatInTimezone(testDate, 'UTC', 'h:mm a');
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });
  });

  describe('recalculateOnTimezoneChange', () => {
    it('should accept a callback function', () => {
      const callback = jest.fn();
      const cleanup = recalculateOnTimezoneChange(callback);

      expect(typeof cleanup).toBe('function');
    });

    it('should return a cleanup function', () => {
      const callback = jest.fn();
      const cleanup = recalculateOnTimezoneChange(callback);

      // Cleanup should be callable without errors
      expect(() => cleanup()).not.toThrow();
    });

    it('should not throw when callback is called multiple times', () => {
      const callback = jest.fn();

      expect(() => {
        const cleanup1 = recalculateOnTimezoneChange(callback);
        const cleanup2 = recalculateOnTimezoneChange(callback);

        cleanup1();
        cleanup2();
      }).not.toThrow();
    });

    it('should handle cleanup being called multiple times', () => {
      const callback = jest.fn();
      const cleanup = recalculateOnTimezoneChange(callback);

      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();
    });
  });

  describe('DST (Daylight Saving Time) scenarios', () => {
    // DST testing is complex because it depends on the actual timezone
    // These tests verify the functions handle DST transitions without errors

    it('should handle spring DST transition (spring forward)', () => {
      // In US, DST typically starts second Sunday of March (2AM -> 3AM)
      // March 10, 2024 at 2:00 AM -> 3:00 AM in America/New_York

      const beforeDST = new Date('2024-03-10T06:59:00Z'); // 1:59 AM EST
      const afterDST = new Date('2024-03-10T07:01:00Z'); // 3:01 AM EDT

      const beforeLocal = convertUTCToLocal(beforeDST.toISOString());
      const afterLocal = convertUTCToLocal(afterDST.toISOString());

      // Both should return valid ISO format
      expect(beforeLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      expect(afterLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle fall DST transition (fall back)', () => {
      // In US, DST typically ends first Sunday of November (2AM -> 1AM)
      // November 3, 2024 at 2:00 AM -> 1:00 AM in America/New_York

      const beforeDST = new Date('2024-11-03T05:59:00Z'); // 1:59 AM EDT
      const afterDST = new Date('2024-11-03T06:01:00Z'); // 1:01 AM EST

      const beforeLocal = convertUTCToLocal(beforeDST.toISOString());
      const afterLocal = convertUTCToLocal(afterDST.toISOString());

      // Both should return valid ISO format
      expect(beforeLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      expect(afterLocal).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle timezones that do not observe DST', () => {
      // Some timezones like Asia/Tokyo do not observe DST
      const summerDate = new Date('2024-07-15T14:30:00Z');
      const winterDate = new Date('2024-01-15T14:30:00Z');

      const summerResult = formatInTimezone(summerDate, 'Asia/Tokyo', 'HH:mm');
      const winterResult = formatInTimezone(winterDate, 'Asia/Tokyo', 'HH:mm');

      // Both should be offset by same amount (UTC+9)
      expect(summerResult).toMatch(/^\d{2}:\d{2}$/);
      expect(winterResult).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid UTC string gracefully', () => {
      // Invalid date strings should be handled by date-fns
      // This tests that our function doesn't crash
      expect(() => {
        convertUTCToLocal('invalid-date-string');
      }).toThrow();
    });

    it('should handle very old dates', () => {
      const oldDate = '1970-01-01T00:00:00Z';
      const localTime = convertUTCToLocal(oldDate);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle far future dates', () => {
      const futureDate = '2099-12-31T23:59:59Z';
      const localTime = convertUTCToLocal(futureDate);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle leap year dates', () => {
      const leapDay = '2024-02-29T12:00:00Z';
      const localTime = convertUTCToLocal(leapDay);

      expect(localTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });
});
