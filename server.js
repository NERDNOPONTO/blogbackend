require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const postsRouter = require('./routes/posts');
const configRouter = require('./routes/config');
const Config = require('./models/Config');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: [
    'https://nerdnoponto.github.io/IA-the-News/',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://nerdnoponto.github.io/IA-the-News/'
  ],
  credentials: true
}));

// Middlewares
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API do Blog!',
    status: 'online',
    endpoints: {
      posts: '/api/posts',
      config: '/api/config',
      test: '/test'
    }
  });
});

// Função para obter a chave da API
const getOpenAIKey = async () => {
  try {
    const config = await Config.findOne({ key: 'OPENAI_API_KEY' });
    return config ? config.value : process.env.OPENAI_API_KEY;
  } catch (error) {
    console.error('Erro ao obter chave da API:', error);
    return process.env.OPENAI_API_KEY;
  }
};

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Conexão com MongoDB com retry
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB conectado');
    
    // Criar configuração inicial da API se não existir
    const apiKey = await Config.findOne({ key: 'OPENAI_API_KEY' });
    if (!apiKey && process.env.OPENAI_API_KEY) {
      await Config.create({
        key: 'OPENAI_API_KEY',
        value: process.env.OPENAI_API_KEY,
        description: 'Chave da API da OpenAI'
      });
      console.log('Chave da API inicial configurada');
    }
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    console.log('Tentando reconectar em 5 segundos...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Rotas
app.use('/api/posts', postsRouter);
app.use('/api/config', configRouter);

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL do servidor: http://localhost:${PORT}`);
});