import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.js';
import ChatInterface from '../components/ChatInterface.js';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('multimodal-chatbot-dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('multimodal-chatbot-dark-mode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('multimodal-chatbot-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } else {
      // Redirect to welcome page if not authenticated
      navigate('/chat');
    }
  }, [navigate]);

  // Load current chat from localStorage when component mounts
  useEffect(() => {
    const savedCurrentChat = localStorage.getItem('multimodal-chatbot-current-chat');
    if (savedCurrentChat) {
      const chat = JSON.parse(savedCurrentChat);
      // Convert timestamp strings back to Date objects for messages
      if (chat.messages) {
        chat.messages = chat.messages.map(message => ({
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
        }));
      }
      setCurrentChat(chat);
      // Clear the current chat from localStorage after loading
      localStorage.removeItem('multimodal-chatbot-current-chat');
    }
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNewChat = (newChat) => {
    setCurrentChat(newChat);
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = (chatId) => {
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  const handleRenameChat = (chatId, newName) => {
    if (currentChat?.id === chatId) {
      setCurrentChat({ ...currentChat, name: newName });
    }
  };

  const handleLogin = async (credentials) => {
    // Simulate login - replace with actual API call
    try {
      // Mock authentication
      const mockUser = {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('multimodal-chatbot-user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const handleRegister = async (userData) => {
    // Simulate registration - replace with actual API call
    try {
      // Mock registration
      const mockUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('multimodal-chatbot-user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('multimodal-chatbot-user');
    navigate('/');
  };

  // Show loading if user data is being loaded
  // if (!user && !isAuthenticated) {
  //   return (
  //     <div className="chat-page">
  //       <div className="loading-screen">
  //         <div className="loading-spinner"></div>
  //         <p>Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`chat-page ${darkMode ? 'dark' : 'light'}`}>
      <Navbar
        currentChat={currentChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <div className="main-content">
        <ChatInterface 
          currentChat={currentChat}
          onChatUpdate={setCurrentChat}
        />
      </div>
    </div>
  );
};

export default Chat;
