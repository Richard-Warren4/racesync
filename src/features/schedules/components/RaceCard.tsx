import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Race } from '../types/Race';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';

interface RaceCardProps {
  race: Race;
}

/**
 * RaceCard component displays a single race event
 * Includes a FavoriteButton to toggle favorite status
 */
export const RaceCard: React.FC<RaceCardProps> = ({ race }) => {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{race.name}</Text>
        <FavoriteButton raceId={race.id} />
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{race.category}</Text>
        <Text style={styles.dateTime}>
          {formatDate(race.startTime)} at {formatTime(race.startTime)}
        </Text>
        <Text style={styles.location}>{race.location}</Text>
        {race.description && (
          <Text style={styles.description}>{race.description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  details: {
    gap: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
