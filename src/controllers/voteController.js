const Category = require('../models/Category');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { isProposalPeriod } = require('../config/dates');

// @desc    Obtener todas las categorías activas
// @route   GET /api/votes/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
      status: { $ne: 'rejected' }
    })
      .select('-options.voters')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/votes/categories/:id
// @access  Private
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('-options.voters');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si el usuario ya votó en esta categoría
    const hasVoted = await Vote.findOne({
      user: req.user.id,
      category: req.params.id
    });

    res.status(200).json({
      success: true,
      data: category,
      hasVoted: !!hasVoted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Votar en una categoría
// @route   POST /api/votes/categories/:id/vote
// @access  Private
exports.vote = async (req, res, next) => {
  try {
    // Verificar que estamos dentro del período de votación
    if (!isProposalPeriod()) {
      return res.status(400).json({
        success: false,
        message: 'El período de votación ha cerrado. Los resultados estarán disponibles pronto.'
      });
    }

    const { optionText } = req.body;

    // Verificar que la categoría existe
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Esta categoría no está activa para votar'
      });
    }

    // Verificar que sea categoría de admin o propuesta aprobada
    if (category.isUserProposed && category.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Esta propuesta no está disponible para votar'
      });
    }

    // Verificar que la opción existe en la categoría (buscar por texto)
    const option = category.options.find(opt => opt.text === optionText);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Opción no encontrada'
      });
    }

    // Verificar si el usuario ya votó en esta categoría
    const existingVote = await Vote.findOne({
      user: req.user._id,
      category: req.params.id
    });

    if (existingVote && !category.allowMultipleVotes) {
      return res.status(400).json({
        success: false,
        message: 'Ya has votado en esta categoría'
      });
    }

    // Si permite votos múltiples pero ya votó por esta opción
    if (existingVote && category.allowMultipleVotes) {
      const alreadyVotedThisOption = await Vote.findOne({
        user: req.user._id,
        category: req.params.id,
        option: optionText
      });

      if (alreadyVotedThisOption) {
        return res.status(400).json({
          success: false,
          message: 'Ya has votado por esta opción'
        });
      }
    }

    // Registrar el voto
    await Vote.create({
      user: req.user._id,
      category: req.params.id,
      option: optionText
    });

    // Actualizar contador de votos y lista de votantes en la opción
    option.votes += 1;
    option.voters.push(req.user._id);
    await category.save();

    // Actualizar lista de categorías votadas del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { votedCategories: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Voto registrado exitosamente',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener historial de votos del usuario
// @route   GET /api/votes/my-votes
// @access  Private
exports.getMyVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find({ user: req.user._id })
      .populate('category', 'title description')
      .sort('-votedAt');

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votes
    });
  } catch (error) {
    next(error);
  }
};
