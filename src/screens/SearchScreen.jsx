import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { searchGames, getImageUrl, getGamesByGenre, getGenres, getRandomGames, getSimilarGames } from '../services/igdbApi';

const SearchScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [suggestedGames, setSuggestedGames] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);

  // NUEVO (similares)
  const [similarGames, setSimilarGames] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [baseGameName, setBaseGameName] = useState('');

  useEffect(() => {
    loadGenres();
    loadSuggestedGames();
    loadSearchHistory();

    // Recargar juegos sugeridos cada 5 minutos
    const interval = setInterval(() => {
      console.log('Refreshing suggested games...');
      loadSuggestedGames();
    }, 5 * 60 * 1000); // 5 minutos en milisegundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else if (searchQuery.length === 0) {
      setSearchResults([]);

      // NUEVO (limpiar similares)
      setSimilarGames([]);
      setBaseGameName('');
      setLoadingSimilar(false);

      if (selectedGenre) {
        loadGamesByGenre();
      }
    } else {
      // NUEVO (si hay 1-2 letras, no buscamos y limpiamos similares)
      setSimilarGames([]);
      setBaseGameName('');
      setLoadingSimilar(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedGenre) {
      loadGamesByGenre();
    }
  }, [selectedGenre]);

  const loadGenres = async () => {
    try {
      const genresData = await getGenres();
      setGenres(genresData.slice(0, 10)); // Top 10 genres
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadSuggestedGames = async () => {
    setLoadingSuggestions(true);
    try {
      const randomGames = await getRandomGames(3);
      console.log('Loaded random games:', randomGames.length);
      setSuggestedGames(randomGames);
    } catch (error) {
      console.error('Error loading suggested games:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadGamesByGenre = async () => {
    if (!selectedGenre) return;

    // NUEVO (limpiar similares cuando se cambia a modo género)
    setSimilarGames([]);
    setBaseGameName('');
    setLoadingSimilar(false);

    setLoading(true);
    try {
      const results = await getGamesByGenre(selectedGenre.id, 100);
      setSearchResults(results);
    } catch (error) {
      console.error('Error loading games by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchToHistory = async (query) => {
    try {
      // Evitar duplicados y mantener solo los últimos 10
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) return;

    // NUEVO (preparar similares)
    setSimilarGames([]);
    setBaseGameName('');
    setLoadingSimilar(false);

    setLoading(true);
    try {
      const results = await searchGames(searchQuery, 50);
      setSearchResults(results);
      // Guardar en historial
      await saveSearchToHistory(searchQuery.trim());

      // NUEVO (cargar similares del primer resultado)
      const top = results?.[0];
      if (top?.id) {
        setLoadingSimilar(true);
        setBaseGameName(top.name);

        const sim = await getSimilarGames(top.id, 10);
        setSimilarGames(sim);
      }
    } catch (error) {
      console.error('Error searching games:', error);
    } finally {
      setLoading(false);
      setLoadingSimilar(false);
    }
  };

  const handleGamePress = (game) => {
    navigation.navigate('GameDetails', { gameId: game.id, game });
  };

  const removeHistoryItem = async (index) => {
    try {
      const newHistory = [...searchHistory];
      newHistory.splice(index, 1);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('search')}</Text>
            <TouchableOpacity style={[styles.avatar, { borderColor: theme.colors.border }]}>
              <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                  style={[styles.searchInput, { color: theme.colors.text }]}
                  placeholder={t('searchGames')}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
              />
              <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons name="options" size={20} color={showFilters ? theme.colors.primary : theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          {showFilters && (
              <View style={styles.filtersContainer}>
                <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>{t('filterByGenre')}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.genresList}
                >
                  <TouchableOpacity
                      style={[
                        styles.genreChip,
                        { backgroundColor: !selectedGenre ? theme.colors.primary : theme.colors.surface, borderColor: !selectedGenre ? theme.colors.primary : theme.colors.border },
                      ]}
                      onPress={() => {
                        setSelectedGenre(null);
                        setSearchResults([]);

                        // NUEVO (limpiar similares)
                        setSimilarGames([]);
                        setBaseGameName('');
                        setLoadingSimilar(false);
                      }}
                  >
                    <Text style={[
                      styles.genreChipText,
                      { color: !selectedGenre ? '#ffffff' : theme.colors.textSecondary, fontWeight: !selectedGenre ? 'bold' : '500' },
                    ]}>{t('all')}</Text>
                  </TouchableOpacity>
                  {genres.map((genre) => (
                      <TouchableOpacity
                          key={genre.id}
                          style={[
                            styles.genreChip,
                            { backgroundColor: selectedGenre?.id === genre.id ? theme.colors.primary : theme.colors.surface, borderColor: selectedGenre?.id === genre.id ? theme.colors.primary : theme.colors.border },
                          ]}
                          onPress={() => setSelectedGenre(genre)}
                      >
                        <Text style={[
                          styles.genreChipText,
                          { color: selectedGenre?.id === genre.id ? '#ffffff' : theme.colors.textSecondary, fontWeight: selectedGenre?.id === genre.id ? 'bold' : '500' },
                        ]}>{genre.name}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
          )}

          {/* Show results if searching */}
          {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
          ) : searchResults.length > 0 ? (
              <View style={styles.resultsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {selectedGenre ? `${selectedGenre.name}` : t('results')}
                </Text>
                {searchResults.map((game) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[styles.resultItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        onPress={() => handleGamePress(game)}
                    >
                      <View style={[styles.resultImageContainer, { backgroundColor: theme.colors.surfaceLight }]}>
                        {game.cover?.image_id && (
                            <Image
                                source={{ uri: getImageUrl(game.cover.image_id, 'cover_small') }}
                                style={styles.resultImage}
                                resizeMode="cover"
                            />
                        )}
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: theme.colors.text }]} numberOfLines={2}>{game.name}</Text>
                        {game.rating && (
                            <View style={styles.ratingContainer}>
                              <Ionicons name="star" size={12} color="#fbbf24" />
                              <Text style={[styles.ratingText, { color: theme.colors.text }]}>{(game.rating / 20).toFixed(1)}</Text>
                            </View>
                        )}
                      </View>
                    </TouchableOpacity>
                ))}

                {/* NUEVO: Similares */}
                {loadingSimilar ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                ) : similarGames.length > 0 ? (
                    <View style={{ marginTop: 16 }}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Similares a: {baseGameName}
                      </Text>

                      {similarGames.map((game) => (
                          <TouchableOpacity
                              key={game.id}
                              style={[styles.resultItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                              onPress={() => handleGamePress(game)}
                          >
                            <View style={[styles.resultImageContainer, { backgroundColor: theme.colors.surfaceLight }]}>
                              {game.cover?.image_id && (
                                  <Image
                                      source={{ uri: getImageUrl(game.cover.image_id, 'cover_small') }}
                                      style={styles.resultImage}
                                      resizeMode="cover"
                                  />
                              )}
                            </View>
                            <View style={styles.resultInfo}>
                              <Text style={[styles.resultName, { color: theme.colors.text }]} numberOfLines={2}>{game.name}</Text>
                              {game.rating && (
                                  <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={12} color="#fbbf24" />
                                    <Text style={[styles.ratingText, { color: theme.colors.text }]}>{(game.rating / 20).toFixed(1)}</Text>
                                  </View>
                              )}
                            </View>
                          </TouchableOpacity>
                      ))}
                    </View>
                ) : null}
              </View>
          ) : searchQuery.length > 0 ? null : (
              <>
                {/* Recent History */}
                {searchHistory.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('recentHistory')}</Text>
                        <TouchableOpacity onPress={clearHistory}>
                          <Text style={[styles.clearAllText, { color: theme.colors.primary }]}>{t('clearAll')}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.historyList}>
                        {searchHistory.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.historyItem}
                                onPress={() => setSearchQuery(item)}
                            >
                              <View style={[styles.historyIconContainer, { backgroundColor: theme.colors.surface }]}>
                                <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
                              </View>
                              <Text style={[styles.historyText, { color: theme.colors.text }]}>{item}</Text>
                              <TouchableOpacity
                                  style={styles.removeButton}
                                  onPress={() => removeHistoryItem(index)}
                              >
                                <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                )}

                {/* Suggested Games */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('suggestedForYou')}</Text>
                    <TouchableOpacity onPress={loadSuggestedGames}>
                      <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {loadingSuggestions ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t('loadingSuggestions')}</Text>
                      </View>
                  ) : (
                      <View style={styles.suggestedList}>
                        {suggestedGames.map((game) => {
                          const developer = game.involved_companies?.find(ic => ic.developer)?.company?.name;
                          const mainGenre = game.genres?.[0]?.name;
                          const gameTheme = game.themes?.[0]?.name;

                          return (
                              <TouchableOpacity
                                  key={game.id}
                                  style={[styles.suggestedItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                  onPress={() => handleGamePress(game)}
                              >
                                <View style={[styles.suggestedImage, { backgroundColor: theme.colors.surfaceLight }]}>
                                  {game.cover?.image_id && (
                                      <Image
                                          source={{ uri: getImageUrl(game.cover.image_id, 'cover_small') }}
                                          style={styles.gameImage}
                                          resizeMode="cover"
                                      />
                                  )}
                                </View>
                                <View style={styles.suggestedInfo}>
                                  <View style={styles.suggestedHeader}>
                                    <Text style={[styles.suggestedName, { color: theme.colors.text }]} numberOfLines={1}>{game.name}</Text>
                                    {game.rating && (
                                        <View style={styles.suggestedRating}>
                                          <Ionicons name="star" size={12} color="#fbbf24" />
                                          <Text style={styles.suggestedRatingText}>{(game.rating / 20).toFixed(1)}</Text>
                                        </View>
                                    )}
                                  </View>
                                  <Text style={[styles.suggestedReason, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                    {developer || t('popularGame')}
                                  </Text>
                                  <View style={styles.tagsContainer}>
                                    {mainGenre && (
                                        <View style={[styles.tag, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}>
                                          <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{mainGenre}</Text>
                                        </View>
                                    )}
                                    {game.themes?.[0]?.name && (
                                        <View style={[styles.tag, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}>
                                          <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{game.themes[0].name}</Text>
                                        </View>
                                    )}
                                  </View>
                                </View>
                              </TouchableOpacity>
                          );
                        })}
                      </View>
                  )}
                </View>
              </>
          )}
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyList: {
    gap: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  historyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedList: {
    gap: 16,
  },
  suggestedItem: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    gap: 16,
  },
  suggestedImage: {
    width: 80,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  suggestedInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  suggestedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  suggestedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  suggestedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  suggestedRatingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  suggestedReason: {
    fontSize: 12,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  resultsSection: {
    paddingHorizontal: 24,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  resultImageContainer: {
    width: 60,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  genresList: {
    gap: 12,
    paddingRight: 24,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 14,
  },
});

export default SearchScreen;
