const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const { generateNewThemes } = require('../scripts/themeManager');

// Listar todos os temas
router.get('/', async (req, res) => {
  try {
    const themes = await Theme.find().sort({ createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar temas' });
  }
});

// Listar temas não utilizados
router.get('/available', async (req, res) => {
  try {
    const themes = await Theme.find({ used: false }).sort({ createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar temas disponíveis' });
  }
});

// Listar temas utilizados
router.get('/used', async (req, res) => {
  try {
    const themes = await Theme.find({ used: true }).sort({ lastUsed: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar temas utilizados' });
  }
});

// Gerar novos temas manualmente
router.post('/generate', async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 42;
    const newThemes = await generateNewThemes(count);
    
    if (newThemes.length > 0) {
      const themesToInsert = newThemes.map(name => ({
        name,
        used: false
      }));
      
      await Theme.insertMany(themesToInsert);
      res.json({ message: `${newThemes.length} novos temas gerados com sucesso` });
    } else {
      res.status(400).json({ error: 'Não foi possível gerar novos temas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar novos temas' });
  }
});

// Resetar todos os temas para não utilizados
router.post('/reset', async (req, res) => {
  try {
    await Theme.updateMany({}, { used: false, lastUsed: null });
    res.json({ message: 'Temas resetados com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar temas' });
  }
});

module.exports = router; 