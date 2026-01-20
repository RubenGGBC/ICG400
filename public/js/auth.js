// Validación de formularios de autenticación
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.querySelector('form[action="/register"]');
  const loginForm = document.querySelector('form[action="/login"]');

  // Validación del registro
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (username.length < 3) {
        e.preventDefault();
        alert('El nombre de usuario debe tener al menos 3 caracteres');
        return false;
      }

      if (password !== confirmPassword) {
        e.preventDefault();
        alert('Las contraseñas no coinciden');
        return false;
      }

      if (password.length < 6) {
        e.preventDefault();
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    });
  }

  // Validación del login
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (!username || !password) {
        e.preventDefault();
        alert('Por favor completa todos los campos');
        return false;
      }
    });
  }
});
