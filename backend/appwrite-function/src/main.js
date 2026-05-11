import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export default async ({ req, res, log, error }) => {
  const path   = req.path  || '/';
  const method = (req.method || 'GET').toUpperCase();

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {}

  // Health check
  if (path === '/' || path === '') {
    return res.json({ status: 'ChatCND Backend running ✅' });
  }

  // POST /chat
  if (path === '/chat' && method === 'POST') {
    const { messages, model } = body;
    if (!messages || !messages.length) {
      return res.json({ error: 'No messages provided' }, 400);
    }

    const systemPrompt = `You are ChatCND, a helpful and intelligent AI assistant.
Provide detailed, accurate, and well-structured answers.
Use bullet points and clear formatting when explaining topics.`;

    try {
      if (model === 'OpenAI') {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const r = await openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 4096,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        });
        return res.json({ reply: r.choices[0].message.content });
      } else {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const r = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8096,
          system: systemPrompt,
          messages,
        });
        return res.json({ reply: r.content[0].text });
      }
    } catch (err) {
      error('Chat error: ' + err.message);
      return res.json({ error: err.message || 'Something went wrong' }, 500);
    }
  }

  // POST /translate
  if (path === '/translate' && method === 'POST') {
    const { texts } = body;
    if (!texts || !texts.length) {
      return res.json({ error: 'No texts provided' }, 400);
    }
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const list = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
      const r = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Translate each of the following items from English to Japanese. Return ONLY a JSON array of translated strings in the same order, no explanation.\n\n${list}`,
        }],
      });
      const raw   = r.content[0].text.trim();
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Invalid response format');
      const translated = JSON.parse(match[0]);
      return res.json({ translated });
    } catch (err) {
      error('Translate error: ' + err.message);
      return res.json({ error: err.message }, 500);
    }
  }

  // POST /image
  if (path === '/image' && method === 'POST') {
    const { prompt } = body;
    if (!prompt) return res.json({ error: 'No prompt provided' }, 400);
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });
      return res.json({ url: r.data[0].url });
    } catch (err) {
      error('Image error: ' + err.message);
      return res.json({ error: err.message || 'Image generation failed' }, 500);
    }
  }

  return res.json({ error: 'Not found' }, 404);
};
