import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList.js';
import InputArea from './InputArea.js';
import { apiCall, API_CONFIG } from '../config/api.js';
import './ChatInterface.css';

const ChatInterface = ({ currentChat, onChatUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      // Convert timestamp strings back to Date objects
      const messagesWithDates = currentChat.messages.map(message => ({
        ...message,
        timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
      }));
      setMessages(messagesWithDates);
    } else {
      // Show welcome message when no chat is selected
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I can help you with text, images, and audio. Start a new conversation to begin!',
          timestamp: new Date(),
          audioUrl: null
        }
      ]);
    }
  }, [currentChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageData) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: messageData.content,
      timestamp: new Date(),
      audioUrl: messageData.audioUrl,
      imageUrl: messageData.imageUrl
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Update current chat with new message
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
        lastModified: new Date().toISOString()
      };
      onChatUpdate(updatedChat);
      saveChatToStorage(updatedChat);
    }

    try {
      // Prepare data for API call
      const apiData = {
        text: messageData.content || '',
        image: messageData.imageUrl || null,
        audio: messageData.audioUrl || null,
        timestamp: new Date().toISOString()
      };

      // Call your backend API using the helper function
      const botResponseData = await apiCall(API_CONFIG.ENDPOINTS.CHAT, apiData);

      // Create bot response message
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponseData.message || botResponseData.text || 'Sorry, I could not process your request.',
        timestamp: new Date(),
        audioUrl: botResponseData.audioUrl || null,
        imageUrl: botResponseData.imageUrl || null
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      
      // Update current chat with bot response
      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: finalMessages,
          lastModified: new Date().toISOString()
        };
        onChatUpdate(updatedChat);
        saveChatToStorage(updatedChat);
      }
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback response on error
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        audioUrl: null
      };
      
      const finalMessages = [...updatedMessages, errorResponse];
      setMessages(finalMessages);
      
      // Update current chat with error response
      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: finalMessages,
          lastModified: new Date().toISOString()
        };
        onChatUpdate(updatedChat);
        saveChatToStorage(updatedChat);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatToStorage = (chat) => {
    const savedChats = JSON.parse(localStorage.getItem('multimodal-chatbot-chats') || '[]');
    const updatedChats = savedChats.map(savedChat => 
      savedChat.id === chat.id ? chat : savedChat
    );
    localStorage.setItem('multimodal-chatbot-chats', JSON.stringify(updatedChats));
  };

  const generateBotResponse = (messageData) => {
    if (messageData.imageUrl) {
      return "I can see the image you sent! It looks interesting. How can I help you with it?";
    } else if (messageData.audioUrl) {
      return "I heard your audio message! Thanks for sharing that with me. What would you like to know?";
    } else {
      return `I received your message: "${messageData.content}". How can I assist you further?`;
    }
  };

  // Show empty state when no chat is selected
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
                    content: 'Hello! I can help you with text, images, and audio. How can I assist you today?',
                    timestamp: new Date(),
                    audioUrl: null
                  }
                ],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
              };
              onChatUpdate(newChat);
            }}
          >
            {/* <MessageSquare size={20} /> */}
            <span>Start New Chat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
      />
      <div ref={messagesEndRef} />
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatInterface;