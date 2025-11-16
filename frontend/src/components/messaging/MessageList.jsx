import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export function MessageList({ 
  messages, 
  loading = false, 
  isGroupChat = false,
  currentUserId = null,
  onDeleteForMe = null,
  onDeleteForEveryone = null,
  conversation = null
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  console.log('[MessageList] Rendering with:', {
    messagesCount: messages?.length || 0,
    loading,
    currentUserId,
    messages: messages?.map(m => ({ 
      id: m.id, 
      text: m.text?.substring(0, 30), 
      direction: m.direction, 
      senderId: m.senderId,
      createdAt: m.createdAt,
      hasTimestamp: !!m.createdAt
    }))
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    // Use current time as fallback for messages without timestamp
    let dateString;
    
    if (!message.createdAt) {
      console.warn('Message missing createdAt, using fallback:', message);
      // Use "Today" for messages without timestamp
      dateString = new Date().toDateString();
    } else {
      const date = new Date(message.createdAt);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in message, using fallback:', message.createdAt, message);
        dateString = new Date().toDateString();
      } else {
        dateString = date.toDateString();
      }
    }
    
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(message);
    return groups;
  }, {});

  const formatDateHeader = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Validate date
      if (isNaN(date.getTime())) {
        console.error('Invalid date string for header:', dateString);
        return 'Recent';
      }
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (dateString === today) return 'Today';
      if (dateString === yesterday) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date header:', dateString, error);
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* BANIBS Skeleton Loading for Messages */}
        {/* Incoming message */}
        <div className="flex justify-start">
          <Skeleton className="h-6 w-2/3 rounded-2xl rounded-bl-md" />
        </div>
        {/* Outgoing message */}
        <div className="flex justify-end">
          <Skeleton className="h-6 w-1/2 rounded-2xl rounded-br-md" />
        </div>
        {/* Incoming message */}
        <div className="flex justify-start">
          <Skeleton className="h-6 w-1/3 rounded-2xl rounded-bl-md" />
        </div>
        {/* Outgoing message */}
        <div className="flex justify-end">
          <Skeleton className="h-8 w-3/5 rounded-2xl rounded-br-md" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    // Get the other participant for DM conversations
    const otherParticipant = conversation?.participants?.[0];
    const conversationName = conversation?.title || conversation?.name || 'here';
    
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="max-w-md space-y-6">
          {/* Large avatar of the other person (for DMs) */}
          {otherParticipant ? (
            <div className="flex justify-center">
              {otherParticipant.avatar_url ? (
                <img 
                  src={otherParticipant.avatar_url} 
                  alt={otherParticipant.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 text-4xl font-bold border-4 border-border shadow-lg">
                  {(otherParticipant.name || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          )}
          
          {/* Name and message */}
          <div>
            {otherParticipant && (
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {otherParticipant.name}
              </h3>
            )}
            <p className="text-lg font-semibold text-foreground mb-2">
              No messages yet
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {otherParticipant 
                ? `Start your conversation with ${otherParticipant.name.split(' ')[0]}.`
                : `Send a message to start the conversation.`}
            </p>
          </div>
          
          {/* Optional: Add a subtle prompt */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-sm text-yellow-700 dark:text-yellow-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Type a message below to begin
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[MessageList] Grouped messages:', {
    groupCount: Object.keys(groupedMessages).length,
    groups: Object.entries(groupedMessages).map(([date, msgs]) => ({
      date,
      messageCount: msgs.length,
      messageIds: msgs.map(m => m.id)
    }))
  });

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
