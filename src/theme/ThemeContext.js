import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, THEMES } from './themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Tema predeterminado: 'dark' (Oscuro Clásico)
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && THEMES[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  // Asegurar que siempre tengamos un tema válido usando useMemo
  const theme = useMemo(() => {
    const themeColors = getThemeColors(currentTheme);
    
    if (!themeColors) {
      console.error('Theme colors not found for:', currentTheme);
      // Fallback al tema dark si hay algún problema
      return {
        id: 'dark',
        colors: THEMES.dark.colors,
        name: 'Oscuro Clásico',
      };
    }

    return {
      id: currentTheme,
      colors: themeColors,
      name: THEMES[currentTheme]?.name || 'Oscuro Clásico',
    };
  }, [currentTheme]);

  const changeTheme = async (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(themeId);
      try {
        await AsyncStorage.setItem('theme', themeId);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  // No renderizar hasta que el tema esté cargado
  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
