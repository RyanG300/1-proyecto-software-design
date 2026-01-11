import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithCustomToken,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// PARCHE TEMPORAL: Deshabilitado para Expo Go
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db, storage } from '../config/firebaseConfig';

const AuthContext = createContext();

// PARCHE TEMPORAL: Configuración de Google Sign-In deshabilitada para Expo Go
// GoogleSignin.configure({
//   webClientId: '999312260934-35u26e6eq73rh5e4snmc7q6g5rh5ndmg.apps.googleusercontent.com',
// });

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        
        // Obtener datos adicionales de Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userData.username = data.username;
            userData.hasCompletedPreferences = data.hasCompletedPreferences || false;
            userData.favoriteGenres = data.favoriteGenres || [];
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        
        // Cargar imagen de perfil local
        try {
          const localImage = await AsyncStorage.getItem(`profile_image_${firebaseUser.uid}`);
          if (localImage) {
            userData.photoURL = localImage;
          }
        } catch (error) {
          console.error('Error loading local profile image:', error);
        }
        
        setUser(userData);
      } else {
        // Usuario no autenticado
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (username, email, password) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Actualizar perfil con el username
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
        hasCompletedPreferences: false,
        favoriteGenres: [],
      });

      // Cerrar sesión inmediatamente después de registrar
      // Para que el usuario tenga que iniciar sesión manualmente
      await signOut(auth);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Error registering user:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Error logging in:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid credentials';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Account has been disabled';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    // En web, usar signInWithPopup
    if (Platform.OS === 'web') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        
        // Guardar/actualizar datos en Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            username: firebaseUser.displayName,
            email: firebaseUser.email,
            createdAt: new Date().toISOString(),
          });
        }
        
        return { success: true, user: firebaseUser };
      } catch (error) {
        console.error('Error signing in with Google:', error);
        let errorMessage = 'Google sign-in failed';
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign in was cancelled';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Popup was blocked by browser';
        }
        
        return { success: false, error: errorMessage };
      }
    }
    
    // PARCHE TEMPORAL: Google Sign-In no disponible en Expo Go para móvil
    console.warn('Google Sign-In no está disponible en Expo Go');
    return { 
      success: false, 
      error: 'Google Sign-In requiere un build nativo (usa expo-dev-client o EAS Build)' 
    };
    
    /* CÓDIGO ORIGINAL - Descomentar al usar build nativo:
    try {
      // Verificar si hay servicios de Google disponibles
      await GoogleSignin.hasPlayServices();
      
      // Obtener el token de Google
      const { idToken } = await GoogleSignin.signIn();
      
      // Crear credencial de Firebase
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Iniciar sesión en Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;
      
      // Guardar/actualizar datos en Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          username: firebaseUser.displayName,
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
        });
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Sign in is already in progress';
      }
      
      return { success: false, error: errorMessage };
    }
    */
  };

  const signInWithDiscord = async () => {
    // Solo disponible en web
    if (Platform.OS === 'web') {
      try {
        return new Promise((resolve) => {
          // Abrir ventana de OAuth
          const width = 500;
          const height = 700;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          
          const popup = window.open(
            'http://localhost:3001/api/auth/discord',
            'Discord Login',
            `width=${width},height=${height},left=${left},top=${top}`
          );

          // Escuchar mensaje de la ventana popup
          const handleMessage = async (event) => {
            if (event.data.type === 'discord-auth') {
              window.removeEventListener('message', handleMessage);
              
              const { customToken, userData } = event.data;
              
              try {
                // Autenticar en Firebase con el custom token
                const userCredential = await signInWithCustomToken(auth, customToken);
                const firebaseUser = userCredential.user;
                
                // Actualizar el perfil con la información de Discord
                const photoURL = userData.avatar 
                  ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                  : null;
                
                await updateProfile(firebaseUser, {
                  displayName: userData.username,
                  photoURL: photoURL,
                });
                
                resolve({ success: true, user: firebaseUser });
              } catch (error) {
                console.error('Error autenticando con custom token:', error);
                resolve({ success: false, error: 'Failed to authenticate with Discord' });
              }
            } else if (event.data.type === 'discord-auth-error') {
              window.removeEventListener('message', handleMessage);
              resolve({ success: false, error: event.data.error || 'Discord authentication failed' });
            }
          };

          window.addEventListener('message', handleMessage);
          
          // Timeout si el usuario no completa la autenticación
          setTimeout(() => {
            if (popup && !popup.closed) {
              popup.close();
            }
            window.removeEventListener('message', handleMessage);
            resolve({ success: false, error: 'Authentication timeout' });
          }, 60000); // 1 minuto
        });
      } catch (error) {
        console.error('Error signing in with Discord:', error);
        return { success: false, error: 'Discord sign-in failed' };
      }
    }
    
    // Discord no disponible en móvil por ahora
    console.warn('Discord Sign-In solo está disponible en web');
    return { 
      success: false, 
      error: 'Discord Sign-In solo está disponible en la versión web' 
    };
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // PARCHE TEMPORAL: Google Sign-In deshabilitado para Expo Go
      /* CÓDIGO ORIGINAL - Descomentar al usar build nativo:
      // Si hay sesión de Google, cerrarla también
      try {
        if (await GoogleSignin.isSignedIn()) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.log('Error cerrando sesión de Google:', error);
      }
      */
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Actualizar Firebase Auth (solo displayName, no photoURL)
      if (updates.displayName) {
        await updateProfile(auth.currentUser, { displayName: updates.displayName });
      }
      
      // Actualizar Firestore (sin photoURL)
      const firestoreUpdates = { ...updates };
      delete firestoreUpdates.photoURL; // No guardar photoURL en Firestore
      
      if (Object.keys(firestoreUpdates).length > 0) {
        await setDoc(doc(db, 'users', user.uid), firestoreUpdates, { merge: true });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Update failed' };
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Guardar localmente en AsyncStorage
      await AsyncStorage.setItem(`profile_image_${user.uid}`, uri);
      
      // Actualizar el estado local del usuario
      await updateUserProfile({ photoURL: uri });
      
      return { success: true, photoURL: uri };
    } catch (error) {
      console.error('Error saving profile image:', error);
      return { success: false, error: 'Save failed' };
    }
  };

  const deleteProfileImage = async () => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Eliminar de AsyncStorage
      await AsyncStorage.removeItem(`profile_image_${user.uid}`);
      
      // Actualizar perfil para remover la URL
      await updateUserProfile({ photoURL: null });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting profile image:', error);
      return { success: false, error: 'Delete failed' };
    }
  };

  const updateUserPreferences = async (preferences) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Actualizar preferencias en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...preferences,
        hasCompletedPreferences: true,
      }, { merge: true });
      
      // Actualizar estado local
      setUser({
        ...user,
        ...preferences,
        hasCompletedPreferences: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    signInWithGoogle,
    signInWithDiscord,
    logout,
    updateProfile: updateUserProfile,
    uploadProfileImage,
    deleteProfileImage,
    updateUserPreferences,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
