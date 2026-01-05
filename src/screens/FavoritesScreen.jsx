import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getImageUrl } from '../services/igdbApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const FavoritesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState(t('recentlyAdded'));
  const { favorites, loading, toggleFavorite } = useFavorites();

  const handleGamePress = (game) => {
    navigation.navigate('GameDetails', { gameId: game.id, game });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t('yourCollection')}</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('favorites')}</Text>
          </View>
          <TouchableOpacity style={[styles.avatar, { borderColor: `${theme.colors.primary}4D` }]}>
            <Ionicons name="person-circle" size={48} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats and Sort */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{favorites.length} {t('savedGames')}</Text>
          <TouchableOpacity style={[styles.sortButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.sortText, { color: theme.colors.text }]}>{sortBy}</Text>
            <Ionicons name="swap-vertical" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Games Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color={`${theme.colors.textSecondary}4D`} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('noFavoritesYet')}</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('startAddingGames')}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {favorites.map((game) => {
              const developer = game.involved_companies?.find(ic => ic.developer)?.company?.name || 'Unknown';
              return (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gridItem}
                  onPress={() => handleGamePress(game)}
                >
                  <View style={[styles.gameCard, { backgroundColor: theme.colors.surface }]}>
                    {game.cover?.image_id && (
                      <Image
                        source={{ uri: getImageUrl(game.cover.image_id, 'cover_big') }}
                        style={styles.gameImage}
                        resizeMode="cover"
                      />
                    )}
                    <TouchableOpacity 
                      style={[styles.favoriteIcon, { borderColor: theme.colors.border }]}
                      onPress={() => toggleFavorite(game)}
                    >
                      <Ionicons name="heart" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.gameTitle, { color: theme.colors.text }]} numberOfLines={2}>{game.name}</Text>
                  <Text style={[styles.gameDeveloper, { color: theme.colors.textSecondary }]} numberOfLines={1}>{developer}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(isWeb && {
      overflow: 'auto',
      height: '100vh',
    }),
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      overflow: 'auto',
    }),
  },
  scrollContent: {
    paddingBottom: 120,
    ...(isWeb && {
      minHeight: '100%',
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  sortText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    ...(isWeb && {
      paddingHorizontal: 24,
      justifyContent: 'flex-start',
    }),
  },
  gridItem: {
    width: isWeb ? (SCREEN_WIDTH >= 1280 ? '22%' : SCREEN_WIDTH >= 1024 ? '30%' : SCREEN_WIDTH >= 768 ? '30%' : '47%') : '47%',
    minWidth: isWeb ? 180 : undefined,
    maxWidth: isWeb ? 250 : undefined,
  },
  gameCard: {
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    ...(isWeb && {
      maxHeight: 280,
    }),
  },
  gameImage: {
    width: '100%',
    height: '100%',
    ...(isWeb && {
      objectFit: 'cover',
    }),
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  gameDeveloper: {
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
