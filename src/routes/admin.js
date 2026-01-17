const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategoryDetails,
  updateCategory,
  deleteCategory,
  getStats,
  getUsers,
  changeUserRole
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(protect);
router.use(authorize('admin'));

// Rutas de categorías
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

router.route('/categories/:id')
  .get(getCategoryDetails)
  .put(updateCategory)
  .delete(deleteCategory);

// Rutas de estadísticas
router.get('/stats', getStats);

// Rutas de usuarios
router.get('/users', getUsers);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
