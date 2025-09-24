import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  MessageSquare, 
  Plus, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Shield,
  Trash2,
  Edit3,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ 
  currentChat, 
  onChatSelect, 
  onNewChat, 
  onDeleteChat,
  onRenameChat,
  isAuthenticated,
  user,
  onLogin,
  onRegister,
  onLogout,
  darkMode,
  onToggleDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [editingChat, setEditingChat] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load chats from localStorage on component mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const savedChats = localStorage.getItem('multimodal-chatbot-chats');
    if (savedChats) {
      const chats = JSON.parse(savedChats);
      // Convert timestamp strings back to Date objects for all messages in all chats
      const chatsWithDates = chats.map(chat => ({
        ...chat,
        messages: chat.messages ? chat.messages.map(message => ({
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
        })) : []
      }));
      setChats(chatsWithDates);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      name: `Chat ${new Date().toLocaleDateString()}`,
      messages: [
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I can help you with text, images, and audio. How can I assist you today?',
          timestamp: new Date(),
          audioUrl: null
        }
      ],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    saveChats(updatedChats);
    onNewChat(newChat);
    setIsOpen(false);
  };

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
    setIsOpen(false);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      saveChats(updatedChats);
      onDeleteChat(chatId);
    }
  };
  const handleDeleteAllChat = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete all chats?')) {
      setChats([]);
      saveChats([]);
    }
  }

  const handleRenameChat = (chatId, e) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setEditingChat(chatId);
      setNewChatName(chat.name);
    }
  };

  const saveRename = () => {
    if (newChatName.trim()) {
      const updatedChats = chats.map(chat => 
        chat.id === editingChat 
          ? { ...chat, name: newChatName.trim(), lastModified: new Date().toISOString() }
          : chat
      );
      setChats(updatedChats);
      saveChats(updatedChats);
      onRenameChat(editingChat, newChatName.trim());
    }
    setEditingChat(null);
    setNewChatName('');
  };

  const saveChats = (chatsToSave) => {
    localStorage.setItem('multimodal-chatbot-chats', JSON.stringify(chatsToSave));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''} ${darkMode ? 'dark' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Sparkles size={24} />
            <span>Multimodal-chatbot</span>
          </div>
          <button 
            className="new-chat-button"
            onClick={handleNewChat}
            title="New Chat"
          >
            <Plus size={20} />
            <span>New chat</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="chats-section">
            <h3>Recent Chats</h3>
            <div className="chats-list">
              {chats.length === 0 ? (
                <div className="no-chats">
                  <MessageSquare size={48} />
                  <p>No chats yet</p>
                  <p>Start a new conversation!</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div 
                    key={chat.id}
                    className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    {editingChat === chat.id ? (
                      <div className="edit-chat">
                        <input
                          type="text"
                          value={newChatName}
                          onChange={(e) => setNewChatName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveRename()}
                          onBlur={saveRename}
                          autoFocus
                          className="chat-name-input"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="chat-info">
                          <div className="chat-name">{chat.name}</div>
                          <div className="chat-date">{formatDate(chat.lastModified)}</div>
                        </div>
                        <div className="chat-actions">
                          <button
                            className="action-btn"
                            onClick={(e) => handleRenameChat(chat.id, e)}
                            title="Rename chat"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            title="Delete chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-actions">
            <button 
              className="footer-button"
              onClick={onToggleDarkMode}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? "Light mode" : "Dark mode"}</span>
            </button>
            
            <button 
              className="footer-button"
              onClick={() => setShowPrivacyPolicy(true)}
              title="Privacy Policy"
            >
              <Shield size={16} />
              <span>Privacy Policy</span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="user-section">
              <div 
                className="user-info"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <span className="user-name">{user?.name || user?.email || 'User'}</span>
                <ChevronDown size={16} className="chevron" />
              </div>
              
              {showUserMenu && (
                <div className="user-menu">
                  <button 
                    className="user-menu-item"
                    onClick={onLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-section">
              <button 
                className="auth-button primary"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
              <button 
                className="auth-button secondary"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicyModal
          onClose={() => setShowPrivacyPolicy(false)}
        />
      )}
    </>
  );
};

// Auth Modal Component
const AuthModal = ({ mode, onClose, onLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    if (mode === 'register') {
      if (!formData.name) {
        setErrors({ name: 'Name is required' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
      onRegister(formData);
    } else {
      onLogin(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your name"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Your password"
            />
          </div>
          
          {mode === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          )}
          
          {errors.general && <div className="error general">{errors.general}</div>}
          
          <button type="submit" className="submit-button">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Privacy Policy Modal Component
const PrivacyPolicyModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal privacy-modal">
        <div className="modal-header">
          <h2>Privacy Policy</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="privacy-content">
          <h3>Data Collection</h3>
          <p>We collect and store the following data locally in your browser:</p>
          <ul>
            <li>Chat messages and conversations</li>
            <li>User preferences and settings</li>
            <li>Authentication information (if you choose to register)</li>
          </ul>
          
          <h3>Data Storage</h3>
          <p>All data is stored locally in your browser's localStorage. We do not send your personal data to external servers unless you explicitly choose to use cloud features.</p>
          
          <h3>Data Usage</h3>
          <p>Your data is used to:</p>
          <ul>
            <li>Provide chat functionality</li>
            <li>Remember your conversation history</li>
            <li>Improve user experience</li>
          </ul>
          
          <h3>Data Security</h3>
          <p>We implement appropriate security measures to protect your data. However, since data is stored locally, you are responsible for the security of your device.</p>
          
          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your stored data</li>
            <li>Delete your data at any time</li>
            <li>Export your chat history</li>
          </ul>
          
          <h3>Contact</h3>
          <p>If you have any questions about this privacy policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
