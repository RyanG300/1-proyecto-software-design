const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de IGDB
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID || 'xizj5ndo15rdoz7ba3tfhb9gxcuwgh';
const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN || '95jljjaiz5cgk0wkypd113a6r6atjy';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());

// Logs de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Proxy para todas las peticiones de IGDB
app.post('/api/igdb/*', async (req, res) => {
  try {
    const endpoint = req.params[0];
    const query = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    console.log(`Proxying to IGDB: ${endpoint}`);
    console.log(`Query: ${query}`);
    
    const response = await axios.post(
      `${IGDB_BASE_URL}/${endpoint}`,
      query,
      {
        headers: {
          'Client-ID': IGDB_CLIENT_ID,
          'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
          'Content-Type': 'text/plain',
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error en proxy:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying IGDB API calls to avoid CORS issues`);
});
