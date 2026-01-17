// Funcionalidad para el panel de administración
function deleteCategory(categoryId, categoryTitle) {
  const confirmed = confirm(`¿Estás seguro de eliminar la categoría "${categoryTitle}"?\n\nEsta acción eliminará todos los votos asociados y no se puede deshacer.`);

  if (confirmed) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/admin/categories/${categoryId}/delete`;

    document.body.appendChild(form);
    form.submit();
  }
}

// Auto-cerrar mensajes de éxito/error después de 5 segundos
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');

  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s';

      setTimeout(() => {
        alert.remove();
      }, 500);
    }, 5000);
  });
});
