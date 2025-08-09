import React, { useEffect, useRef } from 'react';
import './MessageLog.css';

export interface LogMessage {
  id: string;
  message: string;
  timestamp: Date;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface MessageLogProps {
  messages: LogMessage[];
  maxMessages?: number;
}

const MessageLog: React.FC<MessageLogProps> = ({ messages, maxMessages = 50 }) => {
  // Limit the number of messages displayed
  const displayMessages = messages.slice(-maxMessages);
  
  // Ref for the scrollable container
  const messageLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messageLogRef.current) {
      messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString();
  };

  const getMessageClass = (type?: string): string => {
    switch (type) {
      case 'success':
        return 'message-success';
      case 'warning':
        return 'message-warning';
      case 'error':
        return 'message-error';
      default:
        return 'message-info';
    }
  };

  return (
    <div className="message-log-container">
      <h3 className="message-log-title">Message Log</h3>
      <div className="message-log-content" ref={messageLogRef}>
        {displayMessages.length === 0 ? (
          <div className="message-log-empty">No messages yet...</div>
        ) : (
          displayMessages.map((msg) => (
            <div key={msg.id} className={`message-log-entry ${getMessageClass(msg.type)}`}>
              <span className="message-timestamp">[{formatTimestamp(msg.timestamp)}]</span>
              <span className="message-text">{msg.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageLog;
