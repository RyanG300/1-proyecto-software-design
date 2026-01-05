import 'react-native-gesture-handler';
import React from 'react';
import './src/i18n/i18n';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { HistoryProvider } from './src/context/HistoryContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GameDetailsScreen from './src/screens/GameDetailsScreenV2';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WebNavbar from './src/components/WebNavbar';

// Import BlurView only for iOS
let BlurView = null;
if (Platform.OS === 'ios') {
  BlurView = require('expo-blur').BlurView;
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator con diseño Stitch glassmorphism
function MainTabs({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';

  // Obtener la ruta actual
  const currentRoute = useNavigationState(state => {
    if (!state) return 'Home';
    const route = state.routes[state.index];
    if (route.state) {
      const tabState = route.state;
      return tabState.routes[tabState.index].name;
    }
    return 'Home';
  });
  
  return (
    <>
      {isWeb && <WebNavbar navigation={navigation} currentRoute={currentRoute} />}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: isWeb ? {
            display: 'none', // Ocultar tab bar en web
          } : {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64 + insets.bottom,
            backgroundColor: Platform.OS === 'ios' ? `${theme.colors.surface}B3` : `${theme.colors.surface}E6`,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 0,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            paddingLeft: 0,
            paddingRight: 0,
            elevation: 0,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarShowLabel: false,
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 0,
          },
          tabBarBackground: () => (
            !isWeb && (
              Platform.OS === 'ios' && BlurView ? (
                <BlurView
                  intensity={80}
                  tint="dark"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: `${theme.colors.surface}99`,
                  }}
                />
              ) : null
            )
          ),
        }}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "heart" : "heart-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
    </>
  );
}


function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Podrías mostrar un splash screen aquí
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...(Platform.OS === 'web' && {
          cardStyle: {
            overflow: 'auto',
            height: '100vh',
          },
        }),
      }}
    >
      {!user ? (
        // Pantallas de autenticación
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !user.hasCompletedPreferences ? (
        // Pantalla de preferencias (primera vez)
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
      ) : (
        // Pantallas principales (requieren autenticación)
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="GameDetails" 
            component={GameDetailsScreen}
            options={{
              presentation: 'card',
              ...(Platform.OS === 'web' && {
                cardStyle: {
                  overflow: 'auto',
                  height: '100vh',
                },
              }),
            }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <HistoryProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </HistoryProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
