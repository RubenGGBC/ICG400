const Category = require('../models/Category');
const { isProposalPeriod, getProposalPeriodInfo } = require('../config/dates');

// Opciones fijas
const FIXED_OPTIONS = ["Gringo", "Marco", "Alex", "Joak"];

// @desc    Renderizar página de nueva propuesta
// @route   GET /proposals/new
// @access  Private
exports.newProposalPage = async (req, res) => {
  try {
    const proposalPeriod = getProposalPeriodInfo();

    res.render('user/propose', {
      user: req.user,
      proposalPeriod,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Error al cargar la página'));
  }
};

// @desc    Crear nueva propuesta
// @route   POST /proposals/create
// @access  Private
exports.createProposal = async (req, res) => {
  try {
    // Verificar período de propuestas
    if (!isProposalPeriod()) {
      return res.redirect('/proposals/new?error=' + encodeURIComponent('El período de propuestas no está activo'));
    }

    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.redirect('/proposals/new?error=' + encodeURIComponent('El título es requerido'));
    }

    if (title.length > 100) {
      return res.redirect('/proposals/new?error=' + encodeURIComponent('El título no puede superar 100 caracteres'));
    }

    if (description && description.length > 300) {
      return res.redirect('/proposals/new?error=' + encodeURIComponent('La descripción no puede superar 300 caracteres'));
    }

    // Crear las opciones fijas
    const formattedOptions = FIXED_OPTIONS.map(option => ({
      text: option,
      votes: 0,
      voters: []
    }));

    // Crear la propuesta
    await Category.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      options: formattedOptions,
      isActive: false, // No activa hasta que se apruebe
      allowMultipleVotes: false,
      createdBy: req.user._id,
      proposedBy: req.user._id,
      proposedByUsername: req.user.username,
      isUserProposed: true,
      status: 'pending'
    });

    res.redirect('/my-proposals?success=' + encodeURIComponent('¡Propuesta enviada! Los administradores la revisarán pronto.'));
  } catch (error) {
    console.error(error);
    res.redirect('/proposals/new?error=' + encodeURIComponent('Error al enviar la propuesta'));
  }
};

// @desc    Ver mis propuestas
// @route   GET /my-proposals
// @access  Private
exports.myProposals = async (req, res) => {
  try {
    const proposalPeriod = getProposalPeriodInfo();

    const proposals = await Category.find({
      proposedBy: req.user.id,
      isUserProposed: true
    }).sort('-createdAt');

    res.render('user/my-proposals', {
      user: req.user,
      proposals,
      proposalPeriod,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Error al cargar tus propuestas'));
  }
};

// @desc    Panel de admin - Ver propuestas
// @route   GET /admin/proposals
// @access  Private/Admin
exports.adminProposals = async (req, res) => {
  try {
    const proposalPeriod = getProposalPeriodInfo();
    const filter = req.query.filter || 'pending';

    // Contar propuestas por estado
    const counts = {
      pending: await Category.countDocuments({ isUserProposed: true, status: 'pending' }),
      approved: await Category.countDocuments({ isUserProposed: true, status: 'approved' }),
      rejected: await Category.countDocuments({ isUserProposed: true, status: 'rejected' }),
      total: await Category.countDocuments({ isUserProposed: true })
    };

    // Filtrar propuestas
    let query = { isUserProposed: true };
    if (filter !== 'all') {
      query.status = filter;
    }

    const proposals = await Category.find(query)
      .sort(filter === 'pending' ? '-createdAt' : '-updatedAt');

    res.render('admin/proposals', {
      user: req.user,
      proposals,
      proposalPeriod,
      filter,
      counts,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin?error=' + encodeURIComponent('Error al cargar las propuestas'));
  }
};

// @desc    Aprobar propuesta
// @route   POST /admin/proposals/:id/approve
// @access  Private/Admin
exports.approveProposal = async (req, res) => {
  try {
    const proposal = await Category.findById(req.params.id);

    if (!proposal) {
      return res.redirect('/admin/proposals?error=' + encodeURIComponent('Propuesta no encontrada'));
    }

    if (!proposal.isUserProposed) {
      return res.redirect('/admin/proposals?error=' + encodeURIComponent('Esta no es una propuesta de usuario'));
    }

    proposal.status = 'approved';
    proposal.isActive = true;
    await proposal.save();

    res.redirect('/admin/proposals?success=' + encodeURIComponent(`Propuesta "${proposal.title}" aprobada`));
  } catch (error) {
    console.error(error);
    res.redirect('/admin/proposals?error=' + encodeURIComponent('Error al aprobar la propuesta'));
  }
};

// @desc    Rechazar propuesta
// @route   POST /admin/proposals/:id/reject
// @access  Private/Admin
exports.rejectProposal = async (req, res) => {
  try {
    const proposal = await Category.findById(req.params.id);

    if (!proposal) {
      return res.redirect('/admin/proposals?error=' + encodeURIComponent('Propuesta no encontrada'));
    }

    if (!proposal.isUserProposed) {
      return res.redirect('/admin/proposals?error=' + encodeURIComponent('Esta no es una propuesta de usuario'));
    }

    proposal.status = 'rejected';
    proposal.isActive = false;
    proposal.rejectionReason = req.body.rejectionReason || null;
    await proposal.save();

    res.redirect('/admin/proposals?success=' + encodeURIComponent(`Propuesta "${proposal.title}" rechazada`));
  } catch (error) {
    console.error(error);
    res.redirect('/admin/proposals?error=' + encodeURIComponent('Error al rechazar la propuesta'));
  }
};
