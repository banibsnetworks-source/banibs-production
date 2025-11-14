import React from 'react';
import PostTextWithEmojis from '../social/PostTextWithEmojis';

export function MessageBubble({ message, showSender = false }) {
  const isOutgoing = message.direction === 'outgoing';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'}`}>
        {/* Sender name for group chats */}
        {showSender && !isOutgoing && message.senderName && (
          <p className="text-xs text-muted-foreground mb-1 ml-3">
            {message.senderName}
          </p>
        )}
        
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl
            ${isOutgoing 
              ? 'bg-yellow-500 text-black rounded-br-md' 
              : 'bg-muted text-foreground rounded-bl-md'
            }
          `}
        >
          {message.type === 'text' && message.text && (
            <PostTextWithEmojis 
              text={message.text}
              className="text-sm leading-relaxed"
            />
          )}
          
          {message.type === 'image' && message.mediaUrl && (
            <img 
              src={message.mediaUrl} 
              alt="Shared image"
              className="rounded-lg max-w-full"
            />
          )}
          
          {message.type === 'file' && message.fileName && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">{message.fileName}</span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-muted-foreground mt-1 ${isOutgoing ? 'text-right mr-3' : 'ml-3'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
