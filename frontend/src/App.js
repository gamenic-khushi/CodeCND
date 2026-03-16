import { useState, useRef, useEffect } from 'react';
import './App.css';

const T = {
  en: {
    newChat:       'New Chat',
    newChatTitle:  'New chat',
    history:       'Conversations',
    model:         'AI Model',
    welcome:       'How can I help you today?',
    welcomeSub:    'Type below or pick a suggestion to get started.',
    placeholder:   'Message ChatCND…',
    disclaimer:    'ChatCND may produce inaccurate information. Verify critical details.',
    you:           'You',
    suggestions: [
      'Explain a complex topic simply',
      'Write a professional email template',
      'Best practices for REST APIs',
      'Help me debug my code',
    ],
  },
  ja: {
    newChat:       '新しいチャット',
    newChatTitle:  '新しいチャット',
    history:       'チャット履歴',
    model:         'AIモデル',
    welcome:       '今日は何をお手伝いしましょうか？',
    welcomeSub:    '下のボックスに入力するか、提案を選んで始めてください。',
    placeholder:   'ChatCNDにメッセージを送る…',
    disclaimer:    'ChatCNDは不正確な情報を生成する場合があります。重要な内容は必ずご確認ください。',
    you:           'あなた',
    suggestions: [
      '難しいことをわかりやすく説明して',
      'ビジネスメールのテンプレートを作って',
      'REST APIのベストプラクティスを教えて',
      'コードのバグを一緒に探して',
    ],
  },
};

function App() {
  const [lang, setLang] = useState('en');
  const [chats, setChats] = useState([{ id: 1, title: T['en'].newChat, messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const t = T[lang];
  const activeChat = chats.find(c => c.id === activeChatId);

  // Sync <html lang="…"> with selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [input]);

  function createNewChat() {
    const newId = Date.now();
    setChats(prev => [...prev, { id: newId, title: t.newChat, messages: [] }]);
    setActiveChatId(newId);
  }

  function deleteChat(e, chatId) {
    e.stopPropagation();
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== chatId);
      if (remaining.length === 0) {
        const newId = Date.now();
        setActiveChatId(newId);
        return [{ id: newId, title: t.newChat, messages: [] }];
      }
      if (chatId === activeChatId) {
        setActiveChatId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  }

  function updateChatMessages(chatId, messages) {
    setChats(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c;
        const isDefault = c.title === T.en.newChat || c.title === T.ja.newChat;
        const title =
          isDefault && messages.length > 0
            ? messages[0].text.slice(0, 32) + (messages[0].text.length > 32 ? '…' : '')
            : c.title;
        return { ...c, title, messages };
      })
    );
  }

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    const updatedMessages = [...activeChat.messages, userMsg];
    updateChatMessages(activeChatId, updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.message || data.reply || data.content || '',
      };
      updateChatMessages(activeChatId, [...updatedMessages, aiMsg]);
    } catch (err) {
      updateChatMessages(activeChatId, [
        ...updatedMessages,
        { id: Date.now() + 1, role: 'ai', text: `Error: ${err.message}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isEmpty = activeChat?.messages.length === 0 && !isLoading;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">C</div>
            <span className="brand-name">ChatCND</span>
          </div>
          <button className="new-chat-btn" onClick={createNewChat} title={t.newChatTitle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Language switcher */}
        <div className="lang-switcher">
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === 'ja' ? 'active' : ''}`}
            onClick={() => setLang('ja')}
          >
            JP
          </button>
        </div>

        <div className="sidebar-section-label">{t.history}</div>

        <nav className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{chat.title}</span>
              <button
                className="delete-chat-btn"
                onClick={e => deleteChat(e, chat.id)}
                title="Delete chat"
                aria-label="Delete chat"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="model-badge">{t.model}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="messages">
          {isEmpty && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1>{t.welcome}</h1>
              <p>{t.welcomeSub}</p>
              <div className="suggestions">
                {t.suggestions.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeChat?.messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              {msg.role === 'ai' && <div className="avatar ai-avatar">AI</div>}
              <div className={`bubble${msg.isError ? ' error' : ''}`}>{msg.text}</div>
              {msg.role === 'user' && <div className="avatar user-avatar">{t.you}</div>}
            </div>
          ))}

          {isLoading && (
            <div className="message-row ai">
              <div className="avatar ai-avatar">AI</div>
              <div className="bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-box"
              placeholder={t.placeholder}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
          <p className="disclaimer">{t.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}

export default App;
