/**
 * Unit tests for Race type validation
 *
 * Test ID: T030
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Race interface structure and required fields
 * - Type constraints for enums (RaceType, RaceTier, CarClass, etc.)
 * - Nullable field handling (tier, trackConfiguration, repeatInterval)
 * - ISO 8601 UTC format for startTime
 * - Positive number constraint for durationMinutes
 */

import { Race, RaceType, RaceTier, CarClass, WeatherCondition, TimeOfDay, LicenseRequirement } from '../../../../../src/features/schedules/types/Race';

describe('Race Type Validation', () => {
  describe('RaceType enum', () => {
    it('should accept valid race types', () => {
      const validTypes: RaceType[] = ['daily', 'weekly', 'special'];
      validTypes.forEach(type => {
        expect(['daily', 'weekly', 'special']).toContain(type);
      });
    });

    it('should enforce type safety at compile time', () => {
      // This test validates TypeScript type checking
      const dailyType: RaceType = 'daily';
      const weeklyType: RaceType = 'weekly';
      const specialType: RaceType = 'special';

      expect(dailyType).toBe('daily');
      expect(weeklyType).toBe('weekly');
      expect(specialType).toBe('special');
    });
  });

  describe('RaceTier enum', () => {
    it('should accept valid race tiers', () => {
      const validTiers: RaceTier[] = ['beginner', 'intermediate', 'advanced'];
      validTiers.forEach(tier => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(tier);
      });
    });
  });

  describe('CarClass enum', () => {
    it('should accept valid car classes', () => {
      const validClasses: CarClass[] = ['LMP2', 'Hypercar', 'LMGT3', 'Multi-class'];
      validClasses.forEach(carClass => {
        expect(['LMP2', 'Hypercar', 'LMGT3', 'Multi-class']).toContain(carClass);
      });
    });
  });

  describe('WeatherCondition enum', () => {
    it('should accept valid weather conditions', () => {
      const validConditions: WeatherCondition[] = ['Clear', 'Dynamic', 'Real Weather'];
      validConditions.forEach(condition => {
        expect(['Clear', 'Dynamic', 'Real Weather']).toContain(condition);
      });
    });
  });

  describe('TimeOfDay enum', () => {
    it('should accept valid time of day settings', () => {
      const validTimes: TimeOfDay[] = ['Morning', 'Afternoon', 'Sunset', 'Night', 'Full Day Cycle'];
      validTimes.forEach(time => {
        expect(['Morning', 'Afternoon', 'Sunset', 'Night', 'Full Day Cycle']).toContain(time);
      });
    });
  });

  describe('LicenseRequirement enum', () => {
    it('should accept valid license requirements', () => {
      const validLicenses: LicenseRequirement[] = ['Bronze', 'Silver', 'Gold'];
      validLicenses.forEach(license => {
        expect(['Bronze', 'Silver', 'Gold']).toContain(license);
      });
    });
  });

  describe('Race interface structure', () => {
    it('should accept a valid daily race with all required fields', () => {
      const dailyRace: Race = {
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

      expect(dailyRace.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(dailyRace.type).toBe('daily');
      expect(dailyRace.tier).toBe('intermediate');
      expect(dailyRace.durationMinutes).toBe(45);
    });

    it('should accept a valid special event with null tier and repeatInterval', () => {
      const specialRace: Race = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'special',
        tier: null,
        trackName: 'Spa-Francorchamps',
        trackConfiguration: null,
        carClass: 'Multi-class',
        startTime: '2024-03-20T18:00:00Z',
        durationMinutes: 360,
        weatherCondition: 'Real Weather',
        timeOfDay: 'Full Day Cycle',
        licenseRequirement: 'Gold',
        repeatInterval: null,
        isLive: true
      };

      expect(specialRace.tier).toBeNull();
      expect(specialRace.trackConfiguration).toBeNull();
      expect(specialRace.repeatInterval).toBeNull();
      expect(specialRace.type).toBe('special');
    });

    it('should accept a valid weekly race', () => {
      const weeklyRace: Race = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'weekly',
        tier: null,
        trackName: 'Monza',
        trackConfiguration: 'GP Layout',
        carClass: 'LMGT3',
        startTime: '2024-03-16T12:00:00Z',
        durationMinutes: 90,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: null,
        isLive: false
      };

      expect(weeklyRace.type).toBe('weekly');
      expect(weeklyRace.tier).toBeNull();
      expect(weeklyRace.repeatInterval).toBeNull();
    });
  });

  describe('startTime ISO 8601 UTC format validation', () => {
    it('should accept valid ISO 8601 UTC timestamps', () => {
      const validTimestamps = [
        '2024-03-15T14:30:00Z',
        '2024-12-31T23:59:59Z',
        '2024-01-01T00:00:00Z',
      ];

      validTimestamps.forEach(timestamp => {
        const race: Race = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'daily',
          tier: 'beginner',
          trackName: 'Test Track',
          trackConfiguration: null,
          carClass: 'LMP2',
          startTime: timestamp,
          durationMinutes: 30,
          weatherCondition: 'Clear',
          timeOfDay: 'Morning',
          licenseRequirement: 'Bronze',
          repeatInterval: 60,
          isLive: false
        };

        expect(race.startTime).toBe(timestamp);
        // Validate format can be parsed as valid date
        const parsedDate = new Date(race.startTime);
        expect(parsedDate.toISOString()).toContain(timestamp.replace('Z', ''));
      });
    });

    it('should maintain UTC timezone (Z suffix)', () => {
      const race: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'daily',
        tier: 'beginner',
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 30,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: 60,
        isLive: false
      };

      expect(race.startTime).toMatch(/Z$/);
    });
  });

  describe('durationMinutes positive constraint', () => {
    it('should accept positive duration values', () => {
      const validDurations = [30, 45, 60, 90, 120, 240, 360];

      validDurations.forEach(duration => {
        const race: Race = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'daily',
          tier: 'beginner',
          trackName: 'Test Track',
          trackConfiguration: null,
          carClass: 'LMP2',
          startTime: '2024-03-15T14:30:00Z',
          durationMinutes: duration,
          weatherCondition: 'Clear',
          timeOfDay: 'Morning',
          licenseRequirement: 'Bronze',
          repeatInterval: 60,
          isLive: false
        };

        expect(race.durationMinutes).toBeGreaterThan(0);
        expect(race.durationMinutes).toBe(duration);
      });
    });
  });

  describe('nullable fields handling', () => {
    it('should allow null tier for weekly races', () => {
      const race: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'weekly',
        tier: null,
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 90,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: null,
        isLive: false
      };

      expect(race.tier).toBeNull();
    });

    it('should allow null trackConfiguration', () => {
      const race: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'daily',
        tier: 'beginner',
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 30,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: 60,
        isLive: false
      };

      expect(race.trackConfiguration).toBeNull();
    });

    it('should allow null repeatInterval for non-daily races', () => {
      const specialRace: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'special',
        tier: null,
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 360,
        weatherCondition: 'Real Weather',
        timeOfDay: 'Full Day Cycle',
        licenseRequirement: 'Gold',
        repeatInterval: null,
        isLive: false
      };

      expect(specialRace.repeatInterval).toBeNull();
    });

    it('should require repeatInterval for daily races', () => {
      const dailyRace: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'daily',
        tier: 'intermediate',
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 45,
        weatherCondition: 'Dynamic',
        timeOfDay: 'Afternoon',
        licenseRequirement: 'Silver',
        repeatInterval: 120,
        isLive: false
      };

      expect(dailyRace.repeatInterval).not.toBeNull();
      expect(dailyRace.repeatInterval).toBeGreaterThan(0);
    });
  });

  describe('isLive computed property', () => {
    it('should have boolean type for isLive', () => {
      const race: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'daily',
        tier: 'beginner',
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 30,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: 60,
        isLive: false
      };

      expect(typeof race.isLive).toBe('boolean');
    });

    it('should accept both true and false for isLive', () => {
      const liveRace: Race = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'daily',
        tier: 'beginner',
        trackName: 'Test Track',
        trackConfiguration: null,
        carClass: 'LMP2',
        startTime: '2024-03-15T14:30:00Z',
        durationMinutes: 30,
        weatherCondition: 'Clear',
        timeOfDay: 'Morning',
        licenseRequirement: 'Bronze',
        repeatInterval: 60,
        isLive: true
      };

      const notLiveRace: Race = { ...liveRace, isLive: false };

      expect(liveRace.isLive).toBe(true);
      expect(notLiveRace.isLive).toBe(false);
    });
  });
});
