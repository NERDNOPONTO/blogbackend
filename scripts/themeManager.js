const Theme = require('../models/Theme');
const OpenAI = require('openai');
const Config = require('../models/Config');

async function getOpenAIKey() {
  try {
    const config = await Config.findOne({ key: 'OPENAI_API_KEY' });
    return config ? config.value : process.env.OPENAI_API_KEY;
  } catch (error) {
    console.error('Erro ao obter chave da API:', error);
    return process.env.OPENAI_API_KEY;
  }
}

const defaultThemes = [
  'Tecnologia e Inovação',
  'Saúde e Bem-estar',
  'Meio Ambiente',
  'Educação',
  'Cultura e Arte',
  'Esportes',
  'Gastronomia',
  'Viagens',
  'Negócios e Empreendedorismo',
  'Moda e Estilo',
  'Ciência',
  'História',
  'Psicologia',
  'Finanças Pessoais',
  'Desenvolvimento Pessoal',
  'Política e Sociedade',
  'Entretenimento',
  'Carreira Profissional',
  'Relacionamentos',
  'Lifestyle',
  'Games',
  'Cinema e TV',
  'Música',
  'Literatura',
  'Arquitetura e Decoração',
  'Fitness e Exercícios',
  'Medicina e Saúde',
  'Astronomia',
  'Fotografia',
  'Jardinagem',
  'Pets',
  'Automotivo',
  'Turismo',
  'Culinária',
  'Arte Digital',
  'Redes Sociais',
  'Marketing Digital',
  'Programação',
  'Inteligência Artificial',
  'Cibersegurança',
  'Cloud Computing',
  'Internet das Coisas'
];

async function generateNewThemes(count = 42) {
  try {
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey });

    const prompt = `Gere ${count} temas diferentes e interessantes para posts de blog. 
    Os temas devem ser variados e não devem incluir os temas já existentes.
    Retorne apenas os temas, um por linha, sem numeração ou formatação adicional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const themes = completion.choices[0].message.content
      .split('\n')
      .map(theme => theme.trim())
      .filter(theme => theme.length > 0);

    return themes;
  } catch (error) {
    console.error('Erro ao gerar novos temas:', error);
    return [];
  }
}

async function initializeThemes() {
  try {
    const existingThemes = await Theme.find();
    
    if (existingThemes.length === 0) {
      const themes = defaultThemes.map(name => ({
        name,
        used: false
      }));
      
      await Theme.insertMany(themes);
      console.log('Temas iniciais inseridos com sucesso');
    }
  } catch (error) {
    console.error('Erro ao inicializar temas:', error);
  }
}

async function getNextAvailableTheme() {
  try {
    let theme = await Theme.findOne({ used: false });
    
    if (!theme) {
      // Se não houver temas disponíveis, gera novos
      const newThemes = await generateNewThemes();
      
      if (newThemes.length > 0) {
        const themesToInsert = newThemes.map(name => ({
          name,
          used: false
        }));
        
        await Theme.insertMany(themesToInsert);
        theme = await Theme.findOne({ used: false });
      }
    }
    
    return theme;
  } catch (error) {
    console.error('Erro ao obter próximo tema:', error);
    return null;
  }
}

async function markThemeAsUsed(themeId) {
  try {
    await Theme.findByIdAndUpdate(themeId, {
      used: true,
      lastUsed: new Date()
    });
  } catch (error) {
    console.error('Erro ao marcar tema como usado:', error);
  }
}

module.exports = {
  initializeThemes,
  getNextAvailableTheme,
  markThemeAsUsed
}; 