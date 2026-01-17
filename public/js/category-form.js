// Manejo del formulario de categorías
document.addEventListener('DOMContentLoaded', function() {
  // Validación del formulario
  const categoryForm = document.querySelector('.category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function(e) {
      const title = document.getElementById('title').value.trim();

      if (!title) {
        e.preventDefault();
        alert('El título es requerido');
        return false;
      }

      // Las opciones son fijas y se crean automáticamente en el backend
      // No se requiere validación de opciones
    });
  }
});
