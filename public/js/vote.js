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

      // Confirmación de voto
      const optionText = selectedOption.parentElement.querySelector('.option-text').textContent;
      const confirmed = confirm(`¿Estás seguro de votar por "${optionText}"?`);

      if (!confirmed) {
        e.preventDefault();
        return false;
      }
    });
  }
});
