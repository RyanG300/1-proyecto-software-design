import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const WebNavbar = ({ navigation, currentRoute }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { id: 'Home', name: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { id: 'Search', name: 'Search', icon: 'search', iconOutline: 'search-outline' },
    { id: 'Favorites', name: 'Favorites', icon: 'heart', iconOutline: 'heart-outline' },
    { id: 'Profile', name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  const handleNavigation = (routeName) => {
    navigation.navigate('MainTabs', { screen: routeName });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.brand}>
          <Ionicons name="game-controller" size={32} color={theme.colors.primary} />
          <Text style={[styles.brandText, { color: theme.colors.text }]}>GameCatalog</Text>
        </View>

        {/* Navigation Items */}
        <View style={styles.navItems}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: `${theme.colors.primary}15` }
                ]}
                onPress={() => handleNavigation(item.id)}
              >
                <Ionicons
                  name={isActive ? item.icon : item.iconOutline}
                  size={22}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.navText,
                    { color: isActive ? theme.colors.primary : theme.colors.textSecondary }
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* User Profile */}
        <TouchableOpacity
          style={styles.userProfile}
          onPress={() => handleNavigation('Profile')}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={36} color={theme.colors.primary} />
          )}
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
            {user?.displayName || user?.username || user?.email?.split('@')[0] || 'User'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    maxWidth: 1920,
    marginHorizontal: 'auto',
    width: '100%',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  navText: {
    fontSize: 15,
    fontWeight: '600',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 120,
  },
});

export default WebNavbar;
