// JavaScript principal para la aplicación
console.log('Sistema de Votación ICG400 cargado');

// Auto-cerrar mensajes de alerta
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

  // Confirmar acciones destructivas
  const dangerButtons = document.querySelectorAll('.btn-danger');

  dangerButtons.forEach(button => {
    if (button.type === 'button' && !button.onclick) {
      button.addEventListener('click', function(e) {
        const confirmed = confirm('¿Estás seguro de realizar esta acción?');
        if (!confirmed) {
          e.preventDefault();
          return false;
        }
      });
    }
  });
});
