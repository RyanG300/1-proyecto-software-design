// Script para probar las credenciales de IGDB
const axios = require('axios');
const { IGDB_CONFIG } = require('./src/config/igdbConfig');

const testIGDB = async () => {
  console.log('Testing IGDB API...');
  console.log('Client ID:', IGDB_CONFIG.CLIENT_ID ? '✓ Configured' : '✗ Missing');
  console.log('Access Token:', IGDB_CONFIG.ACCESS_TOKEN ? '✓ Configured' : '✗ Missing');
  
  try {
    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      'fields name, rating; limit 5; where rating > 90;',
      {
        headers: {
          'Client-ID': IGDB_CONFIG.CLIENT_ID,
          'Authorization': `Bearer ${IGDB_CONFIG.ACCESS_TOKEN}`,
        }
      }
    );
    
    console.log('\n✓ API Connection successful!');
    console.log(`Retrieved ${response.data.length} games:`);
    response.data.forEach(game => {
      console.log(`  - ${game.name} (Rating: ${Math.round(game.rating)})`);
    });
  } catch (error) {
    console.error('\n✗ API Connection failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n→ Invalid credentials. Check your CLIENT_ID and ACCESS_TOKEN');
      } else if (error.response.status === 400) {
        console.error('\n→ Bad request. Check the query format');
      }
    }
  }
};

testIGDB();
