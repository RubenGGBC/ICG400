const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Procesar voto desde formulario
// @route   POST /categories/:id/vote
// @access  Private
router.post('/categories/:id/vote', protect, async (req, res) => {
  try {
    const { optionText } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    if (!category.isActive) {
      return res.redirect('/categories?error=' + encodeURIComponent('Esta categoría no está activa'));
    }

    // Buscar la opción por texto
    const option = category.options.find(opt => opt.text === optionText);

    if (!option) {
      return res.redirect(`/categories/${req.params.id}?error=` + encodeURIComponent('Opción no encontrada'));
    }

    // Verificar si ya votó
    const existingVote = await Vote.findOne({
      user: req.user.id,
      category: req.params.id
    });

    if (existingVote && !category.allowMultipleVotes) {
      return res.redirect('/categories?error=' + encodeURIComponent('Ya has votado en esta categoría'));
    }

    if (existingVote && category.allowMultipleVotes) {
      const alreadyVotedThisOption = await Vote.findOne({
        user: req.user.id,
        category: req.params.id,
        option: optionText
      });

      if (alreadyVotedThisOption) {
        return res.redirect(`/categories/${req.params.id}?error=` + encodeURIComponent('Ya votaste por esta opción'));
      }
    }

    // Registrar el voto
    await Vote.create({
      user: req.user.id,
      category: req.params.id,
      option: optionText
    });

    // Actualizar contador
    option.votes += 1;
    option.voters.push(req.user.id);
    await category.save();

    // Actualizar usuario
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { votedCategories: req.params.id }
    });

    res.redirect('/dashboard?success=' + encodeURIComponent('Voto registrado exitosamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/categories?error=' + encodeURIComponent('Error al procesar el voto'));
  }
});

module.exports = router;
