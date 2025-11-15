import {
  isValidISOString,
  parseUTC,
  formatLocalTime,
  isRaceLive,
  getCurrentDateInTimezone,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('isValidISOString', () => {
    it('should return true for valid ISO 8601 string', () => {
      expect(isValidISOString('2024-03-15T14:30:00Z')).toBe(true);
    });

    it('should return true for ISO string with milliseconds', () => {
      expect(isValidISOString('2024-03-15T14:30:00.000Z')).toBe(true);
    });

    it('should return true for ISO string with timezone offset', () => {
      expect(isValidISOString('2024-03-15T14:30:00+02:00')).toBe(true);
    });

    it('should return true for ISO string with negative timezone offset', () => {
      expect(isValidISOString('2024-03-15T14:30:00-05:00')).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidISOString('not a date')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidISOString('')).toBe(false);
    });

    it('should return false for MM/DD/YYYY format', () => {
      expect(isValidISOString('03/15/2024')).toBe(false);
    });

    it('should return false for invalid ISO format', () => {
      expect(isValidISOString('2024-13-45T25:70:00Z')).toBe(false);
    });

    it('should return false for partial ISO string', () => {
      expect(isValidISOString('2024-03-15')).toBe(false);
    });

    it('should return false for date without time', () => {
      expect(isValidISOString('2024-03-15T')).toBe(false);
    });
  });

  describe('parseUTC', () => {
    it('should parse valid ISO UTC string to Date object', () => {
      const date = parseUTC('2024-03-15T14:30:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2024-03-15T14:30:00.000Z');
    });

    it('should parse ISO string with milliseconds', () => {
      const date = parseUTC('2024-03-15T14:30:00.500Z');
      expect(date.toISOString()).toBe('2024-03-15T14:30:00.500Z');
    });

    it('should parse ISO string with timezone offset', () => {
      const date = parseUTC('2024-03-15T14:30:00+02:00');
      expect(date).toBeInstanceOf(Date);
      // Should convert to UTC
      expect(date.toISOString()).toBe('2024-03-15T12:30:00.000Z');
    });

    it('should parse ISO string with negative timezone offset', () => {
      const date = parseUTC('2024-03-15T14:30:00-05:00');
      expect(date).toBeInstanceOf(Date);
      // Should convert to UTC
      expect(date.toISOString()).toBe('2024-03-15T19:30:00.000Z');
    });

    it('should handle midnight correctly', () => {
      const date = parseUTC('2024-03-15T00:00:00Z');
      expect(date.toISOString()).toBe('2024-03-15T00:00:00.000Z');
    });

    it('should handle end of day correctly', () => {
      const date = parseUTC('2024-03-15T23:59:59Z');
      expect(date.toISOString()).toBe('2024-03-15T23:59:59.000Z');
    });

    it('should handle leap year date', () => {
      const date = parseUTC('2024-02-29T12:00:00Z');
      expect(date.toISOString()).toBe('2024-02-29T12:00:00.000Z');
    });
  });

  describe('formatLocalTime', () => {
    it('should format date to HH:mm format', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatLocalTime(date, 'HH:mm');
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format date to MMM d, yyyy format', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatLocalTime(date, 'MMM d, yyyy');
      expect(formatted).toBe('Mar 15, 2024');
    });

    it('should format date to yyyy-MM-dd format', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatLocalTime(date, 'yyyy-MM-dd');
      expect(formatted).toBe('2024-03-15');
    });

    it('should format date to full datetime format', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const formatted = formatLocalTime(date, 'PPpp');
      expect(formatted).toContain('Mar');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle midnight time', () => {
      const date = new Date('2024-03-15T00:00:00Z');
      const formatted = formatLocalTime(date, 'HH:mm');
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format with custom pattern', () => {
      const date = new Date('2024-03-15T14:30:45Z');
      const formatted = formatLocalTime(date, 'HH:mm:ss');
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('isRaceLive', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return false for race starting in future', () => {
      const startTime = '2024-03-15T14:00:00Z';
      const duration = 60;
      expect(isRaceLive(startTime, duration)).toBe(false);
    });

    it('should return true for race that just started', () => {
      const startTime = '2024-03-15T12:00:00Z';
      const duration = 60;
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return true for race in progress', () => {
      const startTime = '2024-03-15T11:30:00Z';
      const duration = 60;
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return true for race about to end', () => {
      const startTime = '2024-03-15T11:00:00Z';
      const duration = 60;
      // Current time is 12:00, race started at 11:00 for 60 min, ends at 12:00
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return false for race that finished', () => {
      const startTime = '2024-03-15T10:00:00Z';
      const duration = 60;
      expect(isRaceLive(startTime, duration)).toBe(false);
    });

    it('should return false for race that finished 1 minute ago', () => {
      const startTime = '2024-03-15T10:59:00Z';
      const duration = 60;
      expect(isRaceLive(startTime, duration)).toBe(false);
    });

    it('should handle 24 hour race correctly', () => {
      const startTime = '2024-03-14T12:00:00Z';
      const duration = 1440;
      // Started yesterday at 12:00 for 24h, should be ending now
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should handle 6 hour race correctly', () => {
      const startTime = '2024-03-15T08:00:00Z';
      const duration = 360;
      // Current time is 12:00, race started at 08:00 for 6h, ends at 14:00
      expect(isRaceLive(startTime, duration)).toBe(true);
    });

    it('should return false for zero duration race after start time', () => {
      const startTime = '2024-03-15T11:59:00Z';
      const duration = 0;
      expect(isRaceLive(startTime, duration)).toBe(false);
    });

    it('should handle edge case at exact start time', () => {
      const startTime = '2024-03-15T12:00:00.000Z';
      const duration = 30;
      expect(isRaceLive(startTime, duration)).toBe(true);
    });
  });

  describe('getCurrentDateInTimezone', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return current date in UTC timezone', () => {
      const date = getCurrentDateInTimezone('UTC');
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2024-03-15T12:00:00.000Z');
    });

    it('should return current date in America/New_York timezone', () => {
      const date = getCurrentDateInTimezone('America/New_York');
      expect(date).toBeInstanceOf(Date);
      // Should be the same instant in time, just different representation
      expect(date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
    });

    it('should return current date in Europe/Paris timezone', () => {
      const date = getCurrentDateInTimezone('Europe/Paris');
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
    });

    it('should return current date in Asia/Tokyo timezone', () => {
      const date = getCurrentDateInTimezone('Asia/Tokyo');
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
    });

    it('should return current date in Australia/Sydney timezone', () => {
      const date = getCurrentDateInTimezone('Australia/Sydney');
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
    });

    it('should handle Pacific/Auckland timezone', () => {
      const date = getCurrentDateInTimezone('Pacific/Auckland');
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
    });
  });
});
