# Inicio Rápido

## Instalación y Ejecución Local

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
El archivo `.env` ya está configurado con la conexión a MongoDB Atlas:
```env
PORT=3000
MONGODB_URI=mongodb+srv://ruferop_db_user:evPfa9DvFegphQFb@icg.hsuynbp.mongodb.net/votingapp?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
NODE_ENV=development
```

**IMPORTANTE**: Cambia `JWT_SECRET` por una clave más segura antes de subir a producción.

### 3. Iniciar el Servidor

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### 4. Crear Usuario Administrador
```bash
npm run create-admin
```

Esto creará un usuario:
- **Email**: admin@icg400.com
- **Password**: admin123
- **Username**: admin

### 5. Probar la API

#### Registrar un usuario normal
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

#### Login como admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@icg400.com",
    "password": "admin123"
  }'
```

Guarda el token de la respuesta para usarlo en las siguientes peticiones.

#### Crear una categoría (requiere token de admin)
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "title": "Mejor Jugador 2024",
    "description": "Vota por tu jugador favorito",
    "options": ["Cristiano Ronaldo", "Lionel Messi", "Neymar Jr", "Kylian Mbappé"],
    "allowMultipleVotes": false
  }'
```

#### Ver categorías disponibles (como usuario normal)
```bash
curl http://localhost:3000/api/votes/categories \
  -H "Authorization: Bearer TU_TOKEN_DE_USUARIO"
```

#### Votar en una categoría
```bash
curl -X POST http://localhost:3000/api/votes/categories/CATEGORY_ID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_DE_USUARIO" \
  -d '{
    "optionId": "OPTION_ID"
  }'
```

## Estructura de Carpetas

```
icg400/
├── src/
│   ├── config/         # Configuraciones (DB, Swagger)
│   ├── controllers/    # Lógica de negocio
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de la API
│   └── server.js       # Punto de entrada
├── scripts/            # Scripts de utilidad
├── public/             # Archivos estáticos
├── views/              # Vistas EJS (opcional)
└── docs/               # Documentación
```

## Próximos Pasos

1. **Desarrollo**:
   - Revisar `API_TESTING.md` para ver todos los endpoints
   - Personalizar las categorías de votación
   - Agregar validaciones adicionales según necesites

2. **Producción**:
   - Seguir la guía en `DEPLOYMENT.md` para subir a Render
   - Cambiar el `JWT_SECRET` a uno seguro
   - Cambiar las contraseñas por defecto

3. **Frontend** (opcional):
   - Puedes crear un frontend en React, Vue, o HTML simple
   - Consumir la API desde el frontend
   - Los archivos estáticos van en `/public`

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar en modo desarrollo

# Producción
npm start                # Iniciar servidor

# Utilidades
npm run create-admin     # Crear usuario administrador

# Otros
npm install              # Instalar dependencias
```

## Soporte

Para más información, consulta:
- `README.md` - Documentación completa
- `API_TESTING.md` - Guía de pruebas de API
- `DEPLOYMENT.md` - Guía de despliegue en Render
