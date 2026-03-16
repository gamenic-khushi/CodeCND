
ChatCND 🤖
A ChatGPT-like AI chat application powered by Claude AI (Anthropic). Built with React (Create React App) on the frontend and Node.js + Express on the backend.

📸 Preview
ChatCND features a clean dark/light UI with a sidebar for chat history, message bubbles, and a message input at the bottom — just like ChatGPT.

🚀 Features

💬 Real-time AI chat powered by Claude (claude-sonnet-4-20250514)
🧠 Multi-turn conversation memory (full history sent each time)
📁 Sidebar with chat history and New Chat button
🌙 Modern dark/light theme UI
⏳ Typing/loading indicator while waiting for response
⚠️ Error handling with user-friendly messages


🗂️ Project Structure
ChatCND/
├── backend/
│   ├── server.js         # Express server + Claude API integration
│   ├── .env              # API key (never commit this!)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js        # Main React component
    │   ├── App.css       # Styles
    │   └── index.js      # React entry point
    └── package.json

⚙️ Prerequisites
Make sure you have the following installed:

Node.js v18 or higher
npm (comes with Node.js)
An Anthropic API Key


🛠️ Installation & Setup
1. Clone or Download the Project
bashgit clone https://github.com/yourusername/chatcnd.git
cd chatcnd
2. Setup the Backend
bashcd backend
npm install
Create a .env file inside the backend folder:
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

🔑 Get your API key at: https://console.anthropic.com → API Keys

3. Setup the Frontend
bashcd ../frontend
npm install

▶️ Running the App
You need two terminals running at the same time.
Terminal 1 — Start the Backend
bashcd backend
node server.js
You should see:
API Key loaded: YES ✅
🚀 Backend running on http://localhost:5000
Terminal 2 — Start the Frontend
bashcd frontend
npm start
Then open your browser at:
http://localhost:3000