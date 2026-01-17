# Guía de Pruebas de API

## Configuración Inicial

Base URL local: `http://localhost:3000`
Base URL producción: `https://tu-app.onrender.com`

## 1. Autenticación

### Registrar Usuario
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario1",
  "email": "usuario1@example.com",
  "password": "password123"
}
```

Respuesta exitosa:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123...",
    "username": "usuario1",
    "email": "usuario1@example.com",
    "role": "user"
  }
}
```

### Iniciar Sesión
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario1@example.com",
  "password": "password123"
}
```

### Obtener Perfil
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

### Cerrar Sesión
```bash
GET /api/auth/logout
Authorization: Bearer {token}
```

## 2. Votación (Usuarios)

Todas las rutas requieren autenticación.

### Obtener Categorías Activas
```bash
GET /api/votes/categories
Authorization: Bearer {token}
```

### Obtener Categoría Específica
```bash
GET /api/votes/categories/{categoryId}
Authorization: Bearer {token}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Mejor Jugador",
    "description": "Vota por el mejor jugador",
    "options": [
      {
        "_id": "...",
        "text": "Jugador 1",
        "votes": 5
      }
    ]
  },
  "hasVoted": false
}
```

### Votar
```bash
POST /api/votes/categories/{categoryId}/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "optionId": "option_id_aqui"
}
```

### Ver Mis Votos
```bash
GET /api/votes/my-votes
Authorization: Bearer {token}
```

## 3. Administración

Todas las rutas requieren rol de administrador.

### Crear Categoría
```bash
POST /api/admin/categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Mejor Jugador 2024",
  "description": "Vota por tu jugador favorito",
  "options": ["Jugador A", "Jugador B", "Jugador C"],
  "allowMultipleVotes": false
}
```

O con opciones más detalladas:
```json
{
  "title": "Mejor Jugador 2024",
  "description": "Vota por tu jugador favorito",
  "options": [
    { "text": "Jugador A" },
    { "text": "Jugador B" },
    { "text": "Jugador C" }
  ],
  "allowMultipleVotes": false
}
```

### Obtener Todas las Categorías (Admin)
```bash
GET /api/admin/categories
Authorization: Bearer {admin_token}
```

### Obtener Detalles de Categoría
```bash
GET /api/admin/categories/{categoryId}
Authorization: Bearer {admin_token}
```

Respuesta incluye votantes:
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "...",
      "title": "...",
      "options": [
        {
          "text": "Opción 1",
          "votes": 3,
          "voters": [
            {
              "_id": "...",
              "username": "usuario1",
              "email": "usuario1@example.com"
            }
          ]
        }
      ]
    },
    "votes": [...],
    "totalVotes": 5
  }
}
```

### Actualizar Categoría
```bash
PUT /api/admin/categories/{categoryId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Nuevo Título",
  "description": "Nueva descripción",
  "isActive": true,
  "allowMultipleVotes": false,
  "options": ["Opción 1", "Opción 2", "Opción 3"]
}
```

### Eliminar Categoría
```bash
DELETE /api/admin/categories/{categoryId}
Authorization: Bearer {admin_token}
```

### Obtener Estadísticas
```bash
GET /api/admin/stats
Authorization: Bearer {admin_token}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "totalCategories": 10,
    "activeCategories": 8,
    "totalUsers": 50,
    "totalVotes": 150,
    "topCategories": [
      {
        "id": "...",
        "title": "...",
        "totalVotes": 45
      }
    ],
    "recentVotes": [...]
  }
}
```

### Obtener Usuarios
```bash
GET /api/admin/users
Authorization: Bearer {admin_token}
```

### Cambiar Rol de Usuario
```bash
PUT /api/admin/users/{userId}/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "admin"
}
```

## Ejemplos con cURL

### Registrar y Votar (Flujo Completo)

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'

# Guardar el token de la respuesta en una variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Ver categorías disponibles
curl http://localhost:3000/api/votes/categories \
  -H "Authorization: Bearer $TOKEN"

# 3. Votar en una categoría
curl -X POST http://localhost:3000/api/votes/categories/CATEGORY_ID/vote \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "optionId": "OPTION_ID"
  }'
```

## Códigos de Estado HTTP

- `200` - Éxito
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado (token inválido o no presente)
- `403` - Prohibido (sin permisos)
- `404` - No encontrado
- `500` - Error del servidor

## Notas

1. El token JWT se puede enviar de dos formas:
   - Header: `Authorization: Bearer {token}`
   - Cookie: `token={token}`

2. Los tokens expiran en 30 días

3. Para pruebas, usar herramientas como:
   - cURL (línea de comandos)
   - Postman
   - Insomnia
   - Thunder Client (VS Code)

4. Formato de errores:
```json
{
  "success": false,
  "message": "Mensaje de error descriptivo"
}
```
