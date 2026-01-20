const Category = require('../models/Category');
const Vote = require('../models/Vote');
const User = require('../models/User');

// @desc    Crear nueva categoría
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { title, description, allowMultipleVotes } = req.body;

    // Opciones fijas para todas las categorías
    const FIXED_OPTIONS = ["Gringo", "Marco", "Alex", "Joak"];
    const formattedOptions = FIXED_OPTIONS.map(option => ({
      text: option,
      votes: 0,
      voters: []
    }));

    const category = await Category.create({
      title,
      description,
      options: formattedOptions,
      allowMultipleVotes: allowMultipleVotes || false,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todas las categorías (admin)
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'username')
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

// @desc    Obtener una categoría con todos los detalles (admin)
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
exports.getCategoryDetails = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('options.voters', 'username');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Incógnita no encontrada'
      });
    }

    // Obtener todos los votos de esta categoría
    const votes = await Vote.find({ category: req.params.id })
      .populate('user', 'username')
      .sort('-votedAt');

    res.status(200).json({
      success: true,
      data: {
        category,
        votes,
        totalVotes: votes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar categoría
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Incógnita no encontrada'
      });
    }

    const { title, description, isActive, allowMultipleVotes } = req.body;

    // Actualizar campos básicos
    if (title) category.title = title;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (allowMultipleVotes !== undefined) category.allowMultipleVotes = allowMultipleVotes;

    // Las opciones son fijas y no se pueden cambiar
    // Solo se mantienen con sus votos actuales

    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar categoría
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Incógnita no encontrada'
      });
    }

    // Eliminar todos los votos asociados a esta incógnita
    await Vote.deleteMany({ category: req.params.id });

    // Eliminar la incógnita de las listas de votedCategories de los usuarios
    await User.updateMany(
      { votedCategories: req.params.id },
      { $pull: { votedCategories: req.params.id } }
    );

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Incógnita eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadísticas generales
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();

    // Top 5 categorías más votadas
    const topCategories = await Category.find()
      .select('title options')
      .sort('-options.votes')
      .limit(5);

    const categoriesWithVotes = topCategories.map(cat => {
      const totalVotes = cat.options.reduce((sum, opt) => sum + opt.votes, 0);
      return {
        id: cat._id,
        title: cat.title,
        totalVotes
      };
    }).sort((a, b) => b.totalVotes - a.totalVotes);

    // Votos recientes
    const recentVotes = await Vote.find()
      .populate('user', 'username')
      .populate('category', 'title')
      .sort('-votedAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        totalUsers,
        totalVotes,
        topCategories: categoriesWithVotes,
        recentVotes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('votedCategories', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar rol de usuario
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
