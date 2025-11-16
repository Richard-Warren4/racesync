/**
 * Sample race data for development and testing
 *
 * This file provides mock race data matching the Race type definition.
 * Used for offline development and testing before API integration.
 */

import { Race } from '../features/schedules/types/Race';

export const sampleRaces: Race[] = [
  {
    id: '1',
    type: 'daily',
    tier: 'beginner',
    trackName: 'Circuit de la Sarthe',
    trackConfiguration: null,
    carClass: 'Hypercar',
    startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    durationMinutes: 45,
    weatherCondition: 'Clear',
    timeOfDay: 'Afternoon',
    licenseRequirement: 'Bronze',
    repeatInterval: 60,
    isLive: false,
  },
  {
    id: '2',
    type: 'daily',
    tier: 'intermediate',
    trackName: 'Monza',
    trackConfiguration: 'GP Layout',
    carClass: 'LMP2',
    startTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
    durationMinutes: 30,
    weatherCondition: 'Partly Cloudy',
    timeOfDay: 'Morning',
    licenseRequirement: 'Silver',
    repeatInterval: 120,
    isLive: false,
  },
  {
    id: '3',
    type: 'special',
    tier: null,
    trackName: 'Spa-Francorchamps',
    trackConfiguration: 'GP Layout',
    carClass: 'Multi-class',
    startTime: new Date(Date.now() + 180 * 60 * 1000).toISOString(), // 3 hours from now
    durationMinutes: 360,
    weatherCondition: 'Real Weather',
    timeOfDay: 'Full Day Cycle',
    licenseRequirement: 'Gold',
    repeatInterval: null,
    isLive: false,
  },
  {
    id: '4',
    type: 'daily',
    tier: 'advanced',
    trackName: 'Nürburgring',
    trackConfiguration: 'Nordschleife',
    carClass: 'GTE',
    startTime: new Date(Date.now() + 240 * 60 * 1000).toISOString(), // 4 hours from now
    durationMinutes: 60,
    weatherCondition: 'Rainy',
    timeOfDay: 'Evening',
    licenseRequirement: 'Gold',
    repeatInterval: 180,
    isLive: false,
  },
  {
    id: '5',
    type: 'championship',
    tier: null,
    trackName: 'Le Mans',
    trackConfiguration: '24 Hours Layout',
    carClass: 'Hypercar',
    startTime: new Date(Date.now() + 360 * 60 * 1000).toISOString(), // 6 hours from now
    durationMinutes: 1440,
    weatherCondition: 'Real Weather',
    timeOfDay: 'Full Day Cycle',
    licenseRequirement: 'Platinum',
    repeatInterval: null,
    isLive: false,
  },
];
