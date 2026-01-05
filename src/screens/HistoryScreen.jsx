import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useHistory } from '../context/HistoryContext';
import { getImageUrl } from '../services/igdbApi';

const HistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { history, loading, clearHistory } = useHistory();

  const handleGamePress = (game) => {
    navigation.navigate('GameDetails', { gameId: game.id, game });
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return t('justNow') || 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderGame = ({ item }) => {
    const coverUrl = item.cover?.image_id 
      ? getImageUrl(item.cover.image_id, 'cover_big')
      : null;

    return (
      <TouchableOpacity
        style={[styles.gameItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => handleGamePress(item)}
      >
        {coverUrl && (
          <Image 
            source={{ uri: coverUrl }} 
            style={styles.gameCover}
            resizeMode="cover"
          />
        )}
        <View style={styles.gameInfo}>
          <Text style={[styles.gameName, { color: theme.colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.gameMetadata}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.viewedDate, { color: theme.colors.textSecondary }]}>
              {formatDate(item.viewedAt)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('history') || 'History'}
        </Text>
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>
              {t('clear') || 'Clear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {t('noHistory') || 'No history yet'}
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('noHistoryDescription') || 'Games you view will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderGame}
          keyExtractor={(item) => `${item.id}-${item.viewedAt}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  gameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  gameMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewedDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HistoryScreen;
