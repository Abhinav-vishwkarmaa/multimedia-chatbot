import React from 'react';
// import Message from './chat_text/Message.js';
// import LoadingIndicator from './/LoadingIndicator.js';
import Message from '../../components/chat_text/Message.js';
import LoadingIndicator from '../../components/chat_text/LoadingIndicator.js';
import './MessageList.css';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="message-list">
      <div className="messages-container">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  );
};

export default MessageList;
