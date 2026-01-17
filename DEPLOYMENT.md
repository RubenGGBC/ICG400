# Guía de Despliegue en Render

## Preparación

### 1. Configurar MongoDB Atlas

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear una cuenta o iniciar sesión
3. Crear un nuevo cluster (el tier gratuito es suficiente)
4. En "Database Access", crear un usuario con permisos de lectura/escritura
5. En "Network Access", agregar `0.0.0.0/0` para permitir acceso desde cualquier IP
6. Obtener la cadena de conexión:
   - Click en "Connect" en tu cluster
   - Seleccionar "Connect your application"
   - Copiar la cadena de conexión
   - Reemplazar `<password>` con tu contraseña

### 2. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M master
git remote add origin <tu-repositorio-github>
git push -u origin master
```

## Despliegue en Render

### Opción 1: Usando render.yaml (Recomendado)

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New" → "Blueprint"
3. Conectar tu repositorio de GitHub
4. Render detectará automáticamente el archivo `render.yaml`
5. Configurar las variables de entorno:
   - `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas
   - `JWT_SECRET`: Se generará automáticamente
   - `NODE_ENV`: production (ya está configurado)

### Opción 2: Configuración Manual

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New" → "Web Service"
3. Conectar tu repositorio de GitHub
4. Configurar:
   - **Name**: icg400-voting-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Variables de entorno:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<tu-cadena-de-mongodb-atlas>
   JWT_SECRET=<genera-una-clave-secreta-fuerte>
   ```

6. Click en "Create Web Service"

### 3. Verificar el Despliegue

Una vez desplegado, tu aplicación estará disponible en:
```
https://icg400-voting-app.onrender.com
```

Probar el endpoint de salud:
```
GET https://icg400-voting-app.onrender.com/health
```

## Post-Despliegue

### Crear Usuario Administrador

1. Conectarte a tu servidor usando el shell de Render o ejecutar localmente:

```bash
node scripts/createAdmin.js
```

2. O conectarse a MongoDB Atlas directamente y crear el usuario:
   - Username: admin
   - Email: admin@icg400.com
   - Password: (hashear con bcrypt)
   - Role: admin

### Probar la API

1. Registrar un usuario:
```bash
curl -X POST https://tu-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

2. Iniciar sesión:
```bash
curl -X POST https://tu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Monitoreo

- **Logs**: Disponibles en el dashboard de Render
- **Health Check**: Render monitoreará automáticamente `/health`
- **Reinicio Automático**: Render reiniciará el servicio si falla

## Notas Importantes

1. **Plan Gratuito de Render**:
   - El servicio se dormirá después de 15 minutos de inactividad
   - Puede tardar 30-60 segundos en despertar
   - Límite de 750 horas/mes (suficiente para un proyecto)

2. **Plan Gratuito de MongoDB Atlas**:
   - 512 MB de almacenamiento
   - Conexiones compartidas
   - Suficiente para desarrollo y pruebas

3. **Seguridad**:
   - Cambiar las contraseñas por defecto
   - Usar JWT_SECRET fuerte
   - Mantener las credenciales en variables de entorno
   - No commitear el archivo `.env`

## Troubleshooting

### Error de Conexión a MongoDB
- Verificar que la cadena de conexión sea correcta
- Verificar que la contraseña no contenga caracteres especiales sin codificar
- Verificar que la IP 0.0.0.0/0 esté en la whitelist de MongoDB Atlas

### Error 503 Service Unavailable
- El servicio puede estar iniciando (esperar 1-2 minutos)
- Revisar los logs en Render para más detalles

### Variables de Entorno No Funcionan
- Verificar que estén configuradas en Render Dashboard
- Reiniciar el servicio después de cambiar variables

## Actualizar la Aplicación

Simplemente hacer push al repositorio:
```bash
git add .
git commit -m "Update"
git push
```

Render detectará automáticamente los cambios y redesplegará.
