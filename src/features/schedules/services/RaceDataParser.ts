/**
 * RaceDataParser Service
 *
 * Parses and validates JSON race data into typed Race objects.
 * Ensures data integrity and type safety when loading from external sources.
 *
 * Features:
 * - JSON parsing with validation
 * - Type checking and constraint validation
 * - isLive calculation based on current time
 * - Error handling for malformed data
 */

import { Race, RaceType, RaceTier, CarClass, WeatherCondition, TimeOfDay, LicenseRequirement } from '../types/Race';
import { isValidISOString } from '../../../shared/utils/dateUtils';
import { isRaceLive } from '../../../shared/utils/dateUtils';

/**
 * Raw race data from JSON (before validation)
 */
interface RawRaceData {
  id: string;
  type: string;
  tier?: string | null;
  trackName: string;
  trackConfiguration?: string | null;
  carClass: string;
  startTime: string;
  durationMinutes: number;
  weatherCondition: string;
  timeOfDay: string;
  licenseRequirement: string;
  repeatInterval?: number | null;
}

/**
 * Validation error for race data
 */
export class RaceDataValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'RaceDataValidationError';
  }
}

/**
 * Service for parsing and validating race data
 */
export class RaceDataParser {
  /**
   * Parses JSON string to Race objects array
   *
   * @param jsonData - JSON string containing race data
   * @returns Array of validated Race objects
   * @throws RaceDataValidationError if data is invalid
   *
   * @example
   * ```typescript
   * const parser = new RaceDataParser();
   * const jsonString = '[{"id": "...", "type": "daily", ...}]';
   * const races = parser.parseJSON(jsonString);
   * ```
   */
  parseJSON(jsonData: string): Race[] {
    try {
      const rawData = JSON.parse(jsonData);

      if (!Array.isArray(rawData)) {
        throw new RaceDataValidationError('Race data must be an array');
      }

      return rawData.map((item, index) => this.validateAndTransform(item, index));
    } catch (error) {
      if (error instanceof RaceDataValidationError) {
        throw error;
      }
      throw new RaceDataValidationError(`Failed to parse JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Parses Race objects from plain JavaScript object array
   *
   * @param data - Array of raw race data objects
   * @returns Array of validated Race objects
   *
   * @example
   * ```typescript
   * const parser = new RaceDataParser();
   * const rawRaces = await fetch('/api/races').then(r => r.json());
   * const races = parser.parse(rawRaces);
   * ```
   */
  parse(data: RawRaceData[]): Race[] {
    if (!Array.isArray(data)) {
      throw new RaceDataValidationError('Race data must be an array');
    }

    return data.map((item, index) => this.validateAndTransform(item, index));
  }

  /**
   * Validates and transforms a single raw race object
   *
   * @param raw - Raw race data
   * @param index - Index in array (for error messages)
   * @returns Validated Race object with computed isLive property
   * @private
   */
  private validateAndTransform(raw: any, index: number): Race {
    const context = `race at index ${index}`;

    // Validate required string fields
    this.validateRequiredString(raw.id, 'id', context);
    this.validateRequiredString(raw.trackName, 'trackName', context);

    // Validate and cast enum types
    const type = this.validateEnum(
      raw.type,
      ['daily', 'weekly', 'special'],
      'type',
      context
    ) as RaceType;

    const carClass = this.validateEnum(
      raw.carClass,
      ['LMP2', 'Hypercar', 'LMGT3', 'Multi-class'],
      'carClass',
      context
    ) as CarClass;

    const weatherCondition = this.validateEnum(
      raw.weatherCondition,
      ['Clear', 'Dynamic', 'Real Weather'],
      'weatherCondition',
      context
    ) as WeatherCondition;

    const timeOfDay = this.validateEnum(
      raw.timeOfDay,
      ['Morning', 'Afternoon', 'Sunset', 'Night', 'Full Day Cycle'],
      'timeOfDay',
      context
    ) as TimeOfDay;

    const licenseRequirement = this.validateEnum(
      raw.licenseRequirement,
      ['Bronze', 'Silver', 'Gold'],
      'licenseRequirement',
      context
    ) as LicenseRequirement;

    // Validate optional tier (required for daily, null for others)
    let tier: RaceTier | null = null;
    if (raw.tier !== undefined && raw.tier !== null) {
      tier = this.validateEnum(
        raw.tier,
        ['beginner', 'intermediate', 'advanced'],
        'tier',
        context
      ) as RaceTier;
    }

    // Validate startTime ISO 8601 format
    if (!isValidISOString(raw.startTime)) {
      throw new RaceDataValidationError(
        `Invalid startTime format for ${context}. Must be ISO 8601 UTC string.`,
        'startTime'
      );
    }

    // Validate durationMinutes is positive number
    const durationMinutes = Number(raw.durationMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new RaceDataValidationError(
        `durationMinutes must be a positive number for ${context}`,
        'durationMinutes'
      );
    }

    // Validate optional fields
    const trackConfiguration =
      raw.trackConfiguration !== undefined && raw.trackConfiguration !== null
        ? String(raw.trackConfiguration)
        : null;

    const repeatInterval =
      raw.repeatInterval !== undefined && raw.repeatInterval !== null
        ? Number(raw.repeatInterval)
        : null;

    // Validate repeatInterval is positive if provided
    if (repeatInterval !== null && (!Number.isFinite(repeatInterval) || repeatInterval <= 0)) {
      throw new RaceDataValidationError(
        `repeatInterval must be a positive number or null for ${context}`,
        'repeatInterval'
      );
    }

    // Calculate isLive based on current time
    const isLive = isRaceLive(raw.startTime, durationMinutes);

    return {
      id: raw.id,
      type,
      tier,
      trackName: raw.trackName,
      trackConfiguration,
      carClass,
      startTime: raw.startTime,
      durationMinutes,
      weatherCondition,
      timeOfDay,
      licenseRequirement,
      repeatInterval,
      isLive,
    };
  }

  /**
   * Validates a required string field
   * @private
   */
  private validateRequiredString(value: any, field: string, context: string): void {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new RaceDataValidationError(
        `${field} is required and must be a non-empty string for ${context}`,
        field
      );
    }
  }

  /**
   * Validates an enum value
   * @private
   */
  private validateEnum(
    value: any,
    validValues: string[],
    field: string,
    context: string
  ): string {
    if (!validValues.includes(value)) {
      throw new RaceDataValidationError(
        `${field} must be one of: ${validValues.join(', ')} for ${context}. Got: ${value}`,
        field
      );
    }
    return value;
  }
}
