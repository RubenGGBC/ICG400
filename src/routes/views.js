const express = require('express');
const router = express.Router();
const {
  loginPage,
  registerPage,
  userDashboard,
  categoriesList,
  votePage,
  adminDashboard,
  adminCategoriesList,
  newCategoryForm,
  editCategoryForm,
  resultsPage,
  categoryDetails
} = require('../controllers/viewController');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper para verificar si el token es válido
const isValidToken = (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

// Rutas públicas
router.get('/', (req, res) => {
  // Solo redirigir a dashboard si el token existe Y es válido
  if (req.cookies.token && isValidToken(req.cookies.token)) {
    return res.redirect('/dashboard');
  }
  // Si hay token inválido, limpiarlo
  if (req.cookies.token && !isValidToken(req.cookies.token)) {
    res.clearCookie('token');
  }
  res.redirect('/login');
});

router.get('/login', loginPage);
router.get('/register', registerPage);

// Rutas de usuario (requieren autenticación)
router.get('/dashboard', protect, userDashboard);
router.get('/categories', protect, categoriesList);
router.get('/categories/:id', protect, votePage);

// Rutas de admin (requieren autenticación y rol admin)
router.get('/admin', protect, authorize('admin'), adminDashboard);
router.get('/admin/categories', protect, authorize('admin'), adminCategoriesList);
router.get('/admin/categories/new', protect, authorize('admin'), newCategoryForm);
router.get('/admin/categories/:id', protect, authorize('admin'), categoryDetails);
router.get('/admin/categories/:id/edit', protect, authorize('admin'), editCategoryForm);
router.get('/admin/results', protect, authorize('admin'), resultsPage);
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('votedCategories', 'title')
      .sort('-createdAt');

    res.render('admin/users', {
      user: req.user,
      users,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin?error=' + encodeURIComponent('Error al cargar usuarios'));
  }
});

module.exports = router;
