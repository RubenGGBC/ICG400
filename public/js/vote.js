// Manejo de la página de votación
document.addEventListener('DOMContentLoaded', function() {
  const voteForm = document.querySelector('.vote-form');

  if (voteForm) {
    voteForm.addEventListener('submit', function(e) {
      const selectedOption = document.querySelector('input[name="optionText"]:checked');

      if (!selectedOption) {
        e.preventDefault();
        alert('Por favor selecciona una opción antes de votar');
        return false;
      }

      // Enviar directamente sin confirmación
    });
  }
});
