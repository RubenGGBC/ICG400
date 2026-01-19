const Category = require('../models/Category');
const Vote = require('../models/Vote');
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

// @desc    Renderizar página de login
// @route   GET /login
// @access  Public
exports.loginPage = (req, res) => {
  // Solo redirigir si el token existe Y es válido
  if (req.cookies.token && isValidToken(req.cookies.token)) {
    return res.redirect('/dashboard');
  }
  // Si el token existe pero es inválido, limpiarlo
  if (req.cookies.token && !isValidToken(req.cookies.token)) {
    res.clearCookie('token');
  }
  res.render('auth/login', {
    error: req.query.error,
    success: req.query.success
  });
};

// @desc    Renderizar página de registro
// @route   GET /register
// @access  Public
exports.registerPage = (req, res) => {
  // Solo redirigir si el token existe Y es válido
  if (req.cookies.token && isValidToken(req.cookies.token)) {
    return res.redirect('/dashboard');
  }
  // Si el token existe pero es inválido, limpiarlo
  if (req.cookies.token && !isValidToken(req.cookies.token)) {
    res.clearCookie('token');
  }
  res.render('auth/register', {
    error: req.query.error,
    success: req.query.success
  });
};

// @desc    Renderizar dashboard de usuario
// @route   GET /dashboard
// @access  Private
exports.userDashboard = async (req, res) => {
  try {
    // Obtener categorías activas
    const categories = await Category.find({ isActive: true })
      .select('-options.voters')
      .sort('-createdAt');

    // Obtener votos del usuario
    const myVotes = await Vote.find({ user: req.user.id })
      .populate('category', 'title')
      .sort('-votedAt');

    const activeCategories = categories.length;

    res.render('user/dashboard', {
      user: req.user,
      categories,
      myVotes,
      activeCategories,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Error al cargar el dashboard'
    });
  }
};

// @desc    Renderizar lista de categorías (roadmap guiado)
// @route   GET /categories
// @access  Private
exports.categoriesList = async (req, res) => {
  try {
    // Ordenar por createdAt ascendente (más vieja primero, más nueva última)
    const categories = await Category.find({ isActive: true })
      .select('-options.voters')
      .sort('createdAt');

    const user = await User.findById(req.user.id);
    const votedCategories = user.votedCategories.map(id => id.toString());

    res.render('user/voting-roadmap', {
      user: req.user,
      categories,
      votedCategories,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Error al cargar las categorías'
    });
  }
};

// @desc    Renderizar página de votación
// @route   GET /categories/:id
// @access  Private
exports.votePage = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('-options.voters');

    if (!category) {
      return res.redirect('/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    if (!category.isActive) {
      return res.redirect('/categories?error=' + encodeURIComponent('Esta categoría no está activa'));
    }

    // Verificar si el usuario ya votó
    const hasVoted = await Vote.findOne({
      user: req.user.id,
      category: req.params.id
    });

    // Obtener información de progreso
    const allCategories = await Category.find({ isActive: true }).sort('createdAt');
    const user = await User.findById(req.user.id);
    const votedCategoryIds = user.votedCategories.map(id => id.toString());

    // Encontrar la posición actual en el roadmap
    const currentIndex = allCategories.findIndex(cat => cat._id.toString() === req.params.id);
    const totalCategories = allCategories.length;
    const votedCount = votedCategoryIds.length;

    res.render('user/vote', {
      user: req.user,
      category,
      hasVoted: !!hasVoted,
      currentIndex: currentIndex + 1,
      totalCategories,
      votedCount,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/categories?error=' + encodeURIComponent('Error al cargar la categoría'));
  }
};

// @desc    Renderizar dashboard de admin
// @route   GET /admin
// @access  Private/Admin
exports.adminDashboard = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();

    // Top categorías
    const topCategories = await Category.find()
      .select('title options')
      .sort('-options.votes')
      .limit(5);

    const categoriesWithVotes = topCategories.map(cat => {
      const total = cat.options.reduce((sum, opt) => sum + opt.votes, 0);
      return {
        id: cat._id,
        title: cat.title,
        totalVotes: total
      };
    }).sort((a, b) => b.totalVotes - a.totalVotes);

    // Votos recientes
    const recentVotes = await Vote.find()
      .populate('user', 'username')
      .populate('category', 'title')
      .sort('-votedAt')
      .limit(10);

    const stats = {
      totalCategories,
      activeCategories,
      totalUsers,
      totalVotes,
      topCategories: categoriesWithVotes,
      recentVotes
    };

    res.render('admin/dashboard', {
      user: req.user,
      stats,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Error al cargar el dashboard de admin'
    });
  }
};

// @desc    Renderizar lista de categorías para admin
// @route   GET /admin/categories
// @access  Private/Admin
exports.adminCategoriesList = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'username')
      .sort('-createdAt');

    res.render('admin/categories', {
      user: req.user,
      categories,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Error al cargar las categorías'
    });
  }
};

// @desc    Renderizar formulario de nueva categoría
// @route   GET /admin/categories/new
// @access  Private/Admin
exports.newCategoryForm = (req, res) => {
  res.render('admin/category-form', {
    user: req.user,
    category: null,
    success: req.query.success,
    error: req.query.error
  });
};

// @desc    Renderizar formulario de edición de categoría
// @route   GET /admin/categories/:id/edit
// @access  Private/Admin
exports.editCategoryForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/admin/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    res.render('admin/category-form', {
      user: req.user,
      category,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/categories?error=' + encodeURIComponent('Error al cargar la categoría'));
  }
};

// @desc    Renderizar resultados (ceremonia de revelación)
// @route   GET /admin/results
// @access  Private/Admin
exports.resultsPage = async (req, res) => {
  try {
    // Ordenar por createdAt ascendente (más vieja primero, más nueva última)
    const categories = await Category.find()
      .populate('options.voters', 'username email')
      .sort('createdAt');

    res.render('admin/results-ceremony', {
      user: req.user,
      categories,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Error al cargar los resultados'
    });
  }
};

// @desc    Renderizar detalles de categoría
// @route   GET /admin/categories/:id
// @access  Private/Admin
exports.categoryDetails = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('options.voters', 'username email');

    if (!category) {
      return res.redirect('/admin/categories?error=' + encodeURIComponent('Categoría no encontrada'));
    }

    const votes = await Vote.find({ category: req.params.id })
      .populate('user', 'username email')
      .sort('-votedAt');

    const totalVotes = votes.length;

    res.render('admin/category-details', {
      user: req.user,
      category,
      votes,
      totalVotes,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/categories?error=' + encodeURIComponent('Error al cargar los detalles'));
  }
};
