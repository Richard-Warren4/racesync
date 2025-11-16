/**
 * AppNavigator - Main navigation configuration
 *
 * Sets up React Navigation stack navigator for the app.
 * Currently contains ScheduleScreen as the initial route.
 *
 * Future routes will include:
 * - Settings screen
 * - Race detail screen
 * - Favorites screen
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScheduleScreen } from '../features/schedules/screens/ScheduleScreen';

/**
 * Type definition for navigation stack parameters
 */
export type RootStackParamList = {
  Schedule: undefined;
  // Future screens will be added here
  // RaceDetail: { raceId: string };
  // Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator - Navigation stack configuration
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <NavigationContainer>
 *   <AppNavigator />
 * </NavigationContainer>
 * ```
 */
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Schedule"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#000000',
        },
      }}
    >
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          headerShown: false, // ScheduleScreen has its own header
        }}
      />
    </Stack.Navigator>
  );
};
