import React from 'react';
import Message from './Message.js';
import LoadingIndicator from './LoadingIndicator.js';
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
