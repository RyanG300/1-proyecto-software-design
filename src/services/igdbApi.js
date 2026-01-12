import axios from 'axios';
import { Platform } from 'react-native';
import { IGDB_CONFIG } from '../config/igdbConfig';

// En web, usar proxy local para evitar CORS
// En móvil, usar la API directamente
const IGDB_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:3001/api/igdb'
    : 'https://api.igdb.com/v4';

// Configuración del cliente
const igdbClient = axios.create({
  baseURL: IGDB_BASE_URL,
  headers: Platform.OS === 'web' ? {
    // En web, el proxy maneja los headers
    'Content-Type': 'text/plain',
  } : {
    // En móvil, enviar headers directamente
    'Client-ID': IGDB_CONFIG.CLIENT_ID,
    'Authorization': `Bearer ${IGDB_CONFIG.ACCESS_TOKEN}`,
  },
});

// Helper para construir queries de IGDB
const buildQuery = (fields, options = {}) => {
  let query = `fields ${fields};`;

  if (options.where) query += ` where ${options.where};`;
  if (options.sort) query += ` sort ${options.sort};`;
  if (options.limit) query += ` limit ${options.limit};`;
  if (options.offset) query += ` offset ${options.offset};`;
  if (options.search) query += ` search "${options.search}";`;

  return query;
};

// Helper para construir URL de imagen de IGDB
export const getImageUrl = (imageId, size = 'cover_big') => {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
};

// ============ GAMES ============
export const getGames = async (options = {}) => {
  const fields = 'name, summary, storyline, rating, category, ' +
      'cover.image_id, ' +
      'platforms.name, platforms.abbreviation, ' +
      'genres.name, themes.name, ' +
      'involved_companies.company.name, involved_companies.developer, ' +
      'first_release_date, ' +
      'total_rating, total_rating_count';

  const query = buildQuery(fields, {
    limit: options.limit || 50,
    offset: options.offset || 0,
    where: options.where,
    sort: options.sort || 'rating desc',
  });

  const response = await igdbClient.post('/games', query);
  return response.data;
};

export const getGameById = async (gameId) => {
  const fields = 'name, summary, storyline, rating, category, ' +
      'cover.image_id, screenshots.image_id, artworks.image_id, ' +
      'platforms.name, platforms.abbreviation, ' +
      'genres.name, themes.name, game_modes.name, ' +
      'player_perspectives.name, ' +
      'involved_companies.company.name, involved_companies.developer, involved_companies.publisher, ' +
      'websites.url, websites.category, ' +
      'videos.video_id, videos.name, ' +
      'first_release_date, ' +
      'total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, ' +
      'age_ratings.rating, age_ratings.category, ' +
      'similar_games.name, similar_games.cover.image_id';

  const query = buildQuery(fields, { where: `id = ${gameId}` });
  const response = await igdbClient.post('/games', query);
  const gameData = response.data[0];

  // Log para debug
  console.log('=== GAME DATA DEBUG ===' );
  console.log('Game ID:', gameId);
  console.log('Game Name:', gameData?.name);
  console.log('Has Summary:', !!gameData?.summary);
  console.log('Has Storyline:', !!gameData?.storyline);
  console.log('Has Screenshots:', gameData?.screenshots?.length || 0);
  console.log('Has Videos:', gameData?.videos?.length || 0);
  console.log('Has Websites:', gameData?.websites?.length || 0);
  console.log('Has Platforms:', gameData?.platforms?.length || 0);
  console.log('Has Involved Companies:', gameData?.involved_companies?.length || 0);
  console.log('Summary:', gameData?.summary);
  console.log('Storyline:', gameData?.storyline);
  console.log('=====================');

  return gameData;
};

export const searchGames = async (searchTerm, limit = 10) => {
  const fields = 'name, summary, cover.image_id, rating, first_release_date, platforms.name, genres.name, involved_companies.company.name, involved_companies.developer';
  const query = buildQuery(fields, {
    search: searchTerm,
    limit: limit * 2,
  });

  const response = await igdbClient.post('/games', query);
  // Filtrar juegos que tienen al menos cover y summary
  const filtered = response.data.filter(game =>
      game.cover?.image_id && (game.summary || game.rating)
  );
  return filtered.slice(0, limit);
};

// ============ SIMILAR GAMES (NUEVO) ============
export const getSimilarGames = async (gameId, limit = 10) => {
  const fields =
      'similar_games.id, similar_games.name, similar_games.summary, similar_games.cover.image_id, similar_games.rating, ' +
      'similar_games.genres.name, similar_games.themes.name, ' +
      'similar_games.involved_companies.company.name, similar_games.involved_companies.developer';

  const query = buildQuery(fields, { where: `id = ${gameId}`, limit: 1 });
  const response = await igdbClient.post('/games', query);

  const similar = response.data?.[0]?.similar_games || [];

  // mismo criterio que searchGames: cover + (summary o rating)
  const filtered = similar.filter(game =>
      game.cover?.image_id && (game.summary || game.rating)
  );

  return filtered.slice(0, limit);
};

export const getPopularGames = async (limit = 20) => {
  return getGames({
    limit: limit * 2, // Pedimos el doble para filtrar
    where: 'rating != null & rating > 80 & summary != null & cover != null & involved_companies != null',
    sort: 'rating desc',
  }).then(games => games.slice(0, limit)); // Devolvemos solo el límite solicitado
};

export const getRecentlyReleased = async (limit = 20) => {
  const sixMonthsAgo = Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60);
  const now = Math.floor(Date.now() / 1000);
  return getGames({
    limit: limit * 2,
    where: `first_release_date > ${sixMonthsAgo} & first_release_date < ${now} & summary != null & cover != null & involved_companies != null`,
    sort: 'first_release_date desc',
  }).then(games => games.slice(0, limit));
};

export const getComingSoon = async (limit = 20) => {
  const now = Math.floor(Date.now() / 1000);
  const oneYearFromNow = now + (365 * 24 * 60 * 60);
  return getGames({
    limit: limit * 2,
    where: `first_release_date > ${now} & first_release_date < ${oneYearFromNow} & summary != null & cover != null`,
    sort: 'first_release_date asc',
  }).then(games => games.slice(0, limit));
};

export const getGamesByGenre = async (genreId, limit = 20) => {
  return getGames({
    limit: limit * 2,
    where: `genres = [${genreId}] & summary != null & cover != null & rating != null & involved_companies != null`,
    sort: 'rating desc',
  }).then(games => games.slice(0, limit));
};

export const getGamesByPlatform = async (platformId, limit = 20) => {
  return getGames({
    limit,
    where: `platforms = [${platformId}]`,
    sort: 'rating desc',
  });
};

// ============ RANDOM GAMES ============
export const getRandomGames = async (limit = 3) => {
  // Generar offset aleatorio (IGDB tiene miles de juegos)
  const randomOffset = Math.floor(Math.random() * 1000);

  const fields = 'name, summary, cover.image_id, rating, ' +
      'platforms.name, genres.name, themes.name, ' +
      'involved_companies.company.name, involved_companies.developer, ' +
      'first_release_date';

  const query = buildQuery(fields, {
    limit: limit * 3, // Pedimos más para filtrar
    offset: randomOffset,
    where: 'rating != null & rating > 75 & summary != null & cover != null & involved_companies != null & total_rating_count > 10',
    sort: 'rating desc',
  });

  const response = await igdbClient.post('/games', query);

  // Mezclar aleatoriamente y tomar solo los que necesitamos
  const shuffled = response.data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};

export const getRandomGamesByGenre = async (genreId, limit = 10) => {
  // Generar offset aleatorio para variedad
  const randomOffset = Math.floor(Math.random() * 200);

  const fields = 'name, summary, cover.image_id, rating, ' +
      'platforms.name, genres.name, themes.name, ' +
      'involved_companies.company.name, involved_companies.developer, ' +
      'first_release_date';

  const query = buildQuery(fields, {
    limit: limit * 2,
    offset: randomOffset,
    where: `genres = [${genreId}] & rating != null & rating > 70 & summary != null & cover != null & involved_companies != null`,
    sort: 'rating desc',
  });

  const response = await igdbClient.post('/games', query);

  // Mezclar aleatoriamente
  const shuffled = response.data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};

// ============ GENRES ============
export const getGenres = async () => {
  const query = 'fields name, slug; limit 50; sort name asc;';
  const response = await igdbClient.post('/genres', query);
  return response.data;
};

// ============ PLATFORMS ============
export const getPlatforms = async () => {
  const query = 'fields name, abbreviation, platform_logo.image_id, platform_family; ' +
      'where category = (1,5,6); limit 100; sort name asc;';
  const response = await igdbClient.post('/platforms', query);
  return response.data;
};

export const getPlatformFamilies = async () => {
  const query = 'fields name, slug; limit 50;';
  const response = await igdbClient.post('/platform_families', query);
  return response.data;
};

// ============ THEMES ============
export const getThemes = async () => {
  const query = 'fields name, slug; limit 50; sort name asc;';
  const response = await igdbClient.post('/themes', query);
  return response.data;
};

// ============ GAME MODES ============
export const getGameModes = async () => {
  const query = 'fields name, slug; limit 20;';
  const response = await igdbClient.post('/game_modes', query);
  return response.data;
};

// ============ PLAYER PERSPECTIVES ============
export const getPlayerPerspectives = async () => {
  const query = 'fields name, slug; limit 20;';
  const response = await igdbClient.post('/player_perspectives', query);
  return response.data;
};

// ============ COMPANIES ============
export const getCompanies = async (limit = 50) => {
  const query = `fields name, slug, description, country, logo.image_id, websites.url; ` +
      `limit ${limit}; sort name asc;`;
  const response = await igdbClient.post('/companies', query);
  return response.data;
};

// ============ AGE RATINGS ============
export const getAgeRatings = async (gameId) => {
  const query = `fields category, rating, synopsis; where game = ${gameId};`;
  const response = await igdbClient.post('/age_ratings', query);
  return response.data;
};

// ============ RELEASE DATES ============
export const getReleaseDates = async (gameId) => {
  const query = `fields date, human, platform.name, region, status; ` +
      `where game = ${gameId}; sort date asc;`;
  const response = await igdbClient.post('/release_dates', query);
  return response.data;
};

// ============ TIME TO BEAT ============
export const getTimeToBeat = async (gameId) => {
  const query = `fields hastly, normally, completely; where game = ${gameId};`;
  const response = await igdbClient.post('/game_time_to_beat', query);
  return response.data[0];
};

// ============ LANGUAGE SUPPORT ============
export const getLanguageSupport = async (gameId) => {
  const query = `fields language.name, language_support_type.name; ` +
      `where game = ${gameId};`;
  const response = await igdbClient.post('/language_supports', query);
  return response.data;
};

// ============ SEARCH GLOBAL ============
export const globalSearch = async (searchTerm) => {
  const query = `search "${searchTerm}"; fields game.name, game.cover.image_id, ` +
      `name, alternative_name, published_at;`;
  const response = await igdbClient.post('/search', query);
  return response.data;
};

// ============ COVERS ============
export const getCover = async (coverId) => {
  const query = `fields image_id, url, width, height; where id = ${coverId};`;
  const response = await igdbClient.post('/covers', query);
  return response.data[0];
};

// ============ SCREENSHOTS ============
export const getScreenshots = async (gameId) => {
  const query = `fields image_id, url, width, height; where game = ${gameId};`;
  const response = await igdbClient.post('/screenshots', query);
  return response.data;
};

// ============ ARTWORKS ============
export const getArtworks = async (gameId) => {
  const query = `fields image_id, url, width, height; where game = ${gameId};`;
  const response = await igdbClient.post('/artworks', query);
  return response.data;
};

// ============ VIDEOS ============
export const getGameVideos = async (gameId) => {
  const query = `fields video_id, name; where game = ${gameId};`;
  const response = await igdbClient.post('/game_videos', query);
  return response.data;
};

// Helper para obtener URL de YouTube desde video_id
export const getYouTubeUrl = (videoId) => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

export default {
  getGames,
  getGameById,
  searchGames,
  getSimilarGames,
  getPopularGames,
  getRecentlyReleased,
  getComingSoon,
  getGamesByGenre,
  getGamesByPlatform,
  getRandomGames,
  getRandomGamesByGenre,
  getGenres,
  getPlatforms,
  getPlatformFamilies,
  getThemes,
  getGameModes,
  getPlayerPerspectives,
  getCompanies,
  getAgeRatings,
  getReleaseDates,
  getTimeToBeat,
  getLanguageSupport,
  globalSearch,
  getCover,
  getScreenshots,
  getArtworks,
  getGameVideos,
  getImageUrl,
  getYouTubeUrl,
};