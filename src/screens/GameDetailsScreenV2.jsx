import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { getGameById, getImageUrl, getYouTubeUrl, getTimeToBeat } from '../services/igdbApi';
import { useFavorites } from '../context/FavoritesContext';
import { useHistory } from '../context/HistoryContext';
import { NintendoSwitchIcon, NintendoSwitch2Icon } from '../components/PlatformIcons';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const GameDetailsScreenV2 = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { gameId, game: initialGame } = route.params;
  const [game, setGame] = useState(initialGame);
  const [loading, setLoading] = useState(!initialGame);
  const [timeToBeat, setTimeToBeat] = useState(null);
  const [readMore, setReadMore] = useState(false);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();

  useEffect(() => {
    const loadGameDetails = async () => {
      try {
        const gameData = await getGameById(gameId);
        setGame(gameData);
        
        // Add to history when game data is loaded
        if (gameData) {
          addToHistory(gameData);
        }

        // Try to load time to beat
        try {
          const ttb = await getTimeToBeat(gameId);
          setTimeToBeat(ttb);
        } catch (e) {
          console.log('Time to beat not available');
        }
      } catch (error) {
        console.error('Error loading game details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialGame) {
      loadGameDetails();
    } else {
      // Add to history immediately if we already have the game data
      addToHistory(initialGame);
    }
  }, [gameId, initialGame, addToHistory]);

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    return (rating / 20).toFixed(1);
  };

  const getAgeRatingLabel = (rating, category) => {
    if (category === 1) {
      const esrb = {
        6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO',
      };
      return esrb[rating] || '18+';
    } else if (category === 2) {
      const pegi = {
        1: '3+', 2: '7+', 3: '12+', 4: '16+', 5: '18+',
      };
      return pegi[rating] || '18+';
    }
    return '18+';
  };

  const getDeveloperPublisher = useMemo(() => {
    if (!game?.involved_companies || game.involved_companies.length === 0) {
      return { developers: [] };
    }
    
    const developers = game.involved_companies
      .filter(ic => ic.developer)
      .map(ic => ic.company?.name)
      .filter(name => name); // Remove undefined/null
    
    return { developers };
  }, [game?.involved_companies]);

  const getPlatformIcon = (platformName) => {
    const name = platformName.toLowerCase();
    if (name.includes('pc') || name.includes('windows')) return { type: 'ionicon', name: 'desktop' };
    if (name.includes('playstation') || name.includes('ps')) return { type: 'ionicon', name: 'logo-playstation' };
    if (name.includes('xbox')) return { type: 'ionicon', name: 'logo-xbox' };
    if (name.includes('nintendo switch 2') || name.includes('switch 2')) return { type: 'custom', name: 'switch2' };
    if (name.includes('switch')) return { type: 'custom', name: 'switch' };
    if (name.includes('mac')) return { type: 'ionicon', name: 'logo-apple' };
    return { type: 'ionicon', name: 'game-controller' };
  };

  const renderPlatformIcon = (iconInfo, size = 28) => {
    const iconColor = theme.dark ? 'rgba(181, 156, 186, 0.7)' : '#666';
    if (iconInfo.type === 'custom') {
      if (iconInfo.name === 'switch') {
        return <NintendoSwitchIcon size={size} color={iconColor} />;
      } else if (iconInfo.name === 'switch2') {
        return <NintendoSwitch2Icon size={size} color={iconColor} />;
      }
    }
    return <Ionicons name={iconInfo.name} size={size} color={iconColor} />;
  };

  const openVideo = (videoId) => {
    Linking.openURL(getYouTubeUrl(videoId));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Game not found</Text>
      </View>
    );
  }

  const coverUrl = game.cover?.image_id 
    ? getImageUrl(game.cover.image_id, 'screenshot_huge')
    : null;

  const { developers } = getDeveloperPublisher;
  const primaryGenre = game.genres?.[0]?.name || 'Game';
  const secondaryTheme = game.themes?.[0]?.name || game.genres?.[1]?.name;
  const ageRating = game.age_ratings?.[0] 
    ? getAgeRatingLabel(game.age_ratings[0].rating, game.age_ratings[0].category)
    : '18+';

  // Debug media data
  if (game) {
    console.log('=== MEDIA DEBUG ===');
    console.log('Game:', game.name);
    console.log('Videos:', game.videos?.length || 0);
    console.log('Screenshots:', game.screenshots?.length || 0);
    console.log('Artworks:', game.artworks?.length || 0);
    console.log('==================');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          {coverUrl && (
            <Image 
              source={{ uri: coverUrl }} 
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={theme.dark 
              ? ['rgba(0,0,0,0.4)', 'transparent', 'rgba(31, 16, 34, 0.9)']
              : ['rgba(0,0,0,0.2)', 'transparent', 'rgba(249, 250, 251, 0.95)']
            }
            locations={[0, 0.3, 1]}
            style={styles.heroGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.topBarActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="share-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => toggleFavorite(game)}
                >
                  <Ionicons 
                    name={isFavorite(game.id) ? "heart" : "heart-outline"} 
                    size={22} 
                    color={isFavorite(game.id) ? "#cc0df2" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {game.videos && game.videos.length > 0 && (
              <View style={styles.playButtonContainer}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => openVideo(game.videos[0].video_id)}
                >
                  <View style={styles.playButtonOuter}>
                    <View style={styles.playButtonInner}>
                      <Ionicons name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={[styles.contentSection, { backgroundColor: theme.colors.background }]}>
          <View style={styles.pullHandle} />

          <View style={styles.titleSection}>
            <View style={styles.tagsRow}>
              <View style={[styles.tagPrimary, { 
                backgroundColor: theme.dark ? 'rgba(204, 13, 242, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                borderColor: theme.dark ? 'rgba(204, 13, 242, 0.2)' : 'rgba(139, 92, 246, 0.3)'
              }]}>
                <Text style={[styles.tagPrimaryText, { color: theme.colors.primary }]}>{primaryGenre.toUpperCase()}</Text>
              </View>
              {secondaryTheme && (
                <View style={[styles.tagSecondary, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.tagSecondaryText, { color: theme.colors.textSecondary }]}>{secondaryTheme.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.gameTitle, { color: theme.colors.text }]}>{game.name}</Text>
            <Text style={[styles.gameDeveloper, { color: theme.colors.textSecondary }]}>{developers[0] || t('unknownDeveloper')}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <Ionicons name="star" size={24} color="#fbbf24" />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatRating(game.rating || game.total_rating)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('rating')}</Text>
            </View>
            <View style={[styles.statCard, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {timeToBeat?.normally ? `${Math.round(timeToBeat.normally / 3600)}h+` : '60h+'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('duration')}</Text>
            </View>
            <View style={[styles.statCard, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <Ionicons name="people-outline" size={24} color="#4ade80" />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{ageRating}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('ageRating')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('aboutGame')}</Text>
            <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]} numberOfLines={readMore ? undefined : 4}>
              {game.summary || game.storyline || t('noDescription')}
            </Text>
            {(game.summary || game.storyline) && (
              <TouchableOpacity onPress={() => setReadMore(!readMore)}>
                <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>
                  {readMore ? t('showLess') : t('readMore')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {game.platforms && game.platforms.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('availableOn')}</Text>
              <View style={styles.platformsContainer}>
                {game.platforms.slice(0, 6).map((platform, index) => {
                  const iconInfo = getPlatformIcon(platform.name);
                  return (
                    <View key={index} style={styles.platformItem}>
                      <View style={[styles.platformIcon, { 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                      }]}>
                        {renderPlatformIcon(iconInfo, 28)}
                      </View>
                      <Text style={[styles.platformName, { color: theme.colors.textSecondary }]}>
                        {platform.abbreviation || platform.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {((game.videos && game.videos.length > 0) || (game.screenshots && game.screenshots.length > 0) || (game.artworks && game.artworks.length > 0)) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('media')}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaScroll}
              >
                {/* Videos first */}
                {game.videos && game.videos.map((video, index) => (
                  <TouchableOpacity 
                    key={`video-${index}`} 
                    style={styles.mediaItem}
                    onPress={() => openVideo(video.video_id)}
                  >
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg` }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    <View style={styles.videoPlayOverlay}>
                      <View style={styles.videoPlayButton}>
                        <Ionicons name="play" size={24} color="#fff" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Screenshots */}
                {game.screenshots && game.screenshots.map((screenshot, index) => (
                  <TouchableOpacity key={`screenshot-${index}`} style={styles.mediaItem}>
                    <Image
                      source={{ uri: getImageUrl(screenshot.image_id, 'screenshot_med') }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
                
                {/* Artworks */}
                {game.artworks && game.artworks.map((artwork, index) => (
                  <TouchableOpacity key={`artwork-${index}`} style={styles.mediaItem}>
                    <Image
                      source={{ uri: getImageUrl(artwork.image_id, 'screenshot_med') }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('ratingsAndReviews')}</Text>
            <View style={[styles.ratingsCard, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <View style={styles.ratingsMain}>
                <View style={styles.ratingScore}>
                  <Text style={[styles.ratingScoreText, { color: theme.colors.text }]}>
                    {formatRating(game.rating || game.total_rating)}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= Math.round((game.rating || game.total_rating) / 20) ? "star" : "star-half"} 
                        size={14} 
                        color="#fbbf24" 
                      />
                    ))}
                  </View>
                  <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
                    {game.total_rating_count ? `${(game.total_rating_count / 1000).toFixed(0)}k` : '12k'} {t('reviews')}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.ratingBars}>
                  {[
                    { star: 5, percentage: 80 },
                    { star: 4, percentage: 15 },
                    { star: 3, percentage: 5 },
                  ].map((item) => (
                    <View key={item.star} style={styles.ratingBarRow}>
                      <Text style={[styles.ratingBarLabel, { color: theme.colors.textSecondary }]}>{item.star}</Text>
                      <View style={[styles.ratingBarTrack, { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                        <View style={[styles.ratingBarFill, { width: `${item.percentage}%`, backgroundColor: theme.colors.primary }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Store Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('buyNow')}</Text>
            <View style={styles.storeLinksContainer}>
                {/* PC Stores with Links */}
                {game.websites?.filter(w => [13, 16, 17, 1].includes(w.category)).map((website, index) => {
                  const getStoreInfo = (category) => {
                    switch(category) {
                      case 13: return { 
                        name: 'Steam', 
                        icon: 'logo-steam', 
                        bgColor: '#1b2838',
                        iconBg: '#66c0f4',
                        description: t('pc'),
                        hasLink: true
                      };
                      case 16: return { 
                        name: 'Epic Games', 
                        icon: 'game-controller', 
                        bgColor: '#2a2a2a',
                        iconBg: '#0078f2',
                        description: t('pc'),
                        hasLink: true
                      };
                      case 17: return { 
                        name: 'GOG', 
                        icon: 'logo-game-controller-b', 
                        bgColor: '#5a1d5f',
                        iconBg: '#86328a',
                        description: `${t('pc')} - ${t('drmFree')}`,
                        hasLink: true
                      };
                      case 1: return {
                        name: 'Official Site',
                        icon: 'globe-outline',
                        bgColor: '#2d1b32',
                        iconBg: '#cc0df2',
                        description: t('officialWebsite'),
                        hasLink: true
                      };
                      default: return { 
                        name: 'Store', 
                        icon: 'storefront', 
                        bgColor: '#2d1b32',
                        iconBg: '#cc0df2',
                        description: 'Digital Store',
                        hasLink: true
                      };
                    }
                  };
                  const storeInfo = getStoreInfo(website.category);
                  return (
                    <TouchableOpacity
                      key={`web-${index}`}
                      style={[styles.storeLinkButton, { backgroundColor: storeInfo.bgColor }]}
                      onPress={() => Linking.openURL(website.url)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.storeIconContainer, { backgroundColor: storeInfo.iconBg }]}>
                        <Ionicons name={storeInfo.icon} size={28} color="#fff" />
                      </View>
                      <View style={styles.storeTextContainer}>
                        <Text style={styles.storeLinkText}>{storeInfo.name}</Text>
                        <Text style={styles.storeDescription}>{storeInfo.description}</Text>
                      </View>
                      <View style={styles.storeArrow}>
                        <Ionicons name="arrow-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Console Stores - No Direct Links */}
                {game.platforms?.length > 0 && (() => {
                  const consoleStores = [];
                  const platformNames = game.platforms.map(p => p.name?.toLowerCase() || '');
                  
                  // PlayStation Store
                  const hasPS = platformNames.some(name => 
                    name.includes('playstation') || 
                    name.includes('ps5') || 
                    name.includes('ps4') || 
                    name.includes('ps3') ||
                    name === 'ps'
                  );
                  if (hasPS) {
                    consoleStores.push({
                      name: 'PlayStation Store',
                      icon: 'logo-playstation',
                      bgColor: '#003791',
                      iconBg: '#0070cc',
                      description: t('linkNotAvailable'),
                      hasLink: false
                    });
                  }
                  
                  // Xbox Store
                  const hasXbox = platformNames.some(name => 
                    name.includes('xbox')
                  );
                  if (hasXbox) {
                    consoleStores.push({
                      name: 'Xbox Store',
                      icon: 'logo-xbox',
                      bgColor: '#107c10',
                      iconBg: '#0e7a0d',
                      description: t('linkNotAvailable'),
                      hasLink: false
                    });
                  }
                  
                  // Nintendo eShop
                  const hasNintendo = platformNames.some(name => 
                    name.includes('switch') || 
                    name.includes('nintendo')
                  );
                  if (hasNintendo) {
                    consoleStores.push({
                      name: 'Nintendo eShop',
                      icon: 'game-controller',
                      bgColor: '#e60012',
                      iconBg: '#ff0000',
                      description: t('linkNotAvailable'),
                      hasLink: false
                    });
                  }

                  return consoleStores.map((store, index) => (
                    <View
                      key={`console-${index}`}
                      style={[styles.storeLinkButton, styles.storeLinkDisabled, { backgroundColor: store.bgColor }]}
                    >
                      <View style={[styles.storeIconContainer, { backgroundColor: store.iconBg, opacity: 0.6 }]}>
                        <Ionicons name={store.icon} size={28} color="#fff" />
                      </View>
                      <View style={styles.storeTextContainer}>
                        <Text style={styles.storeLinkText}>{store.name}</Text>
                        <Text style={styles.storeDescriptionDisabled}>{store.description}</Text>
                      </View>
                      <View style={[styles.storeArrow, { opacity: 0.3 }]}>
                        <Ionicons name="lock-closed" size={18} color="rgba(255, 255, 255, 0.7)" />
                      </View>
                    </View>
                  ));
                })()}
            </View>
          </View>
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1022',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1022',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1022',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  heroSection: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    padding: 20,
  },
  playButtonOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#cc0df2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#cc0df2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#1f1022',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -48,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  pullHandle: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleSection: {
    marginBottom: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagPrimary: {
    backgroundColor: 'rgba(204, 13, 242, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(204, 13, 242, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPrimaryText: {
    color: '#cc0df2',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  tagSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagSecondaryText: {
    color: 'rgba(181, 156, 186, 0.9)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  gameTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 36,
  },
  gameDeveloper: {
    fontSize: 16,
    color: 'rgba(181, 156, 186, 0.7)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2d1b32',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(181, 156, 186, 0.7)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cc0df2',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(181, 156, 186, 0.9)',
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#cc0df2',
    marginTop: 4,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  platformItem: {
    alignItems: 'center',
    gap: 8,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2d1b32',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(181, 156, 186, 0.7)',
  },
  mediaScroll: {
    gap: 16,
    paddingRight: 24,
  },
  mediaItem: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(204, 13, 242, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#cc0df2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  ratingsCard: {
    backgroundColor: '#2d1b32',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  ratingsMain: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingScore: {
    alignItems: 'center',
  },
  ratingScoreText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: 'rgba(181, 156, 186, 0.7)',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  ratingBars: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: 'rgba(181, 156, 186, 0.7)',
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#cc0df2',
    borderRadius: 3,
  },
  reviewItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reviewDate: {
    fontSize: 10,
    color: 'rgba(181, 156, 186, 0.5)',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 12,
    color: 'rgba(181, 156, 186, 0.7)',
    lineHeight: 18,
  },
  storeLinksContainer: {
    gap: 12,
  },
  storeLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  storeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  storeTextContainer: {
    flex: 1,
  },
  storeLinkText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  storeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  storeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeLinkDisabled: {
    opacity: 0.6,
  },
  storeDescriptionDisabled: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default GameDetailsScreenV2;
