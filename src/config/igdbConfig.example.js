// Configuración de IGDB API - ARCHIVO DE EJEMPLO
// 
// 1. Copia este archivo como "igdbConfig.js" en el mismo directorio
// 2. Reemplaza los valores con tus credenciales reales
// 3. NUNCA subas el archivo igdbConfig.js a git (ya está en .gitignore)
//
// Para obtener tus credenciales:
// 1. Ve a https://dev.twitch.tv/console/apps
// 2. Crea una nueva aplicación (si no tienes una)
// 3. Copia tu Client ID
// 4. Genera un token OAuth usando:
//    POST https://id.twitch.tv/oauth2/token
//    ?client_id=YOUR_CLIENT_ID
//    &client_secret=YOUR_CLIENT_SECRET
//    &grant_type=client_credentials

export const IGDB_CONFIG = {
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
  ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN_HERE',
};

// Instrucciones para generar el token:
// 
// curl -X POST "https://id.twitch.tv/oauth2/token" \
//   -H "Content-Type: application/x-www-form-urlencoded" \
//   -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials"
//
// La respuesta incluirá un "access_token" que debes copiar aquí
// 
// IMPORTANTE: Los tokens de acceso expiran. Si la app deja de funcionar,
// genera un nuevo token siguiendo los pasos anteriores.
