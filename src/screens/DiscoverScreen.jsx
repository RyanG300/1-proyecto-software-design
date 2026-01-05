import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getRandomGames, getImageUrl } from '../services/igdbApi';

const DiscoverScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const newGames = await getRandomGames(20);
      setGames(newGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGames = async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      const newGames = await getRandomGames(10);
      setGames(prevGames => [...prevGames, ...newGames]);
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onSwipedRight = (index) => {
    const game = games[index];
    if (game && !isFavorite(game.id)) {
      toggleFavorite(game);
    }
  };

  const onSwipedLeft = (index) => {
    // Solo skip, no hacer nada
  };

  const onSwipedAll = () => {
    loadMoreGames();
  };

  const onSwiped = (index) => {
    setCurrentIndex(index + 1);
    
    // Cargar más juegos cuando queden 5
    if (games.length - index <= 5 && !loadingMore) {
      loadMoreGames();
    }
  };

  const handleSwipeLeft = () => {
    swiperRef.current?.swipeLeft();
  };

  const handleSwipeRight = () => {
    swiperRef.current?.swipeRight();
  };

  const handleViewDetails = () => {
    const game = games[currentIndex];
    if (game) {
      navigation.navigate('GameDetails', { gameId: game.id, game });
    }
  };

  const renderCard = (game) => {
    if (!game) return null;

    const developer = game.involved_companies?.find(ic => ic.developer)?.company?.name || 'Unknown Developer';
    const genres = game.genres?.map(g => g.name).slice(0, 3).join(' • ') || 'Various';
    const rating = game.rating ? (game.rating / 20).toFixed(1) : 'N/A';

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {game.cover?.image_id && (
          <Image
            source={{ uri: getImageUrl(game.cover.image_id, 'screenshot_huge') }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.5, 1]}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTags}>
              {game.rating && (
                <View style={styles.ratingTag}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
              )}
              <View style={styles.genreTag}>
                <Text style={styles.genreText}>{genres}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {game.name}
            </Text>
            <Text style={styles.cardDeveloper} numberOfLines={1}>
              {developer}
            </Text>

            {game.summary && (
              <Text style={styles.cardSummary} numberOfLines={3}>
                {game.summary}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Info Button */}
        <TouchableOpacity
          style={styles.infoButton}
          onPress={handleViewDetails}
        >
          <Ionicons name="information-circle" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
      <Text style={[styles.noMoreTitle, { color: theme.colors.text }]}>
        All caught up!
      </Text>
      <Text style={[styles.noMoreText, { color: theme.colors.textSecondary }]}>
        Loading more games...
      </Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading games to discover...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Swipe Right to Like
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Discover
          </Text>
        </View>
        <TouchableOpacity onPress={loadGames}>
          <Ionicons name="refresh" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Card Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {currentIndex + 1} / {games.length}
        </Text>
      </View>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        {games.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={games}
            renderCard={renderCard}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwiped={onSwiped}
            onSwipedAll={onSwipedAll}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={15}
            overlayLabels={{
              left: {
                title: 'SKIP',
                style: {
                  label: {
                    backgroundColor: theme.colors.error || '#ef4444',
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
            infinite={false}
            verticalSwipe={false}
            horizontalThreshold={80}
          >
            {renderNoMoreCards()}
          </Swiper>
        ) : (
          renderNoMoreCards()
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleSwipeLeft}
        >
          <Ionicons name="close" size={32} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoActionButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleViewDetails}
        >
          <Ionicons name="information" size={28} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleSwipeRight}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
            style={styles.likeButtonGradient}
          >
            <Ionicons name="heart" size={32} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={[styles.hintText, { color: theme.colors.textTertiary }]}>
          Swipe right to add to favorites • Swipe left to skip
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
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
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  swiperContainer: {
    flex: 1,
    paddingBottom: 150,
  },
  card: {
    height: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 24,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  genreTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  genreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 32,
  },
  cardDeveloper: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  cardSummary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  infoActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  likeButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  noMoreCards: {
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    padding: 40,
  },
  noMoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  noMoreText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DiscoverScreen;
