const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  option: {
    type: String,
    enum: ["Gringo", "Marco", "Alex", "Joak"],
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para prevenir votos duplicados (si no se permite votos múltiples)
voteSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Vote', voteSchema);
