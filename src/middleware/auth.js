const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - verificar si el usuario está autenticado
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si existe token en cookies o en el header Authorization
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si no hay token
  if (!token) {
    // Si es una petición de API, retornar JSON
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, por favor inicia sesión'
      });
    }
    // Si es una vista, redirigir a login
    return res.redirect('/login');
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // Si es una petición de API, retornar JSON
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Si es una vista, redirigir a login
      return res.redirect('/login');
    }

    next();
  } catch (error) {
    // Si es una petición de API, retornar JSON
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    // Si es una vista, redirigir a login
    return res.redirect('/login');
  }
};

// Verificar rol de administrador
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Si es una petición de API, retornar JSON
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          message: `El rol ${req.user.role} no tiene autorización para acceder a esta ruta`
        });
      }
      // Si es una vista, redirigir según el rol
      if (req.user.role === 'user') {
        return res.redirect('/dashboard');
      }
      return res.redirect('/login');
    }
    next();
  };
};

// Generar JWT Token
exports.getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Enviar token en cookie
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.getSignedJwtToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
};
