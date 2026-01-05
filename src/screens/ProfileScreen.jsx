import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, logout, uploadProfileImage, deleteProfileImage } = useAuth();
  const [uploading, setUploading] = useState(false);

  const libraryOptions = [
    {
      id: 'favorites',
      title: t('favorites'),
      subtitle: t('myFavoriteGames') || 'My favorite games',
      icon: 'heart',
      color: theme.colors.secondary,
      bgColor: `${theme.colors.secondary}20`,
      screen: 'Favorites',
    },
    {
      id: 'history',
      title: t('history'),
      subtitle: t('recentlyViewed') || 'Recently viewed',
      icon: 'time',
      color: theme.colors.accent,
      bgColor: `${theme.colors.accent}20`,
      screen: 'History',
    },
  ];

  const accountOptions = [
    { id: 'signout', title: t('logout'), icon: 'log-out-outline', danger: true },
  ];

  const handleLibraryPress = (option) => {
    if (option.screen) {
      navigation.navigate(option.screen);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permissionDenied') || 'Permission Denied',
          t('needPhotoPermission') || 'We need photo library permissions to change your profile picture.'
        );
        return;
      }

      // Lanzar selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        const uploadResult = await uploadProfileImage(result.assets[0].uri);
        setUploading(false);
        
        if (uploadResult.success) {
          Alert.alert(
            t('success') || 'Success',
            t('profileImageUpdated') || 'Profile image updated successfully'
          );
        } else {
          Alert.alert(
            t('error') || 'Error',
            uploadResult.error || 'Failed to upload image'
          );
        }
      }
    } catch (error) {
      setUploading(false);
      console.error('Error picking image:', error);
      Alert.alert(
        t('error') || 'Error',
        t('failedToPickImage') || 'Failed to pick image'
      );
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      t('confirmDelete') || 'Confirm Delete',
      t('deleteProfileImageConfirm') || 'Are you sure you want to delete your profile image?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            const result = await deleteProfileImage();
            setUploading(false);
            
            if (result.success) {
              Alert.alert(
                t('success') || 'Success',
                t('profileImageDeleted') || 'Profile image deleted successfully'
              );
            } else {
              Alert.alert(
                t('error') || 'Error',
                result.error || 'Failed to delete image'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('profile')}</Text>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={pickImage}
            disabled={uploading}
            onLongPress={user?.photoURL ? handleDeleteImage : null}
          >
            <View style={[styles.avatar, { borderColor: `${theme.colors.primary}33` }]}>
              {uploading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : user?.photoURL ? (
                <Image 
                  source={{ uri: user.photoURL }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle" size={112} color={theme.colors.primary} />
              )}
            </View>
            <View style={[styles.onlineIndicator, { borderColor: theme.colors.background, backgroundColor: theme.colors.success }]} />
            <View style={[styles.cameraOverlay, uploading && { opacity: 0 }]}>
              <Ionicons name="camera" size={20} color={theme.colors.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.displayName || user?.username || 'Player'}
            </Text>
            <Text style={[styles.userHandle, { color: theme.colors.primary }]}>
              {user?.email || '@gamer'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}>
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>{t('edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Library Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>MY LIBRARY</Text>
          <View style={styles.optionsList}>
            {libraryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => handleLibraryPress(option)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                    <Ionicons name={option.icon} size={20} color={option.color} />
                  </View>
                  <View>
                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>{option.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>ACCOUNT</Text>
          <View style={styles.accountList}>
            {accountOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.accountItem}
                onPress={option.id === 'signout' ? handleLogout : undefined}
              >
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={option.danger ? theme.colors.error : theme.colors.textSecondary} 
                />
                <Text style={[styles.accountText, { color: theme.colors.textSecondary }, option.danger && { color: theme.colors.error }]}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingBottom: Platform.OS === 'web' ? 40 : 120,
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 56,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingLeft: 4,
  },
  optionsList: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
  accountList: {
    gap: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 12,
  },
  accountText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
