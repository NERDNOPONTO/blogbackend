const OpenAI = require('openai');
const { getNextAvailableTheme, markThemeAsUsed } = require('./themeManager');
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

async function generatePost() {
  try {
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey });

    const theme = await getNextAvailableTheme();
    if (!theme) {
      console.error('Nenhum tema disponível');
      return null;
    }

    // Gera o título do post
    const titlePrompt = `Crie um título interessante e chamativo para um post de blog sobre o tema: ${theme.name}. 
    O título deve ser conciso e atraente. Retorne apenas o título, sem formatação adicional.`;

    const titleCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: titlePrompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const title = titleCompletion.choices[0].message.content.trim();

    // Gera o conteúdo do post
    const contentPrompt = `Imagine que você é um especialista renomado no assunto '${theme.name}'. Crie um artigo detalhado e envolvente que aborde o tema de forma completa, incluindo:

    Introdução: Explique o que é o tema e sua relevância no contexto atual.
    Histórico e Contexto: Apresente um breve histórico e os fatores que contribuíram para a sua evolução.
    Aspectos Principais: Destaque os pontos-chave, desafios e oportunidades relacionados ao tema.
    Exemplos e Casos Reais: Inclua exemplos práticos ou estudos de caso para ilustrar os pontos abordados.
    Perspectivas Futuras: Discuta possíveis tendências e inovações que podem impactar o tema.
    Conclusão: Resuma as ideias principais e ofereça insights ou recomendações finais para o leitor.
    Utilize uma linguagem clara e objetiva, com um tom profissional, mas acessível, que prenda a atenção do leitor do início ao fim. Certifique-se de incluir dados relevantes e referências quando necessário, e mantenha o artigo informativo e inspirador.`;

    const contentCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: contentPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = contentCompletion.choices[0].message.content.trim();

    // Marca o tema como usado
    await markThemeAsUsed(theme._id);

    return {
      title,
      content,
      theme: theme.name,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Erro ao gerar post:', error);
    return null;
  }
}

module.exports = generatePost;