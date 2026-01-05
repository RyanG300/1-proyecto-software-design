# Configuración de Firebase

Esta guía te ayudará a configurar Firebase Authentication y Firestore para el proyecto Game Catalog.

## 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa un nombre para tu proyecto (ej: "game-catalog")
4. Acepta los términos y haz clic en "Continuar"
5. (Opcional) Habilita Google Analytics
6. Haz clic en "Crear proyecto"

## 2. Configurar Firebase Authentication

1. En el panel de Firebase, ve a **Authentication** en el menú lateral
2. Haz clic en "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Habilita los siguientes métodos:
   - **Email/Password**: Habilita esta opción
   - **Google**: Habilita esta opción y configura el correo de soporte del proyecto

## 3. Configurar Firestore Database

1. En el panel de Firebase, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona el modo de inicio:
   - Para desarrollo: **Modo de prueba** (permite lectura/escritura por 30 días)
   - Para producción: **Modo de producción** (configura reglas personalizadas después)
4. Selecciona la ubicación de la base de datos (elige la más cercana a tus usuarios)
5. Haz clic en "Habilitar"

## 4. Obtener las credenciales de Firebase

### Para la aplicación Web/React Native:

1. En el panel de Firebase, ve a **⚙️ Configuración del proyecto** (ícono de engranaje)
2. En la pestaña **General**, desplázate hacia abajo hasta "Tus apps"
3. Haz clic en el ícono **</>** (Web)
4. Registra tu app con un nombre (ej: "game-catalog-app")
5. **NO** marques "También configurar Firebase Hosting"
6. Haz clic en "Registrar app"
7. Copia la configuración de Firebase que se muestra:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

8. Pega estos valores en `src/config/firebaseConfig.js` (reemplazando los valores de ejemplo)

### Para Google Sign-In:

1. En la misma página de configuración del proyecto
2. Desplázate hasta "Web Client ID" en la sección de Google Sign-In
3. Copia el **Web Client ID** (termina en `.apps.googleusercontent.com`)
4. Pega este valor en `src/context/AuthContext.js` en la configuración de GoogleSignin:

```javascript
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

## 5. Configurar las reglas de Firestore

Para proteger tus datos, configura las reglas de seguridad de Firestore:

1. Ve a **Firestore Database** > **Reglas**
2. Reemplaza el contenido con las siguientes reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para favoritos
    match /favorites/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para historial
    match /history/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Haz clic en "Publicar"

## 6. Verificar la instalación

Después de configurar todo:

1. Asegúrate de que `src/config/firebaseConfig.js` tenga tus credenciales
2. Asegúrate de que `src/context/AuthContext.js` tenga tu Web Client ID
3. Ejecuta la aplicación:
   ```bash
   npm start
   ```

## 7. Probar la autenticación

1. Abre la app en tu emulador o dispositivo
2. Intenta registrarte con un correo y contraseña
3. Verifica en Firebase Console > Authentication que el usuario se creó
4. Prueba el inicio de sesión con Google
5. Verifica que los favoritos e historial se guarden en Firestore

## Solución de problemas

### Error: "Firebase app not initialized"
- Verifica que las credenciales en `firebaseConfig.js` sean correctas
- Asegúrate de que no haya errores de sintaxis en el archivo

### Google Sign-In no funciona
- Verifica que el Web Client ID sea correcto
- Asegúrate de que Google esté habilitado en Authentication > Sign-in method
- En iOS: Configura el URL Scheme en la configuración de Expo/React Native
- En Android: Agrega el SHA-1 de tu app en Firebase Console

### Los datos no se guardan en Firestore
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado antes de guardar datos
- Revisa la consola del navegador/app para ver errores específicos

## Recursos adicionales

- [Documentación de Firebase Authentication](https://firebase.google.com/docs/auth)
- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Google Sign-In para React Native](https://github.com/react-native-google-signin/google-signin)
