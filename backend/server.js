const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Check if API key is loaded
console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES ✅' : 'NO ❌');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  // Debug: Log incoming messages
  console.log('Incoming messages:', JSON.stringify(messages, null, 2));

  // Validate messages
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8096,
      system: `You are ChatCND, a highly intelligent, helpful, and interactive AI assistant. 
               Always provide detailed, accurate, and well-structured answers.
               Use bullet points, numbered lists, and clear formatting when explaining topics.
               Be friendly, thorough, and engaging in your responses.`,
      messages: messages,
    });

    console.log('Claude response received ✅');
    res.json({ reply: response.content[0].text });

  } catch (error) {
    console.error('Claude API Error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Something went wrong' 
    });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('ChatCND Backend is running! ✅');
});

app.listen(5000, () => {
  console.log('🚀 Backend running on http://localhost:5000');
});