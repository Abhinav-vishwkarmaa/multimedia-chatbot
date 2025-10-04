import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Plus, User, LogOut, LogIn, UserPlus, Shield,
  Trash2, Edit3, Moon, Sun, ChevronDown, Sparkles, MessageSquare
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

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('multimodal-chatbot-token');
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const chats = await response.json();
        const chatsWithDates = chats.map(chat => ({
          ...chat,
          messages: chat.messages ? chat.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
          })) : []
        }));
        setChats(chatsWithDates);
      }
    } catch (error) {
      console.error('Load chats error:', error);
    }
  };

  const saveChats = async (chatsToSave) => {
    // No need to save locally anymore, chats are saved via API
  };

  const handleNewChat = async () => {
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
        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        onNewChat(newChat);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
    setIsOpen(false);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        const token = localStorage.getItem('multimodal-chatbot-token');
        const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const updatedChats = chats.filter(chat => chat._id !== chatId);
          setChats(updatedChats);
          onDeleteChat(chatId);
        }
      } catch (error) {
        console.error('Delete chat error:', error);
      }
    }
  };

  const handleRenameChat = (chatId, e) => {
    e.stopPropagation();
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setEditingChat(chatId);
      setNewChatName(chat.name);
    }
  };

  const saveRename = async () => {
    if (newChatName.trim()) {
      try {
        const token = localStorage.getItem('multimodal-chatbot-token');
        const response = await fetch(`http://localhost:5000/api/chats/${editingChat}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newChatName.trim()
          })
        });
        if (response.ok) {
          const updatedChat = await response.json();
          const updatedChats = chats.map(chat =>
            chat._id === editingChat ? updatedChat : chat
          );
          setChats(updatedChats);
          onRenameChat(editingChat, newChatName.trim());
        }
      } catch (error) {
        console.error('Rename chat error:', error);
      }
    }
    setEditingChat(null);
    setNewChatName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''} ${darkMode ? 'dark' : ''}`}>
        <div className="sidebar-header">
          <button className="auth-button primary" onClick={() => navigate(-1)}>⬅ Back</button>
          <div className="logo"><Sparkles size={24} /><span>Multimodal-chatbot</span></div>
          <button className="new-chat-button" onClick={handleNewChat}>
            <Plus size={20} /><span>New chat</span>
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
                chats.map(chat => (
                  <div key={chat._id} className={`chat-item ${currentChat?._id === chat._id ? 'active' : ''}`} onClick={() => handleChatSelect(chat)}>
                    {editingChat === chat._id ? (
                      <input
                        type="text"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveRename()}
                        onBlur={saveRename}
                        autoFocus
                        className="chat-name-input"
                      />
                    ) : (
                      <>
                        <div className="chat-info">
                          <div className="chat-name">{chat.name}</div>
                          <div className="chat-date">{formatDate(chat.lastModified)}</div>
                        </div>
                        <div className="chat-actions">
                          <button className="action-btn" onClick={(e) => handleRenameChat(chat.id, e)} title="Rename chat"><Edit3 size={14} /></button>
                          <button className="action-btn delete" onClick={(e) => handleDeleteChat(chat.id, e)} title="Delete chat"><Trash2 size={14} /></button>
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
            <button className="footer-button" onClick={onToggleDarkMode}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? "Light mode" : "Dark mode"}</span>
            </button>
            <button className="footer-button" onClick={() => setShowPrivacyPolicy(true)}>
              <Shield size={16} /><span>Privacy Policy</span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="user-section">
              <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar"><User size={16} /></div>
                <span className="user-name">{user?.name || user?.email || 'User'}</span>
                <ChevronDown size={16} className="chevron" />
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <button className="user-menu-item" onClick={onLogout}><LogOut size={16} /><span>Logout</span></button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-section">
              <button className="auth-button primary" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}><LogIn size={16} /><span>Login</span></button>
              <button className="auth-button secondary" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}><UserPlus size={16} /><span>Register</span></button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} onLogin={onLogin} onRegister={onRegister} />}

      {/* Privacy Modal */}
      {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
    </>
  );
};

const AuthModal = ({ mode, onClose, onLogin, onRegister }) => {
  const [formData, setFormData] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.email || !formData.password) return setErrors({ general:'Email and password required' });
    if (mode==='register') {
      if (!formData.name) return setErrors({ name:'Name required' });
      if (formData.password !== formData.confirmPassword) return setErrors({ confirmPassword:'Passwords do not match' });
      onRegister(formData);
    } else onLogin(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{mode==='login' ? 'Login' : 'Register'}</h2>
          <button className="close-button" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode==='register' && <div className="form-group">
            <label>Name</label>
            <input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Your name"/>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="your@email.com"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} placeholder="Password"/>
          </div>
          {mode==='register' && <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={formData.confirmPassword} onChange={e=>setFormData({...formData,confirmPassword:e.target.value})} placeholder="Confirm password"/>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>}
          {errors.general && <div className="error general">{errors.general}</div>}
          <button type="submit" className="submit-button">{mode==='login' ? 'Login' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
};

const PrivacyPolicyModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal privacy-modal">
      <div className="modal-header">
        <h2>Privacy Policy</h2>
        <button className="close-button" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="privacy-content">
        <h3>Data Collection</h3>
        <p>We store your chats locally in your browser only.</p>
        <h3>Data Security</h3>
        <p>Your data remains on your device. We do not share it externally.</p>
      </div>
    </div>
  </div>
);

export default Navbar;
