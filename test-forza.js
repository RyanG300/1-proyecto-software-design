// Script para probar qué datos tiene Forza Horizon en IGDB
const axios = require('axios');
const { IGDB_CONFIG } = require('./src/config/igdbConfig');

const testForza = async () => {
  console.log('Searching for Forza Horizon...\n');
  
  try {
    // Buscar Forza Horizon
    const searchResponse = await axios.post(
      'https://api.igdb.com/v4/games',
      'search "Forza Horizon"; fields id, name; limit 5;',
      {
        headers: {
          'Client-ID': IGDB_CONFIG.CLIENT_ID,
          'Authorization': `Bearer ${IGDB_CONFIG.ACCESS_TOKEN}`,
        }
      }
    );
    
    console.log('Found games:');
    searchResponse.data.forEach(game => {
      console.log(`  ID: ${game.id} - ${game.name}`);
    });
    
    if (searchResponse.data.length > 0) {
      const gameId = searchResponse.data[0].id;
      console.log(`\nFetching full details for: ${searchResponse.data[0].name} (ID: ${gameId})\n`);
      
      // Obtener detalles completos
      const detailsResponse = await axios.post(
        'https://api.igdb.com/v4/games',
        `fields name, summary, storyline, rating, ` +
        `cover.image_id, screenshots.image_id, ` +
        `platforms.name, platforms.abbreviation, ` +
        `genres.name, themes.name, ` +
        `involved_companies.company.name, involved_companies.developer, involved_companies.publisher, ` +
        `websites.url, websites.category, ` +
        `videos.video_id, ` +
        `first_release_date, ` +
        `total_rating, total_rating_count, aggregated_rating; ` +
        `where id = ${gameId};`,
        {
          headers: {
            'Client-ID': IGDB_CONFIG.CLIENT_ID,
            'Authorization': `Bearer ${IGDB_CONFIG.ACCESS_TOKEN}`,
          }
        }
      );
      
      const game = detailsResponse.data[0];
      console.log('=== GAME DETAILS ===');
      console.log('Name:', game.name);
      console.log('Has Summary:', !!game.summary, game.summary ? `(${game.summary.substring(0, 100)}...)` : '');
      console.log('Has Storyline:', !!game.storyline, game.storyline ? `(${game.storyline.substring(0, 100)}...)` : '');
      console.log('Rating:', game.rating);
      console.log('Total Rating:', game.total_rating);
      console.log('Aggregated Rating:', game.aggregated_rating);
      console.log('Screenshots:', game.screenshots?.length || 0);
      console.log('Videos:', game.videos?.length || 0);
      console.log('Websites:', game.websites?.length || 0);
      console.log('Platforms:', game.platforms?.length || 0, game.platforms?.map(p => p.name).join(', '));
      console.log('Genres:', game.genres?.length || 0, game.genres?.map(g => g.name).join(', '));
      console.log('Involved Companies:', game.involved_companies?.length || 0);
      
      if (game.involved_companies && game.involved_companies.length > 0) {
        console.log('\nCompanies:');
        game.involved_companies.forEach(ic => {
          const roles = [];
          if (ic.developer) roles.push('Developer');
          if (ic.publisher) roles.push('Publisher');
          console.log(`  - ${ic.company?.name || 'Unknown'} (${roles.join(', ')})`);
        });
      }
      
      if (game.websites && game.websites.length > 0) {
        console.log('\nWebsites:');
        game.websites.forEach(w => {
          console.log(`  - Category ${w.category}: ${w.url}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testForza();
