# Configuración de Firebase Admin SDK

Este documento explica cómo configurar las credenciales de Firebase Admin necesarias para la autenticación con Discord.

## ¿Por qué es necesario?

Firebase Admin SDK permite que el servidor backend genere tokens de autenticación personalizados (custom tokens) para usuarios que se autentican mediante Discord, permitiendo que se integren correctamente con Firebase Authentication.

## Pasos para obtener las credenciales

### 1. Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **gamecatalog-fb44e**

### 2. Generar clave privada

1. En la consola de Firebase, haz clic en el ícono de **⚙️ (configuración)** junto a "Project Overview"
2. Selecciona **Project Settings** (Configuración del proyecto)
3. Ve a la pestaña **Service Accounts** (Cuentas de servicio)
4. En la sección "Firebase Admin SDK", haz clic en el botón **Generate new private key** (Generar nueva clave privada)
5. Confirma haciendo clic en **Generate key**
6. Se descargará un archivo JSON con un nombre similar a: `gamecatalog-fb44e-firebase-adminsdk-xxxxx.json`

### 3. Configurar las variables de entorno

1. Abre el archivo JSON descargado con un editor de texto
2. Busca los campos `client_email` y `private_key`
3. Crea o edita el archivo `.env` en la raíz del proyecto
4. Agrega las siguientes líneas:

```env
FIREBASE_CLIENT_EMAIL=valor_de_client_email_del_json
FIREBASE_PRIVATE_KEY="valor_de_private_key_del_json"
```

### Ejemplo de cómo se ve el archivo JSON:

```json
{
  "type": "service_account",
  "project_id": "gamecatalog-fb44e",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@gamecatalog-fb44e.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

### Ejemplo del archivo `.env` completo:

```env
# Firebase Admin SDK Credentials
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gamecatalog-fb44e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBg...\n-----END PRIVATE KEY-----\n"

# IGDB API Configuration (opcional)
# IGDB_CLIENT_ID=tu_client_id
# IGDB_ACCESS_TOKEN=tu_access_token
```

## ⚠️ Importante

- **NO COMPARTAS** el archivo JSON ni el contenido de `private_key` públicamente
- **NO SUBAS** el archivo `.env` a Git (ya está en `.gitignore`)
- **GUARDA** el archivo JSON en un lugar seguro por si necesitas regenerar las credenciales
- Si el archivo JSON se pierde, puedes generar una nueva clave siguiendo los mismos pasos

## Verificar que funciona

Después de configurar el archivo `.env`:

1. Reinicia el servidor:

   ```bash
   npm run server
   ```

2. Deberías ver el mensaje:

   ```
   ✅ Firebase Admin SDK initialized successfully
   ```

3. Si ves un error, verifica que:
   - Copiaste correctamente el `client_email` y `private_key`
   - El `private_key` está entre comillas dobles
   - Los caracteres `\n` en el private_key están presentes

## Troubleshooting

### Error: "Firebase Admin credentials not found"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que las variables `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` están definidas

### Error al inicializar Firebase Admin

- Asegúrate de que el `private_key` tiene el formato correcto con `\n` para los saltos de línea
- Verifica que el email corresponde al proyecto correcto
- Regenera una nueva clave privada si es necesario
