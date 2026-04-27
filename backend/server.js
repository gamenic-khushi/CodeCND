const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// keep backward-compat alias
const client = anthropicClient;

// Root documents folder on your PC
const ROOT_FOLDER = 'D:\\ChatCND-Docs';

console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES ✅' : 'NO ❌');

// ✅ Get document type categories (top level folders)
app.get('/api/folders', (req, res) => {
  try {
    const items = fs.readdirSync(ROOT_FOLDER, { withFileTypes: true });
    const folders = items
      .filter(item => item.isDirectory())
      .map(item => item.name);
    res.json({ folders });
  } catch (error) {
    console.error('Folder read error:', error.message);
    res.status(500).json({ error: 'Could not read folders' });
  }
});

// ✅ Get subfolders inside a category
app.get('/api/folders/:category', (req, res) => {
  try {
    const categoryPath = path.join(ROOT_FOLDER, req.params.category);
    const items = fs.readdirSync(categoryPath, { withFileTypes: true });
    const subfolders = items
      .filter(item => item.isDirectory())
      .map(item => item.name);
    res.json({ subfolders });
  } catch (error) {
    console.error('Subfolder read error:', error.message);
    res.status(500).json({ error: 'Could not read subfolders' });
  }
});

// ✅ Get files inside a subfolder
app.get('/api/files/:category/:subfolder', (req, res) => {
  try {
    const folderPath = path.join(
      ROOT_FOLDER, 
      req.params.category, 
      req.params.subfolder
    );
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    const files = items
      .filter(item => item.isFile())
      .filter(item => 
        item.name.endsWith('.pdf') || 
        item.name.endsWith('.txt') || 
        item.name.endsWith('.docx')
      )
      .map(item => item.name);
    res.json({ files });
  } catch (error) {
    console.error('Files read error:', error.message);
    res.status(500).json({ error: 'Could not read files' });
  }
});

// ✅ Read file content (txt files only)
app.get('/api/file-content/:category/:subfolder/:filename', (req, res) => {
  try {
    const filePath = path.join(
      ROOT_FOLDER,
      req.params.category,
      req.params.subfolder,
      req.params.filename
    );
    if (req.params.filename.endsWith('.txt')) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json({ content });
    } else {
      res.json({ content: `[File: ${req.params.filename}] - Preview not available for this file type` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not read file' });
  }
});

// ✅ Chat — supports model: 'OpenAI' | 'Claude' (defaults to Claude)
app.post('/api/chat', async (req, res) => {
  const { messages, model } = req.body;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }
  const systemPrompt = `You are ChatCND, a helpful and intelligent AI assistant.
               Provide detailed, accurate, and well-structured answers.
               Use bullet points and clear formatting when explaining topics.`;
  try {
    if (model === 'OpenAI') {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      });
      console.log('OpenAI response received ✅');
      res.json({ reply: response.choices[0].message.content });
    } else {
      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8096,
        system: systemPrompt,
        messages: messages,
      });
      console.log('Claude response received ✅');
      res.json({ reply: response.content[0].text });
    }
  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});1

// ✅ Translate text to Japanese
app.post('/api/translate', async (req, res) => {
  const { texts } = req.body; // array of strings
  if (!texts || texts.length === 0) return res.status(400).json({ error: 'No texts provided' });
  try {
    const list = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Translate each of the following items from English to Japanese. Return ONLY a JSON array of translated strings in the same order, no explanation.\n\n${list}`,
      }],
    });
    const raw = response.content[0].text.trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid response format');
    const translated = JSON.parse(match[0]);
    res.json({ translated });
  } catch (error) {
    console.error('Translate error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('ChatCND Backend is running! ✅');
});

app.listen(5000, () => {
  console.log('🚀 Backend running on http://localhost:5000');
});