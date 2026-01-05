# Game Catalog - Versión Web 🌐

Esta es la versión web de Game Catalog, adaptada para funcionar en navegadores modernos.

## 🚀 Inicio Rápido

### IMPORTANTE: Servidor Proxy para API

La versión web requiere un servidor proxy local para evitar problemas de CORS con la API de IGDB.

#### Opción 1: Ejecutar todo en un comando (Recomendado)

```bash
npm install
npm run web:full
```

Esto iniciará automáticamente el servidor proxy y la aplicación web.

#### Opción 2: Ejecutar manualmente

En una terminal:
```bash
npm run server
```

En otra terminal:
```bash
npm run web
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:19006`

⚠️ **Nota**: El servidor proxy debe estar corriendo para que la API funcione en web. Ver `WEB_API_FIX.md` para más detalles.

### Ejecutar con opciones específicas

```bash
# Especificar puerto
npx expo start --web --port 8080

# Modo de producción
npx expo start --web --no-dev --minify
```

## 📦 Compilar para Producción

### Opción 1: Build con Expo (Recomendado)

```bash
npx expo export:web
```

Esto generará una carpeta `web-build/` con los archivos estáticos listos para deployment.

### Opción 2: Build directo con webpack

```bash
npx expo build:web
```

## 🌍 Deployment

### Deploy en Netlify

1. Instala Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Compila la aplicación:
```bash
npx expo export:web
```

3. Deploy:
```bash
cd web-build
netlify deploy --prod
```

### Deploy en Vercel

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Compila la aplicación:
```bash
npx expo export:web
```

3. Deploy:
```bash
vercel --prod
```

O simplemente conecta tu repositorio de GitHub a Vercel y despliega automáticamente.

### Deploy en Firebase Hosting

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia Firebase en el proyecto:
```bash
firebase init hosting
```

Cuando pregunte por el directorio público, usa `web-build`

3. Compila y despliega:
```bash
npx expo export:web
firebase deploy
```

### Deploy en GitHub Pages

1. Instala gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Agrega estos scripts al `package.json`:
```json
"scripts": {
  "predeploy": "expo export:web",
  "deploy": "gh-pages -d web-build"
}
```

3. Despliega:
```bash
npm run deploy
```

## 🎨 Características Web

### Adaptaciones realizadas

- ✅ **BlurView**: Reemplazado con CSS `backdrop-filter` en web
- ✅ **Google Sign-In**: Adaptado para usar Firebase Auth Web
- ✅ **AsyncStorage**: Compatible con web automáticamente
- ✅ **Navegación**: React Navigation funciona igual en web
- ✅ **Estilos**: Responsive y adaptado para diferentes tamaños de pantalla
- ✅ **Íconos**: Expo Vector Icons funciona en web

### Diferencias con la versión móvil

1. **Gestos**: Algunos gestos nativos se reemplazan con eventos de mouse/touch
2. **Blur effect**: En web usa CSS `backdrop-filter` en lugar de BlurView nativo
3. **Google Sign-In**: En web usa el SDK de Firebase para web en lugar del paquete nativo

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# IGDB API
IGDB_CLIENT_ID=tu_client_id
IGDB_ACCESS_TOKEN=tu_access_token

# Firebase (opcional, si no usas firebaseConfig.js)
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
FIREBASE_PROJECT_ID=tu_project_id
```

### Firebase Auth para Web

La autenticación con Firebase funciona automáticamente en web. Para Google Sign-In en web:

1. Ve a Firebase Console → Authentication → Sign-in method
2. Habilita "Google" como proveedor
3. Agrega tu dominio a la lista de dominios autorizados

## 📱 Responsive Design

La aplicación está optimizada para:

- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🐛 Solución de Problemas

### Error: "Module not found"

```bash
# Limpia cache y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module 'react-native-web'"

```bash
npm install react-native-web react-dom
```

### La aplicación no carga en el navegador

1. Verifica que el puerto 19006 esté disponible
2. Intenta con otro puerto: `npx expo start --web --port 8080`
3. Limpia la cache: `npx expo start --web --clear`

### Estilos no se ven correctamente

Verifica que tu navegador soporte:
- CSS Grid
- Flexbox
- backdrop-filter (para efectos blur)

## 🔒 Seguridad

**IMPORTANTE**: Nunca expongas tus API keys en el código del cliente. Para producción:

1. Usa variables de entorno
2. Implementa un backend proxy para llamadas a APIs sensibles
3. Configura CORS apropiadamente en Firebase y otras APIs

## 📊 Performance

Para mejorar el rendimiento en producción:

1. **Code Splitting**: Expo automáticamente divide el código
2. **Lazy Loading**: Carga componentes bajo demanda
3. **Image Optimization**: Las imágenes se optimizan automáticamente
4. **Minification**: Activado en build de producción

## 🌐 Navegadores Soportados

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)

## 📝 Notas Adicionales

### PWA (Progressive Web App)

La aplicación incluye un manifest.json para soporte PWA básico. Los usuarios pueden:
- Instalar la app en su dispositivo
- Usar offline (con service worker adicional)
- Recibir notificaciones (requiere configuración adicional)

### SEO

Para mejorar el SEO, considera:
- Usar Server-Side Rendering (Next.js)
- Agregar meta tags apropiados
- Implementar sitemap.xml
- Usar pre-rendering para páginas estáticas

## 🤝 Contribuir

¿Encontraste un bug o tienes una sugerencia para la versión web? 
Abre un issue o pull request en el repositorio.

## 📄 Licencia

MIT - igual que la versión móvil

---

**¿Necesitas ayuda?** Revisa la documentación de [Expo Web](https://docs.expo.dev/workflow/web/)
