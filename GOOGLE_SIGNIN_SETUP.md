# Configuración de Google Sign-In con Expo Development Build

Google Sign-In requiere módulos nativos, por lo que **NO funciona en Expo Go**. Debes usar un **Development Build**.

## ✅ Ya configurado en este proyecto:

- ✅ `expo-dev-client` instalado
- ✅ `@react-native-google-signin/google-signin` instalado
- ✅ Plugin configurado en `app.json`
- ✅ Web Client ID configurado en el código

## 📋 Pasos para hacerlo funcionar:

### 1. Descargar archivos de configuración de Firebase

#### Para iOS:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **gamecatalog-fb44e**
3. Ve a **⚙️ Configuración del proyecto**
4. En la sección **Tus apps**, busca la app iOS (si no existe, créala)
5. Descarga el archivo **GoogleService-Info.plist**
6. Colócalo en la raíz del proyecto: `./GoogleService-Info.plist`

#### Para Android:
1. En la misma página de configuración del proyecto
2. Busca la app Android (si no existe, créala con el package: `com.gamecatalog.app`)
3. Descarga el archivo **google-services.json**
4. Colócalo en la raíz del proyecto: `./google-services.json`

### 2. Configurar SHA-1 para Android (solo Android)

Para que Google Sign-In funcione en Android, necesitas registrar el SHA-1 de tu app:

#### Opción A: Para desarrollo local

```bash
# Generar SHA-1 de debug
cd android
./gradlew signingReport
```

Busca el SHA-1 de la variante **debug** y cópialo.

#### Opción B: Usar EAS Build (más fácil)

Si usas EAS Build, obtén el SHA-1 automáticamente:

```bash
eas credentials
```

Luego agrega el SHA-1 en Firebase:
1. Firebase Console > Configuración del proyecto
2. Scroll a **Tus apps** > App Android
3. Agrega el SHA-1 en la sección **Huellas digitales de certificado**

### 3. Construir el Development Build

Tienes 3 opciones:

#### Opción A: Build en la nube con EAS (Recomendado - Más fácil)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login en Expo
eas login

# Configurar EAS
eas build:configure

# Hacer build para desarrollo
eas build --profile development --platform ios
# o
eas build --profile development --platform android
```

Una vez termine, descarga e instala el `.ipa` (iOS) o `.apk` (Android) en tu dispositivo.

#### Opción B: Build local para iOS (requiere Mac con Xcode)

```bash
npx expo run:ios
```

Esto creará un build de desarrollo y lo instalará en el simulador de iOS.

#### Opción C: Build local para Android

```bash
npx expo run:android
```

Esto creará un build de desarrollo y lo instalará en el emulador/dispositivo Android conectado.

### 4. Ejecutar la app

Una vez instalado el development build:

```bash
# Iniciar el servidor de desarrollo
npx expo start --dev-client

# Abrir la app en tu dispositivo
# La app se conectará automáticamente al servidor
```

## 🔍 Verificar que todo funciona

1. Abre la app (en el development build, NO en Expo Go)
2. Ve a la pantalla de Login
3. Presiona el botón de Google (primer botón debajo de "OR CONNECT WITH")
4. Deberías ver el flujo de autenticación de Google
5. Después de autenticarte, deberías entrar a la app

## ⚠️ Solución de problemas

### Error: "Developer Error" en Google Sign-In (Android)
- Verifica que el SHA-1 esté registrado en Firebase Console
- Asegúrate de usar el SHA-1 correcto (debug vs release)
- Espera unos minutos después de agregar el SHA-1

### Error: "No se puede conectar" (iOS)
- Verifica que `GoogleService-Info.plist` esté en la raíz del proyecto
- Asegúrate de que el Bundle ID sea `com.gamecatalog.app`
- Reconstruye la app con `eas build` o `npx expo run:ios`

### La app no se conecta al servidor de desarrollo
- Asegúrate de estar en la misma red WiFi
- Usa el comando `npx expo start --dev-client` (no solo `npx expo start`)
- Verifica que el firewall no esté bloqueando la conexión

### "Expo Go" aparece en vez de tu app
- No puedes usar Expo Go para Google Sign-In
- Debes instalar el development build que construiste

## 📱 Diferencias entre Expo Go y Development Build

| Característica | Expo Go | Development Build |
|---------------|---------|-------------------|
| Instalación rápida | ✅ | ❌ Requiere build |
| Módulos nativos | ❌ | ✅ |
| Google Sign-In | ❌ | ✅ |
| Firebase completo | Parcial | ✅ |
| Hot Reload | ✅ | ✅ |
| Debug | ✅ | ✅ |

## 🚀 Comandos rápidos

```bash
# Desarrollo con EAS Build (recomendado)
eas build --profile development --platform all
npx expo start --dev-client

# Desarrollo local iOS (requiere Mac)
npx expo run:ios
npx expo start --dev-client

# Desarrollo local Android
npx expo run:android
npx expo start --dev-client

# Ver logs
npx expo start --dev-client
```

## 📚 Recursos

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Google Sign-In Setup](https://github.com/react-native-google-signin/google-signin)
- [Firebase para React Native](https://rnfirebase.io/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
