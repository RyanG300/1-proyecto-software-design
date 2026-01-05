import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useHistory } from '../context/HistoryContext';
import { getGameById, getImageUrl, getYouTubeUrl } from '../services/igdbApi';
import { NintendoSwitchIcon, NintendoSwitch2Icon } from '../components/PlatformIcons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const GameDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { addToHistory } = useHistory();
  const { gameId, game: initialGame } = route.params;
  const [game, setGame] = useState(initialGame);
  const [loading, setLoading] = useState(!initialGame);

  useEffect(() => {
    const loadGameDetails = async () => {
      try {
        const gameData = await getGameById(gameId);
        setGame(gameData);
        // Add to history when game data is loaded
        if (gameData) {
          addToHistory(gameData);
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'TBA';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    return Math.round(rating);
  };

  const getRatingColor = (rating) => {
    if (!rating) return '#666';
    if (rating >= 80) return '#4CAF50';
    if (rating >= 60) return '#FFC107';
    return '#F44336';
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  const getWebsiteLabel = (category) => {
    const labels = {
      1: 'Official',
      2: 'Wikia',
      3: 'Wikipedia',
      4: 'Facebook',
      5: 'Twitter',
      6: 'Twitch',
      8: 'Instagram',
      9: 'YouTube',
      13: 'Steam',
      14: 'Reddit',
      15: 'Itch.io',
      16: 'Epic Games',
      17: 'GOG',
      18: 'Discord',
    };
    return labels[category] || 'Website';
  };

  const getAgeRatingLabel = (rating, category) => {
    if (category === 1) { // ESRB
      const esrb = {
        6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO',
      };
      return esrb[rating] || 'N/A';
    } else if (category === 2) { // PEGI
      const pegi = {
        1: 'PEGI 3', 2: 'PEGI 7', 3: 'PEGI 12', 4: 'PEGI 16', 5: 'PEGI 18',
      };
      return pegi[rating] || 'N/A';
    }
    return 'N/A';
  };

  const getDeveloperPublisher = () => {
    if (!game.involved_companies) return { developers: [], publishers: [] };
    
    const developers = game.involved_companies
      .filter(ic => ic.developer)
      .map(ic => ic.company.name);
    
    const publishers = game.involved_companies
      .filter(ic => ic.publisher)
      .map(ic => ic.company.name);
    
    return { developers, publishers };
  };

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

  const renderPlatformIcon = (iconInfo, size = 20) => {
    const iconColor = theme.dark ? theme.colors.primary : '#8b5cf6';
    if (iconInfo.type === 'custom') {
      if (iconInfo.name === 'switch') {
        return <NintendoSwitchIcon size={size} color={iconColor} />;
      } else if (iconInfo.name === 'switch2') {
        return <NintendoSwitch2Icon size={size} color={iconColor} />;
      }
    }
    return <Ionicons name={iconInfo.name} size={size} color={iconColor} />;
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
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{t('gameNotFound')}</Text>
      </View>
    );
  }

  const coverUrl = game.cover?.image_id 
    ? getImageUrl(game.cover.image_id, 'cover_big_2x')
    : null;

  const { developers, publishers } = getDeveloperPublisher();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with cover */}
      <View style={styles.header}>
        {coverUrl && (
          <Image 
            source={{ uri: coverUrl }} 
            style={styles.cover}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.headerOverlay}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{game.name}</Text>
            
            {game.rating && (
              <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(game.rating) }]}>
                <Text style={styles.ratingText}>{formatRating(game.rating)} / 100</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Release Date */}
        {game.first_release_date && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('releaseDate')}:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{formatDate(game.first_release_date)}</Text>
          </View>
        )}

        {/* Developers */}
        {developers.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('developer')}:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{developers.join(', ')}</Text>
          </View>
        )}

        {/* Publishers */}
        {publishers.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('publisher')}:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{publishers.join(', ')}</Text>
          </View>
        )}

        {/* Genres */}
        {game.genres && game.genres.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('genres')}</Text>
            <View style={styles.tagContainer}>
              {game.genres.map((genre, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tagText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Themes */}
        {game.themes && game.themes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('themes')}</Text>
            <View style={styles.tagContainer}>
              {game.themes.map((themeItem, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tagText}>{themeItem.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Platforms */}
        {game.platforms && game.platforms.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('platforms')}</Text>
            <View style={styles.tagContainer}>
              {game.platforms.map((platform, index) => {
                const iconInfo = getPlatformIcon(platform.name);
                return (
                  <View key={index} style={[styles.platformTag, { backgroundColor: theme.colors.secondary }]}>
                    <View style={styles.platformIconContainer}>
                      {renderPlatformIcon(iconInfo, 16)}
                    </View>
                    <Text style={styles.tagText}>{platform.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Game Modes */}
        {game.game_modes && game.game_modes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('gameModes')}</Text>
            <View style={styles.tagContainer}>
              {game.game_modes.map((mode, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tagText}>{mode.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Player Perspectives */}
        {game.player_perspectives && game.player_perspectives.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('playerPerspectives')}</Text>
            <View style={styles.tagContainer}>
              {game.player_perspectives.map((perspective, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tagText}>{perspective.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Age Ratings */}
        {game.age_ratings && game.age_ratings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('ageRatings')}</Text>
            <View style={styles.tagContainer}>
              {game.age_ratings.map((rating, index) => (
                <View key={index} style={[styles.ageRatingTag, { backgroundColor: theme.colors.warning }]}>
                  <Text style={styles.tagText}>
                    {getAgeRatingLabel(rating.rating, rating.category)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        {game.summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('summary')}</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{game.summary}</Text>
          </View>
        )}

        {/* Storyline */}
        {game.storyline && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('storyline')}</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{game.storyline}</Text>
          </View>
        )}

        {/* Screenshots */}
        {game.screenshots && game.screenshots.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('screenshots')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {game.screenshots.map((screenshot, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(screenshot.image_id, 'screenshot_med') }}
                  style={styles.screenshot}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Videos */}
        {game.videos && game.videos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('videos')}</Text>
            {game.videos.map((video, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.videoButton, { backgroundColor: theme.colors.error }]}
                onPress={() => openLink(getYouTubeUrl(video.video_id))}
              >
                <Text style={styles.videoButtonText}>
                  ▶ {video.name || 'Watch Video'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Websites */}
        {game.websites && game.websites.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('links')}</Text>
            {game.websites.map((website, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.linkButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                onPress={() => openLink(website.url)}
              >
                <Text style={[styles.linkButtonText, { color: theme.colors.primary }]}>
                  🔗 {getWebsiteLabel(website.category)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Similar Games */}
        {game.similar_games && game.similar_games.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('similarGames')}</Text>
            <View style={styles.tagContainer}>
              {game.similar_games.slice(0, 10).map((similar, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tagText}>{similar.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
  },
  header: {
    height: 400,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  platformTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  platformIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageRatingTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
  },
  screenshot: {
    width: 300,
    height: 180,
    borderRadius: 8,
    marginRight: 10,
  },
  videoButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  linkButtonText: {
    fontSize: 16,
  },
});

export default GameDetailsScreen;
