import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Tu configuración de Firebase
// Obtén estos valores desde Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyCws8HW0yMM4V4QICGtfyFDn_g6wpzetEo",
  authDomain: "gamecatalog-fb44e.firebaseapp.com",
  projectId: "gamecatalog-fb44e",
  storageBucket: "gamecatalog-fb44e.firebasestorage.app",
  messagingSenderId: "999312260934",
  appId: "1:999312260934:web:df07d2d0df2014ee6eef47",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia apropiada según la plataforma
let auth;
try {
  if (Platform.OS === 'web') {
    // En web, usar getAuth (usa localStorage automáticamente)
    auth = getAuth(app);
  } else {
    // En React Native, usar AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // Si ya está inicializado, obtener la instancia existente
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Storage
const storage = getStorage(app);

export { auth, db, storage };
