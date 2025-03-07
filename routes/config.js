const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Middleware para verificar se a chave existe
const getConfig = async (req, res, next) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (!config) {
      return res.status(404).json({ message: 'Configuração não encontrada' });
    }
    req.config = config;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter todas as configurações
router.get('/', async (req, res) => {
  try {
    const configs = await Config.find({}, '-value'); // Não retorna os valores sensíveis
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter uma configuração específica
router.get('/:key', getConfig, (req, res) => {
  res.json(req.config);
});

// Criar ou atualizar uma configuração
router.post('/:key', async (req, res) => {
  try {
    const config = await Config.findOneAndUpdate(
      { key: req.params.key },
      {
        value: req.body.value,
        description: req.body.description
      },
      { upsert: true, new: true }
    );
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar uma configuração
router.delete('/:key', getConfig, async (req, res) => {
  try {
    await req.config.remove();
    res.json({ message: 'Configuração removida' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 