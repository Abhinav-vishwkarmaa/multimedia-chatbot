import React, { useState, useRef, useEffect } from 'react';
import MessageList from '../../components/chat_text/MessageList.js';
import InputArea from '../../components/chat_text/InputArea.js';
import api from '../../api.js';
import './ChatInterface.css';

const ChatInterface = ({ currentChat, onChatUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages when currentChat changes
  useEffect(() => {
    if (currentChat?.messages?.length) {
      const messagesWithDates = currentChat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    } else {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I can help you with text. Start a new conversation to begin!',
          timestamp: new Date(),
          audioUrl: null,
          imageUrl: null
        }
      ]);
    }
  }, [currentChat]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveChatToStorage = chat => {
    const STORAGE_KEY = 'multimodal-chatbot-chats';
    const MAX_CHATS = 20;
    const MAX_MESSAGES_PER_CHAT = 100;

    const sanitizeMessage = m => {
      const msg = { ...m };
      if (typeof msg.imageUrl === 'string' && msg.imageUrl.startsWith('data:') && msg.imageUrl.length > 100000) {
        msg.imageUrl = null;
      }
      if (typeof msg.audioUrl === 'string' && msg.audioUrl.startsWith('data:') && msg.audioUrl.length > 100000) {
        msg.audioUrl = null;
      }
      return msg;
    };

    const prune = chats => {
      const sorted = [...chats].sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));
      const limited = sorted.slice(0, MAX_CHATS).map(c => ({
        ...c,
        messages: (c.messages || []).slice(-(MAX_MESSAGES_PER_CHAT)).map(sanitizeMessage)
      }));
      return limited;
    };

    const trySave = (chats) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
        return true;
      } catch (e) {
        return false;
      }
    };

    let savedChats = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      savedChats = raw ? JSON.parse(raw) : [];
    } catch (_) {
      savedChats = [];
    }
    const exists = savedChats.some(c => c.id === chat.id);
    const merged = exists ? savedChats.map(c => (c.id === chat.id ? chat : c)) : [...savedChats, chat];

    // First attempt with normal pruning
    let candidate = prune(merged);
    if (trySave(candidate)) return;

    // Aggressive pruning on failure: trim messages further and drop oldest chats progressively
    let aggressive = candidate;
    let maxMsgs = Math.min(50, MAX_MESSAGES_PER_CHAT);
    while (!trySave(aggressive) && (maxMsgs > 10 || aggressive.length > 1)) {
      aggressive = aggressive.map(c => ({ ...c, messages: (c.messages || []).slice(-maxMsgs) }));
      if (!trySave(aggressive)) {
        if (aggressive.length > 1) aggressive = aggressive.slice(0, aggressive.length - 1);
        maxMsgs = Math.max(10, Math.floor(maxMsgs * 0.7));
      }
    }

    // Last resort: attempt to save a minimal snapshot or clear key
    if (!trySave(aggressive)) {
      const minimal = aggressive.map(c => ({ id: c.id, name: c.name, lastModified: c.lastModified, messages: [] }));
      if (!trySave(minimal)) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      }
    }
  };

  const handleSendMessage = async messageData => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: messageData.content || '',
      timestamp: new Date(),
      audioUrl: messageData.audioBlob ? URL.createObjectURL(messageData.audioBlob) : null,
      imageUrl: messageData.imagePreviewUrl || null
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Update current chat
    if (currentChat) {
      const updatedChat = { ...currentChat, messages: updatedMessages, lastModified: new Date().toISOString() };
      onChatUpdate(updatedChat);
      try { saveChatToStorage(updatedChat); } catch (_) {}
    }

    try {
      // Determine which API call to use
      let botResponseData;
      if (messageData.audioBlob) {
        botResponseData = await api.sendAudio(messageData.audioBlob);
      } else if (messageData.imageFile) {
        botResponseData = await api.sendImage(messageData.imageFile);
      } else {
        botResponseData = await api.sendText(messageData.content);
      }

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponseData.response || botResponseData.text || 'Sorry, I could not process your request.',
        timestamp: new Date(),
        audioUrl: botResponseData.audioUrl || null,
        imageUrl: botResponseData.imageUrl || null
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);

      if (currentChat) {
        const updatedChat = { ...currentChat, messages: finalMessages, lastModified: new Date().toISOString() };
        onChatUpdate(updatedChat);
        try { saveChatToStorage(updatedChat); } catch (_) {}
      }
    } catch (error) {
      console.error('API Error:', error);

      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        audioUrl: null,
        imageUrl: null
      };

      const finalMessages = [...updatedMessages, errorResponse];
      setMessages(finalMessages);

      if (currentChat) {
        const updatedChat = { ...currentChat, messages: finalMessages, lastModified: new Date().toISOString() };
        onChatUpdate(updatedChat);
        try { saveChatToStorage(updatedChat); } catch (_) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="empty-chat-state">
        <div className="empty-chat-content">
          <h2>No conversation selected</h2>
          <p>Choose a conversation from the sidebar or start a new chat to begin.</p>
          <button
            className="start-new-chat-button"
            onClick={() => {
              const newChat = {
                id: Date.now(),
                name: `Chat ${new Date().toLocaleDateString()}`,
                messages: [
                  {
                    id: 1,
                    type: 'bot',
                    content: 'Hello! I can help you with text. How can I assist you today?',
                    timestamp: new Date(),
                    audioUrl: null,
                    imageUrl: null
                  }
                ],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
              };
              onChatUpdate(newChat);
            }}
          >
            <span>Start New Chat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="chat-interface">
      <MessageList messages={messages} isLoading={isLoading} />
      <div ref={messagesEndRef} />
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatInterface;
