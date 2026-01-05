import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      // Common
      loading: 'Loading...',
      search: 'Search',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      
      // Tabs
      home: 'Home',
      favorites: 'Favorites',
      profile: 'Profile',
      
      // Home Screen
      welcomeBack: 'Welcome back',
      gameCatalog: 'Game Catalog',
      trending: 'Trending',
      action: 'Action',
      rpg: 'RPG',
      strategy: 'Strategy',
      indie: 'Indie',
      adventure: 'Adventure',
      shooter: 'Shooter',
      platformer: 'Platformer',
      featured: 'Featured',
      seeAll: 'SEE ALL',
      topRated: 'Top Rated',
      poweredBy: 'Powered by IGDB',
      
      // Search Screen
      searchGames: 'Search games, genres...',
      recentHistory: 'RECENT HISTORY',
      clearAll: 'Clear All',
      suggestedForYou: 'Suggested for you',
      results: 'Results',
      filterByGenre: 'Filter by Genre',
      all: 'All',
      loadingSuggestions: 'Loading suggestions...',
      popularGame: 'Popular game',
      
      // Favorites Screen
      yourCollection: 'Your Collection',
      noFavoritesYet: 'No Favorites Yet',
      startAddingGames: 'Start adding games to your favorites!',
      savedGames: 'Saved Games',
      recentlyAdded: 'Recently Added',
      
      // Game Details
      aboutGame: 'About Game',
      readMore: 'Read More',
      showLess: 'Show Less',
      noDescription: 'No description available for this game yet.',
      availableOn: 'Available On',
      media: 'Media',
      ratingsAndReviews: 'Ratings & Reviews',
      reviews: 'Reviews',
      buyNow: 'Buy Now',
      addToCart: 'Add to Cart',
      rating: 'Rating',
      duration: 'Duration',
      ageRating: 'Age Rating',
      unknownDeveloper: 'Unknown Developer',
      linkNotAvailable: 'Link not available',
      availableInStores: 'Available in Stores',
      pc: 'PC',
      drmFree: 'DRM Free',
      officialWebsite: 'Official Website',
      releaseDate: 'Release Date',
      developer: 'Developer',
      publisher: 'Publisher',
      genres: 'Genres',
      themes: 'Themes',
      platforms: 'Platforms',
      gameModes: 'Game Modes',
      playerPerspectives: 'Player Perspectives',
      ageRatings: 'Age Ratings',
      summary: 'Summary',
      storyline: 'Storyline',
      screenshots: 'Screenshots',
      videos: 'Videos',
      links: 'Links',
      similarGames: 'Similar Games',
      gameNotFound: 'Game not found',
      
      // Profile Screen
      settings: 'Settings',
      logout: 'Logout',
      history: 'History',
      achievements: 'Achievements',
      myFavoriteGames: 'My favorite games',
      recentlyViewed: 'Recently viewed',
      justNow: 'Just now',
      clear: 'Clear',
      noHistory: 'No history yet',
      noHistoryDescription: 'Games you view will appear here',
      
      // Settings Screen
      appearance: 'Appearance',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      neon: 'Neon',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      notifications: 'Notifications',
      newReleases: 'New Releases',
      priceDrops: 'Price Drops',
      about: 'About',
      version: 'Version',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      
      // Game Categories
      gamesCount: '{{count}} Games',
      loadingGames: 'Loading games...',
      autoRefreshing: 'Auto-refreshing...',
    },
  },
  es: {
    translation: {
      // Common
      loading: 'Cargando...',
      search: 'Buscar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      
      // Tabs
      home: 'Inicio',
      favorites: 'Favoritos',
      profile: 'Perfil',
      
      // Home Screen
      welcomeBack: 'Bienvenido de nuevo',
      gameCatalog: 'Catálogo de Juegos',
      trending: 'Tendencia',
      action: 'Acción',
      rpg: 'RPG',
      strategy: 'Estrategia',
      indie: 'Indie',
      adventure: 'Aventura',
      shooter: 'Disparos',
      platformer: 'Plataformas',
      featured: 'Destacados',
      seeAll: 'VER TODO',
      topRated: 'Mejor Valorados',
      poweredBy: 'Con tecnología de IGDB',
      
      // Search Screen
      searchGames: 'Buscar juegos, géneros...',
      recentHistory: 'HISTORIAL RECIENTE',
      clearAll: 'Limpiar Todo',
      suggestedForYou: 'Sugeridos para ti',
      results: 'Resultados',
      filterByGenre: 'Filtrar por Género',
      all: 'Todos',
      loadingSuggestions: 'Cargando sugerencias...',
      popularGame: 'Juego popular',
      
      // Favorites Screen
      yourCollection: 'Tu Colección',
      noFavoritesYet: 'Sin Favoritos Aún',
      startAddingGames: '¡Empieza a agregar juegos a tus favoritos!',
      savedGames: 'Juegos Guardados',
      recentlyAdded: 'Agregados Recientemente',
      
      // Game Details
      aboutGame: 'Acerca del Juego',
      readMore: 'Leer Más',
      showLess: 'Mostrar Menos',
      noDescription: 'Aún no hay descripción disponible para este juego.',
      availableOn: 'Disponible En',
      media: 'Multimedia',
      ratingsAndReviews: 'Valoraciones y Reseñas',
      reviews: 'Reseñas',
      buyNow: 'Comprar Ahora',
      addToCart: 'Agregar al Carrito',
      rating: 'Valoración',
      duration: 'Duración',
      ageRating: 'Clasificación',
      unknownDeveloper: 'Desarrollador Desconocido',
      linkNotAvailable: 'Enlace no disponible',
      availableInStores: 'Disponible en Tiendas',
      pc: 'PC',
      drmFree: 'Sin DRM',
      officialWebsite: 'Sitio Web Oficial',
      releaseDate: 'Fecha de Lanzamiento',
      developer: 'Desarrollador',
      publisher: 'Editor',
      genres: 'Géneros',
      themes: 'Temas',
      platforms: 'Plataformas',
      gameModes: 'Modos de Juego',
      playerPerspectives: 'Perspectivas de Jugador',
      ageRatings: 'Clasificaciones de Edad',
      summary: 'Resumen',
      storyline: 'Historia',
      screenshots: 'Capturas de Pantalla',
      videos: 'Videos',
      links: 'Enlaces',
      similarGames: 'Juegos Similares',
      gameNotFound: 'Juego no encontrado',
      
      // Profile Screen
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
      history: 'Historial',
      achievements: 'Logros',
      myFavoriteGames: 'Mis juegos favoritos',
      recentlyViewed: 'Vistos recientemente',
      justNow: 'Justo ahora',
      clear: 'Limpiar',
      noHistory: 'Sin historial aún',
      noHistoryDescription: 'Los juegos que veas aparecerán aquí',
      
      // Settings Screen
      appearance: 'Apariencia',
      theme: 'Tema',
      dark: 'Oscuro',
      light: 'Claro',
      neon: 'Neón',
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      notifications: 'Notificaciones',
      newReleases: 'Nuevos Lanzamientos',
      priceDrops: 'Descuentos de Precio',
      about: 'Acerca de',
      version: 'Versión',
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio',
      
      // Game Categories
      gamesCount: '{{count}} Juegos',
      loadingGames: 'Cargando juegos...',
      autoRefreshing: 'Actualizando automáticamente...',
    },
  },
};

// Función para obtener el idioma guardado o el del sistema
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage) {
      return savedLanguage;
    }
    // Si no hay idioma guardado, usar el del sistema
    const systemLanguage = Localization.locale.split('-')[0]; // 'en-US' -> 'en'
    return systemLanguage === 'es' ? 'es' : 'en';
  } catch (error) {
    return 'en';
  }
};

// Inicializar i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
