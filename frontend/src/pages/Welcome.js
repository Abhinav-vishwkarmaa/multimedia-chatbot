import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Image, Mic, ArrowRight, Sparkles } from 'lucide-react';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already authenticated
  useEffect(() => {
    const savedUser = localStorage.getItem('multimodal-chatbot-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);



  const handleNewChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('multimodal-chatbot-token');
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Chat ${new Date().toLocaleDateString()}`,
          messages: [{
            id: 1,
            type: 'bot',
            content: 'Hello! I can help you with text. How can I assist you today?',
            timestamp: new Date(),
            audioUrl: null
          }]
        })
      });

      if (response.ok) {
        const newChat = await response.json();
        navigate('/chat');
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="logo-section">
            <Sparkles size={32} className="logo-icon" />
            <h1>How can I help you today?</h1>
          </div>
          <p className="welcome-subtitle">
            Start a new conversation to begin chatting with our AI assistant. 
            You can send text messages, upload images, or record audio.
          </p>
        </div>

        <div className="features-grid" >
           <div className="feature-card" onClick={() => isAuthenticated ? navigate('/chat') : navigate('/login')}>
             <div className="feature-icon">
               <MessageSquare size={24} />
             </div>
             <h3>💬 Text Chat</h3>
             <p>Send text messages and get intelligent responses</p>
           </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Image size={24} />
            </div>
            <h3>🖼️ Image Analysis</h3>
            <p>Upload images and get detailed descriptions</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Mic size={24} />
            </div>
            <h3>🎤 Voice Messages</h3>
            <p>Record audio messages and listen to responses</p>
          </div>
        </div>

        <div className="action-section">
          <button
            className="new-chat-button"
            onClick={handleNewChat}
          >
            <MessageSquare size={20} />
            <span>Start New Chat</span>
            <ArrowRight size={20} />
          </button>

          {!isAuthenticated ? (
            <div className="quick-actions">
              <button
                className="quick-action-button"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="quick-action-button secondary"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="quick-actions">
              <p className="welcome-user">
                Welcome back, <strong>{user?.name}</strong>!
              </p>
              <button
                className="quick-action-button secondary"
                onClick={() => navigate('/chat')}
              >
                Go to Chat
              </button>
            </div>
          )}
        </div>

        <div className="welcome-footer">
          <p>Powered by advanced AI technology</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
