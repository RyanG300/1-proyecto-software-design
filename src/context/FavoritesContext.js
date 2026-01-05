import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, setDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const favoritesDoc = await getDoc(doc(db, 'favorites', user.uid));
      if (favoritesDoc.exists()) {
        setFavorites(favoritesDoc.data().games || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (newFavorites) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'favorites', user.uid), {
        games: newFavorites,
        updatedAt: new Date().toISOString(),
      });
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = async (game) => {
    const newFavorites = [...favorites, game];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (gameId) => {
    const newFavorites = favorites.filter(game => game.id !== gameId);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (gameId) => {
    return favorites.some(game => game.id === gameId);
  };

  const toggleFavorite = async (game) => {
    if (isFavorite(game.id)) {
      await removeFavorite(game.id);
    } else {
      await addFavorite(game);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
