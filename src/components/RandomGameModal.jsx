import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { getImageUrl } from '../services/igdbApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RandomGameModal = ({ visible, game, onClose, onViewDetails }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && game) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, game]);

  if (!game) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const developer = game.involved_companies?.find(ic => ic.developer)?.company?.name || 'Unknown Developer';
  const genres = game.genres?.map(g => g.name).join(', ') || 'Various';
  const rating = game.rating ? (game.rating / 20).toFixed(1) : 'N/A';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]} />
        )}

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ rotate }] },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
              style={styles.iconGradient}
            >
              <Ionicons name="dice" size={40} color="#ffffff" />
            </LinearGradient>
          </Animated.View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Random Game!
          </Text>

          {/* Game Card */}
          <View style={[styles.gameCard, { backgroundColor: theme.colors.surface }]}>
            {game.cover?.image_id && (
              <Image
                source={{ uri: getImageUrl(game.cover.image_id, 'cover_big') }}
                style={styles.gameImage}
                resizeMode="cover"
              />
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
              style={styles.gameInfo}
            >
              <Text style={styles.gameName} numberOfLines={2}>
                {game.name}
              </Text>
              <Text style={styles.gameDeveloper} numberOfLines={1}>
                {developer}
              </Text>
              <Text style={styles.gameGenres} numberOfLines={1}>
                {genres}
              </Text>
              
              {game.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Shake Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onViewDetails}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  gameCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  gameInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  gameName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 26,
  },
  gameDeveloper: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  gameGenres: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default RandomGameModal;
