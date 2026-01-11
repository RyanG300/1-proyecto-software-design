const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api/igdb';
  }
  
  if (Platform.OS === 'android' && __DEV__) {
    return 'http://192.168.1.100:3001/api/igdb'; // Reemplaza con TU IP
  }
  
  return 'https://api.igdb.com/v4';
};import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getAllThemes } from '../theme/themes';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, changeTheme, currentTheme } = useTheme();
  const themes = getAllThemes();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleThemeSelect = (themeId) => {
    changeTheme(themeId);
  };

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('language', lng);
    setShowLanguageModal(false);
  };

  const getCurrentLanguageName = () => {
    return i18n.language === 'es' ? t('spanish') : t('english');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('settings')}
        </Text>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🎨 {t('theme')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          {t('appearance')}
        </Text>

        <View style={styles.themesGrid}>
          {themes.map((themeOption) => {
            const isSelected = themeOption.id === currentTheme;
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: isSelected ? 3 : 1,
                  }
                ]}
                onPress={() => handleThemeSelect(themeOption.id)}
                activeOpacity={0.7}
              >
                {/* Theme Preview */}
                <View style={styles.themePreview}>
                  <View style={[
                    styles.previewBox,
                    { backgroundColor: themeOption.colors.background }
                  ]}>
                    <View style={[
                      styles.previewBar,
                      { backgroundColor: themeOption.colors.surface }
                    ]}>
                      <View style={[
                        styles.previewCircle,
                        { backgroundColor: themeOption.colors.primary }
                      ]} />
                      <View style={[
                        styles.previewCircle,
                        { backgroundColor: themeOption.colors.secondary }
                      ]} />
                      <View style={[
                        styles.previewCircle,
                        { backgroundColor: themeOption.colors.accent }
                      ]} />
                    </View>
                  </View>
                </View>

                {/* Theme Info */}
                <View style={styles.themeInfo}>
                  <Text style={styles.themeEmoji}>{themeOption.emoji}</Text>
                  <Text style={[styles.themeName, { color: theme.colors.text }]}>
                    {themeOption.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🌐 {t('language')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowLanguageModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.settingIcon}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              {t('language')}
            </Text>
            <Text style={[styles.settingSubtext, { color: theme.colors.textSecondary }]}>
              {getCurrentLanguageName()}
            </Text>
          </View>
          <Text style={[styles.settingArrow, { color: theme.colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('language')}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.flagEmoji}>🇺🇸</Text>
              <Text style={[styles.languageText, { color: theme.colors.text }]}>
                {t('english')}
              </Text>
              {i18n.language === 'en' && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'es' && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.flagEmoji}>🇪🇸</Text>
              <Text style={[styles.languageText, { color: theme.colors.text }]}>
                {t('spanish')}
              </Text>
              {i18n.language === 'es' && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Game Catalog v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  themePreview: {
    marginBottom: 12,
  },
  previewBox: {
    height: 80,
    borderRadius: 8,
    padding: 8,
    overflow: 'hidden',
  },
  previewBar: {
    height: 24,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  previewCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeInfo: {
    alignItems: 'center',
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  selectedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
  },
});

export default SettingsScreen;
