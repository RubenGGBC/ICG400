const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Crear categoría desde formulario
// @route   POST /admin/categories/create
// @access  Private/Admin
router.post('/admin/categories/create', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, allowMultipleVotes, isActive } = req.body;

    // Las opciones son fijas y se crean automáticamente
    const FIXED_OPTIONS = ["Gringo", "Marco", "Alex", "Joak"];
    const formattedOptions = FIXED_OPTIONS.map(option => ({
      text: option,
      votes: 0,
      voters: []
    }));

    await Category.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      options: formattedOptions,
      allowMultipleVotes: allowMultipleVotes === 'on',
      isActive: isActive === 'on',
      createdBy: req.user.id
    });

    res.redirect('/admin/categories?success=' + encodeURIComponent('Categoría creada exitosamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/admin/categories/new?error=' + encodeURIComponent('Error al crear la categoría'));
  }
});

// @desc    Actualizar categoría desde formulario
// @route   POST /admin/categories/:id/update
// @access  Private/Admin
router.post('/admin/categories/:id/update', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/admin/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    const { title, description, allowMultipleVotes, isActive } = req.body;

    category.title = title.trim();
    category.description = description ? description.trim() : '';
    category.allowMultipleVotes = allowMultipleVotes === 'on';
    category.isActive = isActive === 'on';

    // Las opciones fijas no se pueden cambiar, solo actualizar los votos existentes
    // Mantener las opciones con sus votos actuales

    await category.save();

    res.redirect(`/admin/categories/${req.params.id}?success=` + encodeURIComponent('Categoría actualizada exitosamente'));
  } catch (error) {
    console.error(error);
    res.redirect(`/admin/categories/${req.params.id}/edit?error=` + encodeURIComponent('Error al actualizar la categoría'));
  }
});

// @desc    Eliminar categoría
// @route   POST /admin/categories/:id/delete
// @access  Private/Admin
router.post('/admin/categories/:id/delete', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/admin/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    // Eliminar votos asociados
    await Vote.deleteMany({ category: req.params.id });

    // Actualizar usuarios
    await User.updateMany(
      { votedCategories: req.params.id },
      { $pull: { votedCategories: req.params.id } }
    );

    await category.deleteOne();

    res.redirect('/admin/categories?success=' + encodeURIComponent('Categoría eliminada exitosamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/admin/categories?error=' + encodeURIComponent('Error al eliminar la categoría'));
  }
});

module.exports = router;
