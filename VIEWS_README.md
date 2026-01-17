# Guía de Vistas del Sistema de Votación

## Vistas Creadas

### Autenticación
- **`/login`** - Página de inicio de sesión
- **`/register`** - Página de registro de nuevos usuarios

### Usuario (requiere autenticación)
- **`/dashboard`** - Dashboard del usuario con resumen de votos
- **`/categories`** - Lista de todas las categorías activas
- **`/categories/:id`** - Página para votar en una categoría específica

### Administrador (requiere rol admin)
- **`/admin`** - Dashboard del administrador con estadísticas generales
- **`/admin/categories`** - Gestión de categorías (tabla con todas las categorías)
- **`/admin/categories/new`** - Formulario para crear nueva categoría
- **`/admin/categories/:id`** - Detalles completos de una categoría con votantes
- **`/admin/categories/:id/edit`** - Formulario para editar categoría
- **`/admin/results`** - Visualización de resultados de todas las categorías
- **`/admin/users`** - Gestión de usuarios y roles

## Flujo de Usuario

### Usuario Normal
1. Visita `/` → Redirige a `/login`
2. Se registra en `/register` o inicia sesión en `/login`
3. Accede a su dashboard `/dashboard`
4. Ve las categorías disponibles en `/categories`
5. Vota en una categoría específica en `/categories/:id`
6. Puede ver su historial en `/dashboard`

### Administrador
1. Inicia sesión en `/login` con cuenta admin
2. Accede al dashboard admin `/admin`
3. Puede:
   - Crear categorías en `/admin/categories/new`
   - Ver y gestionar todas las categorías en `/admin/categories`
   - Ver resultados detallados en `/admin/results`
   - Ver detalles de una categoría en `/admin/categories/:id`
   - Editar categorías en `/admin/categories/:id/edit`
   - Gestionar usuarios en `/admin/users`

## Características de las Vistas

### Diseño Responsive
- Todas las vistas son responsive y se adaptan a móviles
- Grid system flexible para categorías y estadísticas
- Tablas con scroll horizontal en móviles

### Estilos
- Colores modernos con tema principal morado/índigo
- Efectos hover en tarjetas y botones
- Animaciones suaves de transición
- Badges para estados (activo, inactivo, admin)
- Alertas con auto-cierre después de 5 segundos

### JavaScript Interactivo
- **auth.js**: Validación de formularios de login/registro
- **vote.js**: Confirmación de votos con modal
- **category-form.js**: Agregar/eliminar opciones dinámicamente
- **admin.js**: Confirmación de eliminación de categorías
- **main.js**: Funcionalidad general (alertas, confirmaciones)

### Componentes Reutilizables
- **navbar.ejs**: Barra de navegación adaptable según rol
- **message.ejs**: Sistema de mensajes de éxito/error
- **layout.ejs**: Layout base (actualmente no usado, puede implementarse)

## Funcionalidades Destacadas

### Dashboard de Usuario
- Estadísticas personales (votos realizados, pendientes)
- Vista previa de categorías activas
- Historial de votos con fechas
- Acceso rápido a votación

### Panel de Admin
- Estadísticas generales del sistema
- Top 5 categorías más votadas
- Votos recientes en tiempo real
- Gestión completa de categorías y usuarios

### Página de Votación
- Opciones visuales con números
- Muestra cantidad de votos por opción
- Confirmación antes de votar
- Validación de voto único (si está configurado)

### Resultados
- Visualización con barras de progreso
- Medallas (🥇🥈🥉) para top 3
- Porcentajes calculados en tiempo real
- Lista expandible de votantes por opción

## API vs Vistas

El sistema mantiene dos interfaces:

### Vistas Web (HTML/EJS)
- Rutas directas: `/login`, `/dashboard`, `/admin`, etc.
- Formularios HTML tradicionales con POST
- Navegación con cookies httpOnly
- Renderizado del lado del servidor

### API REST (JSON)
- Rutas con prefijo `/api/`: `/api/auth`, `/api/votes`, `/api/admin`
- Responses en JSON
- Token JWT en headers o cookies
- Para integración con apps móviles o SPA

Ambas interfaces comparten:
- Los mismos modelos de datos
- La misma lógica de negocio
- El mismo sistema de autenticación
- La misma base de datos

## Seguridad

- Cookies httpOnly para tokens JWT
- CSRF protection en formularios POST
- Validación de roles en middleware
- Redirección automática si no autenticado
- Confirmaciones para acciones destructivas
- Sanitización de inputs del lado del servidor

## Personalización

Para personalizar colores, edita las variables CSS en `/public/css/style.css`:

```css
:root {
  --primary-color: #4f46e5;     /* Color principal */
  --success-color: #10b981;     /* Color de éxito */
  --danger-color: #ef4444;      /* Color de peligro */
  --background: #f9fafb;        /* Fondo de página */
  --surface: #ffffff;           /* Fondo de tarjetas */
}
```

## Próximos Pasos

Posibles mejoras futuras:
- Gráficos interactivos con Chart.js
- Exportar resultados a PDF/Excel
- Filtros y búsqueda en tablas
- Paginación para listas largas
- Dark mode toggle
- Notificaciones en tiempo real con WebSocket
- Perfil de usuario editable
- Recuperación de contraseña
