const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do tema é obrigatório'],
    unique: true,
    trim: true
  },
  used: {
    type: Boolean,
    default: false
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Theme', themeSchema); 