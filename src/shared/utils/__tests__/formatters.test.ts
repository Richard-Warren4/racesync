import { formatCountdown, formatDuration, formatRaceTitle, formatTimeRange } from '../formatters';
import { Race } from '../../../features/schedules/types/Race';

describe('formatters', () => {
  describe('formatCountdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "2h 30m" for race starting in 2.5 hours', () => {
      const startTime = '2024-03-15T14:30:00Z';
      expect(formatCountdown(startTime)).toBe('2h 30m');
    });

    it('should return "1h 15m" for race starting in 1 hour 15 minutes', () => {
      const startTime = '2024-03-15T13:15:00Z';
      expect(formatCountdown(startTime)).toBe('1h 15m');
    });

    it('should return "45m" for race starting in 45 minutes', () => {
      const startTime = '2024-03-15T12:45:00Z';
      expect(formatCountdown(startTime)).toBe('45m');
    });

    it('should return "5m" for race starting in 5 minutes', () => {
      const startTime = '2024-03-15T12:05:00Z';
      expect(formatCountdown(startTime)).toBe('5m');
    });

    it('should return "Starting now" for race starting in less than 1 minute', () => {
      const startTime = '2024-03-15T12:00:30Z';
      expect(formatCountdown(startTime)).toBe('Starting now');
    });

    it('should return "Live" for race that already started', () => {
      const startTime = '2024-03-15T11:30:00Z';
      expect(formatCountdown(startTime)).toBe('Live');
    });

    it('should return "Live" for race that started 1 minute ago', () => {
      const startTime = '2024-03-15T11:59:00Z';
      expect(formatCountdown(startTime)).toBe('Live');
    });

    it('should return "1d 12h" for race starting in 1.5 days', () => {
      const startTime = '2024-03-17T00:00:00Z';
      expect(formatCountdown(startTime)).toBe('1d 12h');
    });

    it('should return "2d 6h" for race starting in 2.25 days', () => {
      const startTime = '2024-03-17T18:00:00Z';
      expect(formatCountdown(startTime)).toBe('2d 6h');
    });

    it('should return "3h 0m" for race starting in exactly 3 hours', () => {
      const startTime = '2024-03-15T15:00:00Z';
      expect(formatCountdown(startTime)).toBe('3h 0m');
    });

    it('should handle edge case of exactly 1 hour', () => {
      const startTime = '2024-03-15T13:00:00Z';
      expect(formatCountdown(startTime)).toBe('1h 0m');
    });

    it('should handle edge case of exactly 1 day', () => {
      const startTime = '2024-03-16T12:00:00Z';
      expect(formatCountdown(startTime)).toBe('1d 0h');
    });
  });

  describe('formatDuration', () => {
    it('should format 15 minutes as "15 min"', () => {
      expect(formatDuration(15)).toBe('15 min');
    });

    it('should format 45 minutes as "45 min"', () => {
      expect(formatDuration(45)).toBe('45 min');
    });

    it('should format 59 minutes as "59 min"', () => {
      expect(formatDuration(59)).toBe('59 min');
    });

    it('should format 60 minutes as "1h 0m"', () => {
      expect(formatDuration(60)).toBe('1h 0m');
    });

    it('should format 90 minutes as "1h 30m"', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('should format 120 minutes as "2h 0m"', () => {
      expect(formatDuration(120)).toBe('2h 0m');
    });

    it('should format 360 minutes as "6h 0m"', () => {
      expect(formatDuration(360)).toBe('6h 0m');
    });

    it('should format 1440 minutes as "24h 0m"', () => {
      expect(formatDuration(1440)).toBe('24h 0m');
    });

    it('should format 1485 minutes as "24h 45m"', () => {
      expect(formatDuration(1485)).toBe('24h 45m');
    });

    it('should handle edge case of 0 minutes', () => {
      expect(formatDuration(0)).toBe('0 min');
    });

    it('should handle edge case of 1 minute', () => {
      expect(formatDuration(1)).toBe('1 min');
    });

    it('should handle negative duration gracefully', () => {
      expect(formatDuration(-10)).toBe('0 min');
    });
  });

  describe('formatRaceTitle', () => {
    it('should format Hypercar race title correctly', () => {
      const race: Race = {
        id: '1',
        title: 'Daily Race A',
        category: 'Hypercar',
        track: 'Circuit de la Sarthe',
        startTime: '2024-03-15T14:00:00Z',
        durationMinutes: 45,
      };
      expect(formatRaceTitle(race)).toBe('Hypercar - Circuit de la Sarthe');
    });

    it('should format LMP2 race title correctly', () => {
      const race: Race = {
        id: '2',
        title: 'Daily Race B',
        category: 'LMP2',
        track: 'Monza',
        startTime: '2024-03-15T15:00:00Z',
        durationMinutes: 30,
      };
      expect(formatRaceTitle(race)).toBe('LMP2 - Monza');
    });

    it('should format LMGT3 race title correctly', () => {
      const race: Race = {
        id: '3',
        title: 'Weekly Race',
        category: 'LMGT3',
        track: 'Spa-Francorchamps',
        startTime: '2024-03-15T16:00:00Z',
        durationMinutes: 60,
      };
      expect(formatRaceTitle(race)).toBe('LMGT3 - Spa-Francorchamps');
    });

    it('should format Multi-class race title correctly', () => {
      const race: Race = {
        id: '4',
        title: 'Special Event',
        category: 'Multi-class',
        track: 'Nürburgring',
        startTime: '2024-03-15T17:00:00Z',
        durationMinutes: 360,
      };
      expect(formatRaceTitle(race)).toBe('Multi-class - Nürburgring');
    });

    it('should handle race with series information', () => {
      const race: Race = {
        id: '5',
        title: 'Championship Round 3',
        category: 'Hypercar',
        track: 'Circuit de la Sarthe',
        startTime: '2024-03-15T18:00:00Z',
        durationMinutes: 240,
        series: 'World Endurance Championship',
      };
      expect(formatRaceTitle(race)).toBe('Hypercar - Circuit de la Sarthe');
    });

    it('should handle race with long track name', () => {
      const race: Race = {
        id: '6',
        title: 'Test Race',
        category: 'LMP2',
        track: 'Circuit de Spa-Francorchamps (Grand Prix)',
        startTime: '2024-03-15T19:00:00Z',
        durationMinutes: 90,
      };
      expect(formatRaceTitle(race)).toBe('LMP2 - Circuit de Spa-Francorchamps (Grand Prix)');
    });
  });

  describe('formatTimeRange', () => {
    it('should format time range for 45 minute race', () => {
      const startTime = '2024-03-15T14:30:00Z';
      const duration = 45;
      expect(formatTimeRange(startTime, duration)).toBe('14:30 - 15:15');
    });

    it('should format time range for 1 hour race', () => {
      const startTime = '2024-03-15T10:00:00Z';
      const duration = 60;
      expect(formatTimeRange(startTime, duration)).toBe('10:00 - 11:00');
    });

    it('should format time range for 6 hour race', () => {
      const startTime = '2024-03-15T08:00:00Z';
      const duration = 360;
      expect(formatTimeRange(startTime, duration)).toBe('08:00 - 14:00');
    });

    it('should format time range crossing midnight', () => {
      const startTime = '2024-03-15T23:00:00Z';
      const duration = 120;
      expect(formatTimeRange(startTime, duration)).toBe('23:00 - 01:00');
    });

    it('should format time range for 24 hour race', () => {
      const startTime = '2024-03-15T15:00:00Z';
      const duration = 1440;
      expect(formatTimeRange(startTime, duration)).toBe('15:00 - 15:00');
    });

    it('should handle edge case of 0 duration', () => {
      const startTime = '2024-03-15T12:00:00Z';
      const duration = 0;
      expect(formatTimeRange(startTime, duration)).toBe('12:00 - 12:00');
    });

    it('should handle edge case of 1 minute duration', () => {
      const startTime = '2024-03-15T12:00:00Z';
      const duration = 1;
      expect(formatTimeRange(startTime, duration)).toBe('12:00 - 12:01');
    });

    it('should format morning time correctly', () => {
      const startTime = '2024-03-15T06:30:00Z';
      const duration = 90;
      expect(formatTimeRange(startTime, duration)).toBe('06:30 - 08:00');
    });

    it('should handle negative duration gracefully', () => {
      const startTime = '2024-03-15T12:00:00Z';
      const duration = -30;
      expect(formatTimeRange(startTime, duration)).toBe('12:00 - 12:00');
    });
  });
});
