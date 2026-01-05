import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      const historyDoc = await getDoc(doc(db, 'history', user.uid));
      if (historyDoc.exists()) {
        setHistory(historyDoc.data().games || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (newHistory) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'history', user.uid), {
        games: newHistory,
        updatedAt: new Date().toISOString(),
      });
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const addToHistory = useCallback(async (game) => {
    // Remove duplicate if exists and add to beginning
    const filteredHistory = history.filter(item => item.id !== game.id);
    const newHistory = [{ ...game, viewedAt: new Date().toISOString() }, ...filteredHistory].slice(0, 50); // Keep last 50 games
    await saveHistory(newHistory);
  }, [history]);

  const clearHistory = useCallback(async () => {
    await saveHistory([]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        loading,
        addToHistory,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
