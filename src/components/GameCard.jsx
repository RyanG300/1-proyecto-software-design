import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { getImageUrl } from '../services/igdbApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = isWeb && SCREEN_WIDTH >= 768;

const GameCard = ({ game, onPress, style }) => {
  const coverUrl = game.cover?.image_id 
    ? getImageUrl(game.cover.image_id, 'cover_big')
    : null;

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    return Math.round(rating);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.getFullYear();
  };

  const getRatingColor = (rating) => {
    if (!rating) return '#666';
    if (rating >= 80) return '#4CAF50'; // Verde
    if (rating >= 60) return '#FFC107'; // Amarillo
    return '#F44336'; // Rojo
  };

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={() => onPress && onPress(game)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {coverUrl ? (
          <Image 
            source={{ uri: coverUrl }} 
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {game.rating && (
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(game.rating) }]}>
            <Text style={styles.ratingText}>{formatRating(game.rating)}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {game.name}
        </Text>
        
        {game.genres && game.genres.length > 0 && (
          <Text style={styles.genres} numberOfLines={1}>
            {game.genres.map(g => g.name).join(', ')}
          </Text>
        )}
        
        <View style={styles.bottomRow}>
          {game.first_release_date && (
            <Text style={styles.year}>
              {formatDate(game.first_release_date)}
            </Text>
          )}
          
          {game.platforms && game.platforms.length > 0 && (
            <Text style={styles.platforms} numberOfLines={1}>
              {game.platforms.slice(0, 2).map(p => p.name).join(', ')}
              {game.platforms.length > 2 && ` +${game.platforms.length - 2}`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getCardWidth = () => {
  if (!isWeb) return 150; // Mobile
  if (SCREEN_WIDTH >= 1536) return 220; // 2XL screens
  if (SCREEN_WIDTH >= 1280) return 200; // XL screens
  if (SCREEN_WIDTH >= 1024) return 180; // Large screens
  if (SCREEN_WIDTH >= 768) return 160;  // Medium screens
  return 150; // Small screens
};

const styles = StyleSheet.create({
  card: {
    width: getCardWidth(),
    marginRight: isLargeScreen ? 20 : 15,
    marginBottom: isLargeScreen ? 20 : 15,
    backgroundColor: '#1a1a2e',
    borderRadius: isLargeScreen ? 16 : 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isLargeScreen ? 4 : 2 },
    shadowOpacity: isLargeScreen ? 0.4 : 0.3,
    shadowRadius: isLargeScreen ? 8 : 4,
    ...(isWeb && {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    }),
  },
  imageContainer: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: isLargeScreen ? 280 : 200,
  },
  placeholderCover: {
    backgroundColor: '#0f0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    padding: isLargeScreen ? 14 : 10,
  },
  title: {
    color: '#fff',
    fontSize: isLargeScreen ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: isLargeScreen ? 6 : 4,
  },
  genres: {
    color: '#888',
    fontSize: isLargeScreen ? 12 : 11,
    marginBottom: isLargeScreen ? 8 : 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    color: '#aaa',
    fontSize: 11,
  },
  platforms: {
    color: '#aaa',
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
    marginLeft: 5,
  },
});

export default GameCard;
