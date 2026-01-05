# 🔧 Solución para API en Web

## 🚨 Problema
La API de IGDB no funciona en la versión web debido a restricciones **CORS (Cross-Origin Resource Sharing)**. Los navegadores web bloquean peticiones directas a la API de IGDB por seguridad.

### ¿Por qué funciona en móvil pero no en web?
- **Móvil (iOS/Android)**: React Native no tiene restricciones CORS, puede hacer peticiones directas a la API
- **Web (Navegador)**: Los navegadores bloquean peticiones a APIs externas por CORS

## ✅ Solución Implementada

Hemos creado un **servidor proxy local** que:
1. Recibe peticiones de la aplicación web
2. Las reenvía a la API de IGDB con las credenciales correctas
3. Devuelve la respuesta a la aplicación web

### Arquitectura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  React Web  │─────▶│   Proxy     │─────▶│  IGDB API   │
│   (Puerto   │      │  (Puerto    │      │             │
│    19006)   │◀─────│   3001)     │◀─────│             │
└─────────────┘      └─────────────┘      └─────────────┘
```

## 🚀 Uso

### Opción 1: Ejecutar todo en un comando (Recomendado)

```bash
npm install
npm run web:full
```

Esto iniciará automáticamente:
- El servidor proxy en `http://localhost:3001`
- La aplicación web en `http://localhost:19006`

### Opción 2: Ejecutar manualmente

En una terminal:
```bash
npm run server
```

En otra terminal:
```bash
npm run web
```

## 📁 Archivos Creados/Modificados

### 1. `server.js` (Nuevo)
Servidor Express que actúa como proxy para las peticiones a IGDB.

### 2. `src/services/igdbApi.js` (Modificado)
Ahora detecta la plataforma:
- **Web**: Usa `http://localhost:3001/api/igdb`
- **Móvil**: Usa `https://api.igdb.com/v4`

### 3. `package.json` (Modificado)
Agregadas nuevas dependencias y scripts:
- `express`: Servidor web
- `cors`: Manejo de CORS
- `dotenv`: Variables de entorno
- `concurrently`: Ejecutar múltiples comandos

### 4. `.env.example` (Nuevo)
Plantilla para variables de entorno (opcional).

## 🔒 Seguridad

### Variables de Entorno (Opcional)
Puedes crear un archivo `.env` en la raíz del proyecto:

```env
IGDB_CLIENT_ID=tu_client_id
IGDB_ACCESS_TOKEN=tu_access_token
PORT=3001
```

Si no existe `.env`, el servidor usará las credenciales del archivo `igdbConfig.js`.

## 🐛 Solución de Problemas

### Error: "Port 3001 already in use"
El puerto ya está en uso. Opciones:
1. Cambiar el puerto en `.env`: `PORT=3002`
2. Matar el proceso: `lsof -ti:3001 | xargs kill -9`

### Error: "Cannot find module 'express'"
Instala las dependencias:
```bash
npm install
```

### Error: "Network Error" en la aplicación web
1. Verifica que el servidor proxy esté corriendo en http://localhost:3001
2. Comprueba la consola del navegador para más detalles
3. Revisa los logs del servidor

### La app móvil dejó de funcionar
El código detecta automáticamente la plataforma. Si hay problemas:
1. Limpia cache: `npm start -- --clear`
2. Reinstala dependencias: `rm -rf node_modules && npm install`

## 📊 Verificación

### Comprobar que el servidor está funcionando
```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{"status":"OK","timestamp":"2026-01-04T..."}
```

### Comprobar una petición de prueba
```bash
curl -X POST http://localhost:3001/api/igdb/games \
  -H "Content-Type: text/plain" \
  -d "fields name; limit 1;"
```

## 🌐 Deployment en Producción

Para producción, necesitarás:

1. **Backend separado**: Despliega el servidor proxy en servicios como:
   - Heroku
   - Railway
   - Render
   - Vercel (Serverless Functions)
   - AWS Lambda

2. **Actualizar la URL**: Modifica `src/services/igdbApi.js`:
```javascript
const IGDB_BASE_URL = Platform.OS === 'web' 
  ? 'https://tu-servidor-proxy.com/api/igdb'  // URL de producción
  : 'https://api.igdb.com/v4';
```

## 📝 Notas Adicionales

- El servidor proxy NO es necesario para las versiones móviles (iOS/Android)
- Solo se usa para la versión web
- Las credenciales de IGDB permanecen seguras en el servidor, no se exponen al cliente

## ✨ Alternativas

Si no quieres usar un servidor proxy local:

### 1. Serverless Functions (Vercel/Netlify)
Crear funciones serverless en lugar de un servidor Express.

### 2. Firebase Cloud Functions
Usar Firebase Functions como proxy.

### 3. Backend propio
Integrar el proxy en tu backend existente.

---

**¿Preguntas?** Revisa la documentación de [IGDB API](https://api-docs.igdb.com/) o [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
