import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import RandomGameModal from '../components/RandomGameModal';
import { getPopularGames, getRecentlyReleased, getComingSoon, getImageUrl, getGamesByGenre, getRandomGamesByGenre } from '../services/igdbApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [popularGames, setPopularGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [randomGame, setRandomGame] = useState(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [shakeDetected, setShakeDetected] = useState(false);
  
  // IGDB Genre IDs
  const categories = [
    { id: 'trending', name: t('trending'), icon: 'flame', genreId: null },
    { id: 'action', name: t('action'), genreId: 4 },
    { id: 'rpg', name: t('rpg'), genreId: 12 },
    { id: 'strategy', name: t('strategy'), genreId: 15 },
    { id: 'indie', name: t('indie'), genreId: 32 },
    { id: 'adventure', name: t('adventure'), genreId: 31 },
    { id: 'shooter', name: t('shooter'), genreId: 5 },
    { id: 'platformer', name: t('platformer'), genreId: 8 },
  ];

  const loadGames = async () => {
    try {
      console.log('Loading popular games...');
      const popular = await getPopularGames(50);
      console.log('Popular games loaded:', popular.length);
      // Mezclar aleatoriamente para variedad
      const shuffledPopular = popular.sort(() => 0.5 - Math.random());
      setPopularGames(shuffledPopular);

      console.log('Loading recent games...');
      const recent = await getRecentlyReleased(50);
      console.log('Recent games loaded:', recent.length);
      setRecentGames(recent);

      console.log('Loading upcoming games...');
      const upcoming = await getComingSoon(50);
      console.log('Upcoming games loaded:', upcoming.length);
      setUpcomingGames(upcoming);

      // Cargar recomendaciones si el usuario tiene preferencias
      if (user?.favoriteGenres && user.favoriteGenres.length > 0) {
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error loading games:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // TODO: Mostrar mensaje de error al usuario
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user?.favoriteGenres || user.favoriteGenres.length === 0) return;

    setLoadingRecommendations(true);
    try {
      console.log('Loading recommendations for genres:', user.favoriteGenres);
      
      // Obtener juegos de cada género favorito
      const gamesPerGenre = Math.ceil(20 / user.favoriteGenres.length);
      const genrePromises = user.favoriteGenres.map(genreId => 
        getRandomGamesByGenre(genreId, gamesPerGenre)
      );
      
      const genreResults = await Promise.all(genrePromises);
      const allGames = genreResults.flat();
      
      // Mezclar aleatoriamente y eliminar duplicados
      const uniqueGames = Array.from(
        new Map(allGames.map(game => [game.id, game])).values()
      );
      const shuffled = uniqueGames.sort(() => 0.5 - Math.random());
      
      console.log('Loaded recommendations:', shuffled.length);
      setRecommendedGames(shuffled.slice(0, 20));
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendedGames([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  // Recargar recomendaciones cuando cambien las preferencias del usuario
  useEffect(() => {
    if (user?.favoriteGenres && user.favoriteGenres.length > 0) {
      loadRecommendations();
    }
  }, [user?.favoriteGenres]);

  // Tilt Back Gesture to Random Game (solo en móvil)
  useEffect(() => {
    if (Platform.OS === 'web') return; // No disponible en web

    let subscription;
    let previousZ = 0;
    const TILT_THRESHOLD = 0.8; // Umbral para detectar inclinación hacia atrás
    let lastTiltTime = 0;
    const TILT_COOLDOWN = 2000; // 2 segundos entre activaciones
    let tiltDetected = false;

    const setupAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const now = Date.now();
          
          // Detectar cuando el teléfono se inclina hacia atrás (eje Z positivo)
          // z > 0.8 significa que el teléfono está inclinado hacia atrás
          // Luego vuelve a posición normal (z < 0.3)
          
          if (z > TILT_THRESHOLD && !tiltDetected) {
            // Teléfono inclinado hacia atrás
            tiltDetected = true;
          } else if (z < 0.3 && tiltDetected && (now - lastTiltTime) > TILT_COOLDOWN) {
            // Teléfono vuelve a posición normal - activar
            lastTiltTime = now;
            tiltDetected = false;
            handleShake();
          } else if (z < 0.3) {
            // Reset si vuelve a normal sin haber detectado inclinación
            tiltDetected = false;
          }
          
          previousZ = z;
        });
      } catch (error) {
        console.error('Error setting up accelerometer:', error);
      }
    };

    setupAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [popularGames, recentGames]);

  const handleShake = () => {
    if (shakeDetected) return; // Evitar múltiples triggers

    setShakeDetected(true);
    Vibration.vibrate(100); // Vibración de feedback

    // Obtener un juego aleatorio de todos los disponibles
    const allGames = [...popularGames, ...recentGames];
    if (allGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * allGames.length);
      setRandomGame(allGames[randomIndex]);
      setShowRandomModal(true);
    }

    // Reset del flag después de un segundo
    setTimeout(() => setShakeDetected(false), 1000);
  };

  const handleCloseRandomModal = () => {
    setShowRandomModal(false);
    setRandomGame(null);
  };

  const handleViewRandomGameDetails = () => {
    if (randomGame) {
      setShowRandomModal(false);
      navigation.navigate('GameDetails', { gameId: randomGame.id, game: randomGame });
    }
  };

  useEffect(() => {
    loadCategoryGames();
    
    // Refresh automático de juegos por categoría cada 3 minutos
    if (selectedCategory !== 'trending') {
      const interval = setInterval(() => {
        console.log(`Auto-refreshing ${selectedCategory} games...`);
        loadCategoryGames();
      }, 3 * 60 * 1000); // 3 minutos
      
      return () => clearInterval(interval);
    }
  }, [selectedCategory]);

  const loadCategoryGames = async () => {
    if (selectedCategory === 'trending') {
      setFilteredGames(popularGames);
      return;
    }

    setLoadingCategory(true);
    try {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category?.genreId) {
        console.log(`Loading random games for genre: ${category.name} (ID: ${category.genreId})`);
        // Usar getRandomGamesByGenre en lugar de getGamesByGenre para variedad
        const games = await getRandomGamesByGenre(category.genreId, 50);
        console.log(`Loaded ${games.length} random ${category.name} games`);
        setFilteredGames(games);
      }
    } catch (error) {
      console.error('Error loading category games:', error);
      setFilteredGames([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleGamePress = (game) => {
    navigation.navigate('GameDetails', { gameId: game.id, game });
  };

  const renderGameList = (title, games) => {
    if (!games || games.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          horizontal
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GameCard game={item} onPress={handleGamePress} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme?.colors?.background || '#1f1022' }]}>
        <ActivityIndicator size="large" color={theme?.colors?.primary || '#6C63FF'} />
        <Text style={[styles.loadingText, { color: theme?.colors?.text || '#ffffff' }]}>{t('loadingGames')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme?.colors?.background || '#1f1022' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme?.colors?.primary || '#6C63FF'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme?.colors?.textSecondary || 'rgba(181, 156, 186, 0.7)' }]}>{t('welcomeBack')}</Text>
            <Text style={[styles.headerTitle, { color: theme?.colors?.text || '#ffffff' }]}>{t('gameCatalog')}</Text>
            {Platform.OS !== 'web' && (
              <View style={styles.shakeHint}>
                <Ionicons name="phone-portrait" size={12} color={theme?.colors?.primary || '#6C63FF'} />
                <Text style={[styles.shakeHintText, { color: theme?.colors?.textTertiary || '#888888' }]}>
                  Tilt back for random game
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={48} color={theme?.colors?.primary || '#6C63FF'} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selectedCategory === category.id ? (theme?.colors?.primary || '#6C63FF') : (theme?.colors?.surface || '#1a1a2e') },
                  { borderColor: selectedCategory === category.id ? (theme?.colors?.primary || '#6C63FF') : (theme?.colors?.border || '#333333') },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                {category.icon && selectedCategory === category.id && (
                  <Ionicons 
                    name={category.icon} 
                    size={16} 
                    color="#ffffff" 
                    style={styles.categoryIcon}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#ffffff' : (theme?.colors?.textSecondary || '#888888') },
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended for You Section */}
        {user?.favoriteGenres && user.favoriteGenres.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="sparkles" size={24} color={theme?.colors?.primary || '#6C63FF'} style={styles.sectionIcon} />
                <Text style={[styles.sectionTitle, { color: theme?.colors?.text || '#ffffff' }]}>Recommended for You</Text>
              </View>
              <TouchableOpacity 
                onPress={loadRecommendations}
                style={[styles.refreshButton, { backgroundColor: theme?.colors?.surface || '#1a1a2e' }]}
              >
                <Ionicons name="refresh" size={20} color={theme?.colors?.primary || '#6C63FF'} />
              </TouchableOpacity>
            </View>
            {loadingRecommendations ? (
              <View style={styles.categoryLoadingContainer}>
                <ActivityIndicator size="small" color={theme?.colors?.primary || '#6C63FF'} />
              </View>
            ) : recommendedGames.length > 0 ? (
              <FlatList
                horizontal
                data={recommendedGames.slice(0, 10)}
                keyExtractor={(item) => `rec-${item.id}`}
                renderItem={({ item }) => (
                  <GameCard game={item} onPress={handleGamePress} />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={[styles.emptyText, { color: theme?.colors?.textSecondary || '#888888' }]}>
                No recommendations available at the moment
              </Text>
            )}
          </View>
        )}

        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme?.colors?.text || '#ffffff' }]}>{t('featured')}</Text>
            <TouchableOpacity onPress={() => {
              // Mezclar aleatoriamente los juegos populares
              const shuffled = [...popularGames].sort(() => 0.5 - Math.random());
              setPopularGames(shuffled);
            }}>
              <Text style={[styles.seeAllText, { color: theme?.colors?.primary || '#6C63FF' }]}>Shuffle</Text>
            </TouchableOpacity>
          </View>
          {popularGames.length > 0 && (
            <FlatList
              horizontal
              data={popularGames.slice(0, 3)}
              keyExtractor={(item) => `featured-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.featuredCard}
                  onPress={() => handleGamePress(item)}
                >
                  {item.cover?.image_id && (
                    <Image 
                      source={{ uri: getImageUrl(item.cover.image_id, 'cover_big') }} 
                      style={styles.featuredImage}
                      resizeMode="cover"
                    />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(31, 16, 34, 0.5)', 'rgba(31, 16, 34, 0.85)']}
                    locations={[0, 0.5, 1]}
                    style={styles.featuredOverlay}
                  >
                    <View style={styles.featuredTags}>
                      <View style={styles.tagNew}>
                        <Text style={styles.tagText}>NEW</Text>
                      </View>
                      <View style={styles.tagGenre}>
                        <Text style={styles.tagText}>RPG</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text style={styles.ratingText}>
                        {(item.rating / 20).toFixed(1) || '4.5'}
                      </Text>
                      <Text style={styles.reviewsText}>(12k reviews)</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </View>

        {/* Top Rated Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme?.colors?.text || '#ffffff' }]}>
              {selectedCategory === 'trending' ? t('topRated') : `${categories.find(c => c.id === selectedCategory)?.name} ${t('home')}`}
            </Text>
            {selectedCategory !== 'trending' && (
              <TouchableOpacity 
                onPress={loadCategoryGames}
                style={[styles.refreshButton, { backgroundColor: theme?.colors?.surface || '#1a1a2e' }]}
              >
                <Ionicons name="refresh" size={20} color={theme?.colors?.primary || '#6C63FF'} />
              </TouchableOpacity>
            )}
          </View>
          {loadingCategory ? (
            <View style={styles.categoryLoadingContainer}>
              <ActivityIndicator size="small" color={theme?.colors?.primary || '#6C63FF'} />
              <Text style={[styles.loadingText, { color: theme?.colors?.text || '#ffffff' }]}>{t('loading')}</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {(selectedCategory === 'trending' ? recentGames : filteredGames).slice(0, 8).map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gridItem}
                  onPress={() => handleGamePress(game)}
                >
                  <View style={styles.gridImageContainer}>
                    {game.cover?.image_id && (
                      <Image
                        source={{ uri: getImageUrl(game.cover.image_id, 'cover_big') }}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.ratingBadge}>
                      <Ionicons name="flash" size={10} color={theme?.colors?.primary || '#6C63FF'} />
                      <Text style={[styles.badgeText, { color: theme?.colors?.text || '#ffffff' }]}>
                        {Math.floor((game.rating || 90) / 10) * 10}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.gridTitle, { color: theme?.colors?.text || '#ffffff' }]} numberOfLines={2}>
                    {game.name}
                  </Text>
                  <Text style={[styles.gridSubtitle, { color: theme?.colors?.textSecondary || '#888888' }]} numberOfLines={1}>
                    {game.involved_companies?.[0]?.company?.name || 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme?.colors?.textTertiary || '#666666' }]}>{t('poweredBy')}</Text>
        </View>
      </ScrollView>

      {/* Random Game Modal (solo móvil) */}
      {Platform.OS !== 'web' && (
        <RandomGameModal
          visible={showRandomModal}
          game={randomGame}
          onClose={handleCloseRandomModal}
          onViewDetails={handleViewRandomGameDetails}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1022',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1022',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  categoryLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(181, 156, 186, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  shakeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  shakeHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#cc0df2',
    borderColor: '#cc0df2',
    shadowColor: '#cc0df2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    color: 'rgba(181, 156, 186, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#cc0df2',
    letterSpacing: 1.5,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 13, 242, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredList: {
    gap: 16,
  },
  featuredCard: {
    width: 280,
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#2d1b32',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagNew: {
    backgroundColor: 'rgba(204, 13, 242, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagGenre: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewsText: {
    color: 'rgba(181, 156, 186, 0.7)',
    fontSize: 12,
    marginLeft: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
    ...(isWeb && {
      justifyContent: 'flex-start',
    }),
  },
  gridItem: {
    width: isWeb ? (SCREEN_WIDTH >= 1280 ? '22%' : SCREEN_WIDTH >= 1024 ? '30%' : SCREEN_WIDTH >= 768 ? '30%' : '47%') : '47%',
    minWidth: isWeb ? 180 : undefined,
    maxWidth: isWeb ? 250 : undefined,
  },
  gridImageContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2d1b32',
    marginBottom: 12,
    ...(isWeb && {
      maxHeight: 280,
    }),
  },
  gridImage: {
    width: '100%',
    height: '100%',
    ...(isWeb && {
      objectFit: 'cover',
    }),
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  gridSubtitle: {
    fontSize: 12,
    color: 'rgba(181, 156, 186, 0.7)',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});

export default HomeScreen;
