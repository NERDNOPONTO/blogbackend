const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const generatePost = require('../scripts/generatePosts');

// Rota para pegar posts com paginação e busca
router.get('/', async (req, res) => {
  try {
    console.log('Recebida requisição para posts');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const theme = req.query.theme || '';
    
    console.log('Parâmetros:', { page, limit, search, theme });
    
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (theme) {
      query.theme = theme;
    }

    console.log('Query:', query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Posts encontrados:', posts.length);

    const total = await Post.countDocuments(query);
    console.log('Total de posts:', total);

    res.json({
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Erro ao buscar posts:', err);
    res.status(500).json({
      error: 'Erro ao buscar posts',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Rota para pegar um post específico
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(post);
  } catch (err) {
    console.error('Erro ao buscar post:', err);
    res.status(500).json({
      error: 'Erro ao buscar post',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Rota para gerar um novo post
router.post('/generate', async (req, res) => {
  try {
    const post = await generatePost();
    if (!post) {
      return res.status(400).json({ error: 'Não foi possível gerar o post' });
    }
    
    const newPost = await Post.create(post);
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Erro ao gerar post:', err);
    res.status(500).json({
      error: 'Erro ao gerar post',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 