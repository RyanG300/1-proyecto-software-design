const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Firebase Admin SDK
let db = null;
try {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "gamecatalog-fb44e",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: "gamecatalog-fb44e",
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️  Firebase Admin credentials not found. Discord auth will not work.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
}

// Configuración de IGDB
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID || 'g43hn7u7lscaxgyw3feuy5lfmxz9p7';
const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN || 'ya4ghswpsfkabioxjvkhrjqs0tpbe2';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// Configuración de Discord OAuth
const DISCORD_CLIENT_ID = '1459283552968380592';
const DISCORD_CLIENT_SECRET = 'lngmUvUoa4RSMYHKa3WEDm1MAIxutW_7';
const DISCORD_REDIRECT_URI = 'http://localhost:3001/api/auth/callback/discord';
const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_API_URL = 'https://discord.com/api/v10';

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

// Ruta para iniciar OAuth de Discord
app.get('/api/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
  });
  
  const authUrl = `${DISCORD_OAUTH_URL}?${params.toString()}`;
  res.redirect(authUrl);
});

// Callback de Discord OAuth
app.get('/api/auth/callback/discord', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No code provided');
  }
  
  try {
    // Intercambiar código por token
    const tokenResponse = await axios.post(
      DISCORD_TOKEN_URL,
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    // Obtener información del usuario
    const userResponse = await axios.get(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    const discordUser = userResponse.data;
    
    // Verificar si Firebase Admin está disponible
    if (!db) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discord Login Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'discord-auth-error',
              error: 'Firebase Admin not configured on server'
            }, '*');
            window.close();
          </script>
          <p>Error: Server configuration incomplete. Please contact administrator.</p>
        </body>
        </html>
      `);
    }
    
    // Crear un ID único para el usuario de Discord
    const discordUid = `discord_${discordUser.id}`;
    
    try {
      // Verificar si el usuario ya existe en Firestore
      const userDocRef = db.collection('users').doc(discordUid);
      const userDoc = await userDocRef.get();
      
      // Si no existe, crear el usuario en Firestore
      if (!userDoc.exists) {
        await userDocRef.set({
          username: discordUser.username,
          email: discordUser.email || null,
          discordId: discordUser.id,
          createdAt: new Date().toISOString(),
          hasCompletedPreferences: false,
          favoriteGenres: [],
          provider: 'discord',
        });
      }
      
      // Crear custom token para Firebase Auth
      const customToken = await admin.auth().createCustomToken(discordUid, {
        provider: 'discord',
        discordId: discordUser.id,
      });
      
      // Enviar HTML que cierre la ventana y pase el custom token
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discord Login</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'discord-auth',
              customToken: '${customToken}',
              userData: ${JSON.stringify({
                id: discordUser.id,
                username: discordUser.username,
                email: discordUser.email,
                avatar: discordUser.avatar,
              })}
            }, '*');
            window.close();
          </script>
          <p>Autenticación exitosa. Puedes cerrar esta ventana.</p>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error creando usuario o token:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discord Login Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'discord-auth-error',
              error: 'Failed to create authentication token'
            }, '*');
            window.close();
          </script>
          <p>Error en la autenticación. Puedes cerrar esta ventana.</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error en callback de Discord:', error.response?.data || error.message);
    res.status(500).send('Error during Discord authentication');
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
