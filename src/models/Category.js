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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la categoría es requerido'],
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
