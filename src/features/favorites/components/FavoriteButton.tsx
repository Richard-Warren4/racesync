import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  /**
   * ID of the race to favorite/unfavorite
   */
  raceId: string;

  /**
   * Size of the star icon (default: 24)
   */
  size?: number;

  /**
   * Color of the star when favorited (default: '#FFD700')
   */
  favoritedColor?: string;

  /**
   * Color of the star when not favorited (default: '#CCCCCC')
   */
  unfavoritedColor?: string;

  /**
   * Optional callback when favorite status changes
   */
  onToggle?: (isFavorited: boolean) => void;

  /**
   * Whether to enable notifications when favoriting (default: false)
   */
  enableNotifications?: boolean;
}

/**
 * FavoriteButton component displays a star icon that toggles favorite status
 * Star is filled when the race is favorited, outlined when not favorited
 * Component is under 200 lines as required
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  raceId,
  size = 24,
  favoritedColor = '#FFD700',
  unfavoritedColor = '#CCCCCC',
  onToggle,
  enableNotifications = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorite(raceId);

  const handlePress = async (): Promise<void> => {
    try {
      setIsToggling(true);
      await toggleFavorite(raceId, enableNotifications);

      // Call optional callback
      if (onToggle) {
        onToggle(!favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isToggling}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: favorited }}
      testID={`favorite-button-${raceId}`}
    >
      {isToggling ? (
        <ActivityIndicator size="small" color={favoritedColor} />
      ) : (
        <Text
          style={[
            styles.starIcon,
            {
              fontSize: size,
              color: favorited ? favoritedColor : unfavoritedColor,
            },
          ]}
        >
          {favorited ? '★' : '☆'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
