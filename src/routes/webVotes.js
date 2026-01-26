const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isVotingPeriod } = require('../config/dates');

// @desc    Procesar voto desde formulario
// @route   POST /categories/:id/vote
// @access  Private
router.post('/categories/:id/vote', protect, async (req, res) => {
  try {
    // Verificar que estamos dentro del período de votación
    if (!isVotingPeriod()) {
      return res.redirect('/categories?error=' + encodeURIComponent('El período de votación ha cerrado. Los resultados estarán disponibles pronto.'));
    }

    const { optionText } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/categories?error=' + encodeURIComponent('Incógnita no encontrada'));
    }

    // Solo permitir votar en categorías aprobadas o categorías normales de admin
    if (!category.isActive || (category.isUserProposed && category.status !== 'approved')) {
      return res.redirect('/categories?error=' + encodeURIComponent('Esta incógnita no está disponible para votar'));
    }

    // Buscar la opción por texto
    const option = category.options.find(opt => opt.text === optionText);

    if (!option) {
      return res.redirect(`/categories/${req.params.id}?error=` + encodeURIComponent('Opción no encontrada'));
    }

    // Verificar si ya votó
    const existingVote = await Vote.findOne({
      user: req.user._id,
      category: req.params.id
    });

    if (existingVote && !category.allowMultipleVotes) {
      return res.redirect('/categories?error=' + encodeURIComponent('Ya has votado en esta categoría'));
    }

    if (existingVote && category.allowMultipleVotes) {
      const alreadyVotedThisOption = await Vote.findOne({
        user: req.user._id,
        category: req.params.id,
        option: optionText
      });

      if (alreadyVotedThisOption) {
        return res.redirect(`/categories/${req.params.id}?error=` + encodeURIComponent('Ya votaste por esta opción'));
      }
    }

    // Registrar el voto
    await Vote.create({
      user: req.user._id,
      category: req.params.id,
      option: optionText
    });

    // Encontrar el índice de la opción
    const optionIndex = category.options.findIndex(opt => opt.text === optionText);

    // Actualizar contador y votantes usando operadores atómicos (evita problemas de validación)
    await Category.updateOne(
      { _id: req.params.id },
      {
        $inc: { [`options.${optionIndex}.votes`]: 1 },
        $push: { [`options.${optionIndex}.voters`]: req.user._id }
      }
    );

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { votedCategories: req.params.id } },
      { new: true }
    );

    // Buscar la siguiente categoría pendiente de votar (ordenadas por createdAt ascendente)
    // Solo categorías activas y no rechazadas
    const allCategories = await Category.find({
      isActive: true,
      status: { $ne: 'rejected' }
    }).sort('createdAt');
    const votedCategoryIds = updatedUser.votedCategories.map(id => id.toString());

    const nextCategory = allCategories.find(cat => !votedCategoryIds.includes(cat._id.toString()));

    if (nextCategory) {
      // Redirigir a la siguiente categoría pendiente
      res.redirect(`/categories/${nextCategory._id}?success=` + encodeURIComponent('¡Voto registrado! Continúa con la siguiente categoría.'));
    } else {
      // Todas las categorías votadas, redirigir a página de completado
      res.redirect('/categories?success=' + encodeURIComponent('¡Felicidades! Has completado todas las votaciones.'));
    }
  } catch (error) {
    console.error(error);
    res.redirect('/categories?error=' + encodeURIComponent('Error al procesar el voto'));
  }
});

module.exports = router;
