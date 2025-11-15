import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader } from 'lucide-react';

export function MessageList({ 
  messages, 
  loading = false, 
  isGroupChat = false,
  currentUserId = null,
  onDeleteForMe = null,
  onDeleteForEveryone = null
}) {
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
  }, {});

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Skeleton loading for messages */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
            <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className="h-3 bg-muted rounded w-16"></div>
              <div className={`h-16 bg-muted rounded-2xl ${i % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm'} w-48`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="max-w-sm">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-foreground text-lg font-semibold mb-2">No messages yet</p>
          <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
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
              currentUserId={currentUserId}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
