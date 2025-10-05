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

  const saveChatToAPI = async (chat) => {
    try {
      const token = localStorage.getItem('multimodal-chatbot-token');
      if (!token) return;

      if (chat._id) {
        // Update existing chat
        const response = await fetch(`http://localhost:5000/api/chats/${chat._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            messages: chat.messages
          })
        });
        if (!response.ok) {
          console.error('Failed to save chat to API');
        }
      } else {
        // Create new chat
        const response = await fetch('http://localhost:5000/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: chat.name,
            messages: chat.messages
          })
        });
        if (response.ok) {
          const newChat = await response.json();
          // Update the chat with _id so future saves use PUT
          chat._id = newChat._id;
        } else {
          console.error('Failed to create chat');
        }
      }
    } catch (error) {
      console.error('Save chat error:', error);
    }
  };

  // Format bot response with LaTeX and structured content
  const formatBotResponse = (responseData) => {
    // Handle different response formats
    
    // Case 1: Response is already a string (possibly with LaTeX)
    if (typeof responseData === 'string') {
      return responseData;
    }
    
    if (typeof responseData.response === 'string') {
      return responseData.response;
    }
    
    // Case 2: Response has a 'text' field
    if (responseData.text && typeof responseData.text === 'string') {
      return responseData.text;
    }
    
    // Case 3: Response is an array of structured content
    if (!Array.isArray(responseData.response)) {
      return 'Sorry, I could not process your request.';
    }

    // Build formatted content from response array
    let formattedContent = '';
    let prevType = null;
    
    responseData.response.forEach((item, index) => {
      if (item.type === 'text') {
        let text = item.content.trim();
        if (!text) return;
        
        // Convert **text** to <strong>text</strong> for bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Check if text ends with punctuation that suggests a new line
        const endsWithNewlineTrigger = text.match(/[:]\s*$/) || text.match(/^\d+\.\s+<strong>/);
        
        // Add spacing based on context
        if (formattedContent) {
          if (prevType === 'math' && !formattedContent.endsWith('\n\n')) {
            // After display math, add a space
            formattedContent += ' ';
          } else if (!formattedContent.endsWith(' ') && !formattedContent.endsWith('\n')) {
            formattedContent += ' ';
          }
        }
        
        formattedContent += text;
        
        // Add newline after text if it suggests a section break
        if (endsWithNewlineTrigger && index < responseData.response.length - 1) {
          formattedContent += '\n\n';
        }
        
        prevType = 'text';
      } else if (item.type === 'math') {
        const mathContent = item.content.trim();
        if (!mathContent) return;
        
        // Determine if inline or display math
        // Inline: single variables, short expressions without line breaks
        // Display: equations, multi-line expressions, or expressions with equals signs
        const hasEquals = mathContent.includes('=');
        const hasLineBreak = mathContent.includes('\\\\');
        const isLong = mathContent.length > 40;
        const isDisplayMath = hasEquals || hasLineBreak || isLong;
        
        if (isDisplayMath) {
          // Display math - add newlines for proper formatting
          if (formattedContent && !formattedContent.endsWith('\n\n')) {
            formattedContent += '\n\n';
          }
          formattedContent += `$$${mathContent}$$`;
          
          // Check if next item is also display math
          const nextItem = responseData.response[index + 1];
          if (nextItem?.type === 'math') {
            const nextHasEquals = nextItem.content.includes('=');
            if (nextHasEquals) {
              formattedContent += '\n\n';
            }
          } else {
            formattedContent += '\n\n';
          }
        } else {
          // Inline math
          if (formattedContent && !formattedContent.endsWith(' ')) {
            formattedContent += ' ';
          }
          formattedContent += `$${mathContent}$`;
        }
        
        prevType = 'math';
      }
    });

    return formattedContent.trim();
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
      if (currentChat._id) {
        try { await saveChatToAPI(updatedChat); } catch (_) {}
      }
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

      // Format the bot response with LaTeX support
      const formattedContent = formatBotResponse(botResponseData);

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: formattedContent,
        timestamp: new Date(),
        audioUrl: botResponseData.audioUrl || null,
        imageUrl: botResponseData.imageUrl || null,
        hasLatex: formattedContent.includes('$') || formattedContent.includes('<strong>') // Flag for LaTeX/HTML rendering
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);

      if (currentChat) {
        const updatedChat = { ...currentChat, messages: finalMessages, lastModified: new Date().toISOString() };
        onChatUpdate(updatedChat);
        if (currentChat._id) {
          try { await saveChatToAPI(updatedChat); } catch (_) {}
        }
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
        if (currentChat._id) {
          try { await saveChatToAPI(updatedChat); } catch (_) {}
        }
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