# Game Catalog - Catálogo de Videojuegos

Aplicación móvil de React Native para explorar, buscar y descubrir videojuegos usando la API de IGDB.

## 🎮 Características

- **Exploración de juegos**: Descubre juegos populares, recién lanzados y próximos lanzamientos
- **Búsqueda avanzada**: Busca juegos por nombre, género y plataforma
- **Información detallada**: 
  - Portadas, screenshots y artwork
  - Ratings y reviews
  - Géneros, temas y modos de juego
  - Plataformas soportadas
  - Desarrolladores y publishers
  - Trailers y videos
  - Links oficiales (Steam, Epic Games, GOG, etc.)
  - Clasificaciones por edad (ESRB, PEGI)
  - Juegos similares
  - Y mucho más...

## 📋 Requisitos

- Node.js 14+
- npm o yarn
- Expo CLI
- Cuenta de Twitch Developer (para IGDB API)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd game-catalog
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar IGDB API**

   a. Ve a [Twitch Developer Console](https://dev.twitch.tv/console/apps)
   
   b. Crea una nueva aplicación o usa una existente
   
   c. Copia tu `Client ID`
   
   d. Genera un token de acceso con este comando:
   ```bash
   curl -X POST "https://id.twitch.tv/oauth2/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=TU_CLIENT_ID&client_secret=TU_CLIENT_SECRET&grant_type=client_credentials"
   ```
   
   e. Edita el archivo `src/config/igdbConfig.js` y reemplaza:
   ```javascript
   export const IGDB_CONFIG = {
     CLIENT_ID: 'tu_client_id_aqui',
     ACCESS_TOKEN: 'tu_access_token_aqui',
   };
   ```

4. **Iniciar la aplicación**
```bash
npm start
```

## 📱 Estructura del Proyecto

```
game-catalog/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Alert.jsx
│   │   └── GameCard.jsx     # Card de juego
│   ├── screens/             # Pantallas de la app
│   │   ├── HomeScreen.jsx           # Pantalla principal
│   │   ├── SearchScreen.jsx         # Búsqueda y filtros
│   │   ├── GameDetailsScreen.jsx    # Detalles del juego
│   │   ├── LoginScreen.jsx          # Login (WIP)
│   │   └── RegisterScreen.jsx       # Registro (WIP)
│   ├── services/            # Servicios y APIs
│   │   └── igdbApi.js       # Cliente de IGDB API
│   └── config/              # Configuración
│       └── igdbConfig.js    # Credenciales de IGDB
├── App.js                   # Punto de entrada
└── package.json
```

## 🎨 Navegación

La app utiliza:
- **Tab Navigation**: Para navegar entre Home y Search
- **Stack Navigation**: Para pantallas modales como detalles de juegos

## 🔌 API de IGDB

La aplicación utiliza los siguientes endpoints de IGDB:

- `/games` - Información de juegos
- `/genres` - Géneros disponibles
- `/platforms` - Plataformas de juego
- `/themes` - Temas de juegos
- `/game_modes` - Modos de juego
- `/companies` - Desarrolladores y publishers
- `/release_dates` - Fechas de lanzamiento
- `/age_ratings` - Clasificaciones por edad
- `/screenshots` - Capturas de pantalla
- `/artworks` - Arte promocional
- `/game_videos` - Trailers y videos
- Y más...

## 📝 Funciones del Servicio API

El archivo `igdbApi.js` incluye funciones para:

- `getGames()` - Obtener juegos con opciones de filtrado
- `getGameById(id)` - Obtener detalles completos de un juego
- `searchGames(term)` - Buscar juegos por nombre
- `getPopularGames()` - Juegos más populares
- `getRecentlyReleased()` - Juegos recién lanzados
- `getComingSoon()` - Próximos lanzamientos
- `getGamesByGenre(genreId)` - Filtrar por género
- `getGamesByPlatform(platformId)` - Filtrar por plataforma
- `getGenres()` - Lista de géneros
- `getPlatforms()` - Lista de plataformas
- Y muchas más...

## 🎯 Próximas Funcionalidades

- [ ] Sistema de autenticación completo
- [ ] Favoritos y listas personalizadas
- [ ] Reseñas de usuarios
- [ ] Notificaciones de lanzamientos
- [ ] Modo oscuro/claro
- [ ] Compartir juegos
- [ ] Integración con plataformas de compra

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Agradecimientos

- [IGDB](https://www.igdb.com/) - Por proporcionar la API de videojuegos
- [Expo](https://expo.dev/) - Por facilitar el desarrollo en React Native
- [React Navigation](https://reactnavigation.org/) - Por el sistema de navegación

---

Hecho con ❤️ para los amantes de los videojuegos
