import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// INSTRUCCIONES:
// 1. Ve a Firebase Console: https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Ve a Project Settings (⚙️) > General
// 4. En "Your apps", añade una app web
// 5. Copia la configuración y pégala abajo
// 6. Habilita Authentication > Sign-in method > Email/Password y Google
// 7. Renombra este archivo a firebaseConfig.js

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };
