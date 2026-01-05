import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const GAME_GENRES = [
  { id: 4, name: 'Action', icon: 'rocket' },
  { id: 5, name: 'Shooter', icon: 'game-controller' },
  { id: 8, name: 'Platform', icon: 'apps' },
  { id: 10, name: 'Racing', icon: 'car-sport' },
  { id: 12, name: 'RPG', icon: 'book' },
  { id: 13, name: 'Simulator', icon: 'airplane' },
  { id: 14, name: 'Sports', icon: 'football' },
  { id: 15, name: 'Strategy', icon: 'chess-knight' },
  { id: 16, name: 'Turn-based', icon: 'reload' },
  { id: 24, name: 'Tactical', icon: 'shield' },
  { id: 25, name: 'Hack & Slash', icon: 'flash' },
  { id: 26, name: 'Quiz', icon: 'help-circle' },
  { id: 30, name: 'Pinball', icon: 'ellipse' },
  { id: 31, name: 'Adventure', icon: 'map' },
  { id: 32, name: 'Indie', icon: 'star' },
  { id: 33, name: 'Arcade', icon: 'trophy' },
  { id: 34, name: 'Visual Novel', icon: 'document-text' },
  { id: 35, name: 'Card & Board', icon: 'grid' },
  { id: 36, name: 'MOBA', icon: 'people' },
];

export default function PreferencesScreen({ navigation }) {
  const { theme } = useTheme();
  const { updateUserPreferences } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGenre = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      // Limitar a máximo 5 géneros
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genreId]);
      }
    }
  };

  const handleContinue = async () => {
    if (selectedGenres.length === 0) {
      // Permitir continuar sin preferencias (se usarán juegos populares)
      navigation.replace('MainTabs');
      return;
    }

    setIsLoading(true);
    const result = await updateUserPreferences({ favoriteGenres: selectedGenres });
    setIsLoading(false);

    if (result.success) {
      // Navegar a la pantalla principal
      navigation.replace('MainTabs');
    } else {
      console.error('Error saving preferences:', result.error);
      // Aún así permitir continuar
      navigation.replace('MainTabs');
    }
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Ambient Background Glows */}
      <View style={styles.glowContainer}>
        <View style={[styles.glow, styles.glowTop, { backgroundColor: `${theme.colors.primary}26` }]} />
        <View style={[styles.glow, styles.glowBottom, { backgroundColor: `${theme.colors.primary}26` }]} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="game-controller" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>What do you like?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Select your favorite game genres so we can recommend games you'll love.
          </Text>
          <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
            Choose up to 5 genres
          </Text>
        </View>

        {/* Genre Selection */}
        <View style={styles.genresContainer}>
          {GAME_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.genreChip,
                  { 
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                  isSelected && styles.genreChipSelected,
                ]}
                onPress={() => toggleGenre(genre.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={genre.icon} 
                  size={20} 
                  color={isSelected ? '#ffffff' : theme.colors.textSecondary}
                  style={styles.genreIcon}
                />
                <Text
                  style={[
                    styles.genreText,
                    { color: isSelected ? '#ffffff' : theme.colors.text },
                  ]}
                >
                  {genre.name}
                </Text>
                {isSelected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="#ffffff" 
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selection Counter */}
        <View style={styles.counterContainer}>
          <Text style={[styles.counterText, { color: theme.colors.textSecondary }]}>
            {selectedGenres.length} of 5 selected
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            { 
              shadowColor: theme.colors.primary,
              opacity: isLoading ? 0.6 : 1,
            }
          ]} 
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
            style={styles.continueButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>
                  {selectedGenres.length > 0 ? 'Continue' : 'Skip for now'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  glowTop: {
    top: '-10%',
    left: '-10%',
    width: '80%',
    height: 400,
  },
  glowBottom: {
    bottom: '-10%',
    right: '-10%',
    width: '60%',
    height: 300,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: '45%',
  },
  genreChipSelected: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  genreIcon: {
    marginRight: 4,
  },
  genreText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
