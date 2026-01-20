const mongoose = require('mongoose');

// Opciones fijas para todas las categorías
const FIXED_OPTIONS = ["Gringo", "Marco", "Alex", "Joak"];

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    enum: FIXED_OPTIONS,
    required: [true, 'El texto de la opción es requerido'],
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: String,
    ref: 'User'
  }]
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la incógnita es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  options: {
    type: [optionSchema],
    default: function() {
      return FIXED_OPTIONS.map(option => ({
        text: option,
        votes: 0,
        voters: []
      }));
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  // Usuario que creó la incógnita (admin)
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  },
  // Usuario que propuso la incógnita (si es propuesta de usuario)
  proposedBy: {
    type: String,
    ref: 'User',
    default: null
  },
  // Username del usuario que propuso (para mostrar en votación)
  proposedByUsername: {
    type: String,
    default: null
  },
  // Si fue propuesta por un usuario (no creada por admin directamente)
  isUserProposed: {
    type: Boolean,
    default: false
  },
  // Estado de la propuesta: approved, pending, rejected
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  // Mensaje de rechazo (opcional)
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar updatedAt antes de guardar
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Category', categorySchema);
