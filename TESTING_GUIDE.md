# Guía de Pruebas - Sistema de Votación ICG400

## Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 3. Crear Usuario Administrador
```bash
npm run create-admin
```

Credenciales del admin:
- **Email**: admin@icg400.com
- **Password**: admin123

## Pruebas de Usuario Normal

### Registro e Inicio de Sesión

1. **Ir a `http://localhost:3000`**
   - Debe redirigir automáticamente a `/login`

2. **Crear cuenta nueva**
   - Click en "Regístrate aquí"
   - Completar formulario:
     ```
     Username: testuser
     Email: test@example.com
     Password: test123
     Confirmar Password: test123
     ```
   - Click en "Registrarse"
   - Debe redirigir a `/dashboard`

3. **Cerrar sesión**
   - Click en "Cerrar Sesión" en el navbar
   - Debe redirigir a `/login`

4. **Iniciar sesión**
   - Email: test@example.com
   - Password: test123
   - Debe redirigir a `/dashboard`

### Dashboard de Usuario

En `/dashboard` debes ver:
- Estadísticas personales (0 votos realizados inicialmente)
- Número de categorías activas
- Lista de categorías disponibles
- Historial de votos vacío

### Votar en Categorías

1. **Ver categorías**
   - Click en "Ver Todas" o ir a `/categories`
   - Debe mostrar lista de categorías activas

2. **Votar**
   - Click en "Votar Ahora" en una categoría
   - Seleccionar una opción
   - Click en "Confirmar Voto"
   - Debe aparecer confirmación
   - Debe redirigir a `/dashboard` con mensaje de éxito
   - El botón debe cambiar a "Ya votaste"

3. **Ver historial**
   - En `/dashboard` ver la sección "Mi Historial de Votos"
   - Debe aparecer el voto con fecha y hora

## Pruebas de Administrador

### Inicio de Sesión como Admin

1. **Cerrar sesión** (si está logueado como usuario)

2. **Login como admin**
   - Email: admin@icg400.com
   - Password: admin123
   - Debe redirigir a `/admin`

### Dashboard de Admin

En `/admin` debes ver:
- 4 tarjetas de estadísticas:
  - Total Categorías
  - Categorías Activas
  - Usuarios Registrados
  - Total de Votos
- Top 5 categorías más votadas
- Votos recientes
- Botones de acción rápida

### Crear Categoría

1. **Click en "Nueva Categoría"** o ir a `/admin/categories/new`

2. **Llenar formulario**:
   ```
   Título: Mejor Jugador 2024
   Descripción: Vota por tu jugador favorito del año
   Opciones:
   - Cristiano Ronaldo
   - Lionel Messi
   - Neymar Jr
   - Kylian Mbappé
   ✓ Categoría activa
   ☐ Permitir votos múltiples
   ```

3. **Agregar más opciones**
   - Click en "Agregar Opción"
   - Escribir nueva opción
   - Click en "Eliminar" para quitar opciones

4. **Crear categoría**
   - Click en "Crear Categoría"
   - Debe redirigir a `/admin/categories` con mensaje de éxito

### Gestionar Categorías

En `/admin/categories` puedes:
- Ver todas las categorías en tabla
- Ver estado (Activa/Inactiva)
- Ver número de opciones y votos
- **Ver detalles** (👁️): Ver información completa
- **Editar** (✏️): Modificar categoría
- **Eliminar** (🗑️): Borrar categoría (con confirmación)

### Ver Resultados

1. **Ir a `/admin/results`**
   - Ver todas las categorías con resultados
   - Barras de progreso para cada opción
   - Medallas para top 3
   - Porcentajes calculados
   - Total de votos por categoría

2. **Ver detalles de categoría**
   - Click en "Ver Detalles Completos"
   - Ver lista completa de votantes
   - Ver historial de votos con timestamps

### Gestionar Usuarios

1. **Ir a `/admin/users`**
   - Ver tabla de todos los usuarios
   - Ver roles y número de votos
   - Cambiar roles (Hacer Admin / Quitar Admin)
   - Ver estadísticas de usuarios

## Escenarios de Prueba

### Escenario 1: Flujo Completo de Usuario
1. Registrarse
2. Ver categorías disponibles
3. Votar en 2-3 categorías
4. Ver historial en dashboard
5. Intentar votar de nuevo (debe estar bloqueado)

### Escenario 2: Flujo Completo de Admin
1. Iniciar sesión como admin
2. Crear 3 categorías diferentes
3. Editar una categoría (agregar opciones)
4. Desactivar una categoría
5. Ver resultados actualizados
6. Eliminar una categoría

### Escenario 3: Múltiples Usuarios Votando
1. Crear 3 usuarios diferentes
2. Cada usuario vota en las mismas categorías
3. Como admin, ver resultados actualizados
4. Verificar que los porcentajes se calculan correctamente

### Escenario 4: Votos Múltiples (si está habilitado)
1. Crear categoría con "Permitir votos múltiples"
2. Como usuario, votar en la categoría
3. Intentar votar de nuevo en diferente opción (debe permitir)
4. Intentar votar en la misma opción (debe bloquear)

## Validaciones a Probar

### Formulario de Registro
- ❌ Username vacío
- ❌ Email inválido
- ❌ Password < 6 caracteres
- ❌ Passwords no coinciden
- ❌ Email duplicado
- ❌ Username duplicado

### Formulario de Login
- ❌ Email incorrecto
- ❌ Password incorrecta
- ❌ Campos vacíos

### Formulario de Categoría
- ❌ Título vacío
- ❌ Menos de 2 opciones
- ❌ Opciones vacías
- ✅ Mínimo 2 opciones válidas

### Permisos
- ❌ Acceder a `/admin` sin ser admin
- ❌ Acceder a `/dashboard` sin login
- ❌ Usuario normal intentando crear categorías (vía API)

## API REST (Opcional)

Si prefieres probar con la API JSON:

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apiuser",
    "email": "api@example.com",
    "password": "api123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@example.com",
    "password": "api123"
  }'
```

Guarda el `token` de la respuesta y úsalo en las siguientes peticiones:

### Ver Categorías
```bash
curl http://localhost:3000/api/votes/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Votar
```bash
curl -X POST http://localhost:3000/api/votes/categories/CATEGORY_ID/vote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "optionId": "OPTION_ID"
  }'
```

## Problemas Comunes

### Error: Cannot connect to MongoDB
- Verificar que la URI de MongoDB Atlas sea correcta en `.env`
- Verificar conexión a internet
- Verificar que la IP esté en whitelist de MongoDB Atlas

### Error: Token inválido
- Limpiar cookies del navegador
- Cerrar sesión y volver a iniciar

### Error: Puerto 3000 en uso
- Cambiar `PORT` en `.env` a otro número (ej: 3001)
- O cerrar la aplicación que usa el puerto 3000

### Las vistas no cargan estilos
- Verificar que exista `/public/css/style.css`
- Verificar que el servidor esté sirviendo archivos estáticos

## Checklist Final

Antes de desplegar, verificar:

- [ ] Login funciona
- [ ] Registro funciona
- [ ] Usuario puede votar
- [ ] Usuario puede ver su historial
- [ ] Admin puede crear categorías
- [ ] Admin puede editar categorías
- [ ] Admin puede eliminar categorías
- [ ] Admin puede ver resultados
- [ ] Admin puede gestionar usuarios
- [ ] Los votos se cuentan correctamente
- [ ] Los porcentajes se calculan bien
- [ ] No se puede votar dos veces (si está deshabilitado)
- [ ] Los mensajes de éxito/error aparecen
- [ ] La aplicación es responsive
- [ ] Todos los botones funcionan
- [ ] Las redirecciones funcionan correctamente

## Datos de Prueba Sugeridos

### Categorías de Ejemplo
1. **Mejor Película 2024**
   - Oppenheimer
   - Barbie
   - Killers of the Flower Moon
   - Poor Things

2. **Mejor Serie de TV**
   - The Last of Us
   - Succession
   - The Bear
   - Wednesday

3. **Comida Favorita**
   - Pizza
   - Hamburguesa
   - Sushi
   - Tacos

### Usuarios de Prueba
- admin@icg400.com / admin123 (Admin)
- user1@test.com / user123
- user2@test.com / user123
- user3@test.com / user123

¡Buena suerte con las pruebas!
