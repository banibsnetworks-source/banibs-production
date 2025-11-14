import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader } from 'lucide-react';

export function MessageList({ messages, loading = false, isGroupChat = false }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <p className="text-muted-foreground text-lg mb-2">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Date divider */}
          <div className="flex items-center justify-center my-6">
            <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
              {formatDateHeader(date)}
            </div>
          </div>
          
          {/* Messages for this date */}
          {msgs.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              showSender={isGroupChat}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
