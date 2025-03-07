const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true,
    minlength: [3, 'O título deve ter pelo menos 3 caracteres'],
    maxlength: [200, 'O título não pode ter mais que 200 caracteres']
  },
  content: {
    type: String,
    required: [true, 'O conteúdo é obrigatório'],
    trim: true,
    minlength: [50, 'O conteúdo deve ter pelo menos 50 caracteres']
  },
  theme: {
    type: String,
    required: [true, 'O tema é obrigatório'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para busca
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ theme: 1 });

// Método virtual para resumo do post
postSchema.virtual('summary').get(function() {
  return this.content.substring(0, 150) + '...';
});

module.exports = mongoose.model('Post', postSchema);