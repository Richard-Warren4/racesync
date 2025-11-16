import {
  getDeviceTimezone,
  convertUTCToLocal,
  recalculateOnTimezoneChange,
  formatInTimezone,
} from '../timezoneUtils';

describe('timezoneUtils', () => {
  describe('getDeviceTimezone', () => {
    it('should return a valid IANA timezone string', () => {
      const timezone = getDeviceTimezone();
      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe('string');
      // Should be in format like 'America/New_York' or 'Europe/Paris'
      // At minimum, should not be empty
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('should return consistent timezone on multiple calls', () => {
      const tz1 = getDeviceTimezone();
      const tz2 = getDeviceTimezone();
      expect(tz1).toBe(tz2);
    });

    it('should return a timezone that can be used with Intl.DateTimeFormat', () => {
      const timezone = getDeviceTimezone();
      expect(() => {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      }).not.toThrow();
    });
  });

  describe('convertUTCToLocal', () => {
    it('should convert UTC ISO string to local ISO string', () => {
      const utcString = '2024-03-15T14:30:00Z';
      const localString = convertUTCToLocal(utcString);

      expect(localString).toBeTruthy();
      expect(typeof localString).toBe('string');
      // Should be a valid ISO string
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle midnight UTC correctly', () => {
      const utcString = '2024-03-15T00:00:00Z';
      const localString = convertUTCToLocal(utcString);

      expect(localString).toBeTruthy();
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle end of day UTC correctly', () => {
      const utcString = '2024-03-15T23:59:59Z';
      const localString = convertUTCToLocal(utcString);

      expect(localString).toBeTruthy();
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle UTC string with milliseconds', () => {
      const utcString = '2024-03-15T14:30:00.500Z';
      const localString = convertUTCToLocal(utcString);

      expect(localString).toBeTruthy();
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle UTC string with timezone offset', () => {
      const utcString = '2024-03-15T14:30:00+00:00';
      const localString = convertUTCToLocal(utcString);

      expect(localString).toBeTruthy();
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should preserve the date information', () => {
      const utcString = '2024-03-15T12:00:00Z';
      const localString = convertUTCToLocal(utcString);

      // The date should be present in the result (though it might change depending on timezone)
      expect(localString).toContain('2024');
    });
  });

  describe('formatInTimezone', () => {
    it('should format date in America/New_York timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'America/New_York', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date in Europe/Paris timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'Europe/Paris', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date in Asia/Tokyo timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'Asia/Tokyo', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date in UTC timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'UTC', 'HH:mm');

      expect(formatted).toBe('14:30');
    });

    it('should handle different format patterns', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'UTC', 'yyyy-MM-dd HH:mm:ss');

      expect(formatted).toBe('2024-03-15 14:30:00');
    });

    it('should format with MMM d, yyyy pattern', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'UTC', 'MMM d, yyyy');

      expect(formatted).toBe('Mar 15, 2024');
    });

    it('should handle Australia/Sydney timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'Australia/Sydney', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle Pacific/Auckland timezone', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatInTimezone(date, 'Pacific/Auckland', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle midnight correctly in different timezones', () => {
      const date = new Date('2024-03-15T00:00:00Z');
      const formatted = formatInTimezone(date, 'UTC', 'HH:mm');

      expect(formatted).toBe('00:00');
    });

    it('should handle DST transitions - spring forward (America/New_York)', () => {
      // March 10, 2024 at 2:00 AM EDT - DST starts
      const date = new Date('2024-03-10T07:00:00Z'); // 2 AM EST = 7 AM UTC before DST
      const formatted = formatInTimezone(date, 'America/New_York', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle DST transitions - fall back (America/New_York)', () => {
      // November 3, 2024 at 2:00 AM EST - DST ends
      const date = new Date('2024-11-03T06:00:00Z'); // 2 AM EDT = 6 AM UTC before fall back
      const formatted = formatInTimezone(date, 'America/New_York', 'HH:mm');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('recalculateOnTimezoneChange', () => {
    it('should return a cleanup function', () => {
      const callback = jest.fn();
      const cleanup = recalculateOnTimezoneChange(callback);

      expect(typeof cleanup).toBe('function');

      // Clean up
      cleanup();
    });

    it('should not throw when cleanup is called', () => {
      const callback = jest.fn();
      const cleanup = recalculateOnTimezoneChange(callback);

      expect(() => cleanup()).not.toThrow();
    });

    it('should handle multiple registrations and cleanups', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const cleanup1 = recalculateOnTimezoneChange(callback1);
      const cleanup2 = recalculateOnTimezoneChange(callback2);

      expect(() => {
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

    it('should accept different callback types', () => {
      const arrowFn = () => {};
      const regularFn = function() {};
      const asyncFn = async () => {};

      const cleanup1 = recalculateOnTimezoneChange(arrowFn);
      const cleanup2 = recalculateOnTimezoneChange(regularFn);
      const cleanup3 = recalculateOnTimezoneChange(asyncFn);

      expect(typeof cleanup1).toBe('function');
      expect(typeof cleanup2).toBe('function');
      expect(typeof cleanup3).toBe('function');

      cleanup1();
      cleanup2();
      cleanup3();
    });
  });
});
