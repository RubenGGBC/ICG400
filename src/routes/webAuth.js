const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendTokenResponse } = require('../middleware/auth');

// @desc    Procesar login desde formulario
// @route   POST /login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.redirect('/login?error=' + encodeURIComponent('Por favor completa todos los campos'));
    }

    // username es el _id
    const user = await User.findById(username);

    if (!user) {
      return res.redirect('/login?error=' + encodeURIComponent('Credenciales inválidas'));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.redirect('/login?error=' + encodeURIComponent('Credenciales inválidas'));
    }

    // Establecer cookie y redirigir
    const token = require('../middleware/auth').getSignedJwtToken(user._id);

    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Redirigir según el rol
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/login?error=' + encodeURIComponent('Error al iniciar sesión'));
  }
});

// @desc    Procesar registro desde formulario
// @route   POST /register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validaciones
    if (!username || !password || !confirmPassword) {
      return res.redirect('/register?error=' + encodeURIComponent('Por favor completa todos los campos'));
    }

    if (password !== confirmPassword) {
      return res.redirect('/register?error=' + encodeURIComponent('Las contraseñas no coinciden'));
    }

    if (password.length < 6) {
      return res.redirect('/register?error=' + encodeURIComponent('La contraseña debe tener al menos 6 caracteres'));
    }

    if (username.length < 3) {
      return res.redirect('/register?error=' + encodeURIComponent('El usuario debe tener al menos 3 caracteres'));
    }

    // Verificar si el usuario ya existe (username es el _id)
    const userExists = await User.findById(username);

    if (userExists) {
      return res.redirect('/register?error=' + encodeURIComponent('El nombre de usuario ya existe'));
    }

    // Crear usuario
    const user = await User.create({
      _id: username,
      password
    });

    // Establecer cookie y redirigir
    const token = require('../middleware/auth').getSignedJwtToken(user._id);

    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.redirect('/dashboard?success=' + encodeURIComponent('Cuenta creada exitosamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/register?error=' + encodeURIComponent('Error al crear la cuenta'));
  }
});

// @desc    Logout
// @route   GET /logout
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.redirect('/login?success=' + encodeURIComponent('Sesión cerrada exitosamente'));
});

module.exports = router;
