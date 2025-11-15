import React from 'react';
import { Users, Briefcase } from 'lucide-react';

export function ConversationListItem({ conversation, isActive, onClick }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return 'Invalid time';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // Handle future dates (clock skew)
      if (diffMs < 0) {
        console.warn('Future timestamp detected:', timestamp, 'diff:', diffMs);
        return 'Just now';
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // For older messages, show date
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid time';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-3 flex items-start space-x-3
        border-l-2 transition-all
        hover:bg-muted/50
        ${isActive 
          ? 'bg-yellow-500/10 border-l-yellow-500' 
          : 'border-l-transparent'
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {conversation.avatar ? (
            <img 
              src={conversation.avatar} 
              alt={conversation.title || conversation.name || 'Conversation'}
              className="w-full h-full object-cover"
            />
          ) : conversation.type === 'group' ? (
            <Users className="w-6 h-6 text-muted-foreground" />
          ) : conversation.type === 'business' ? (
            <Briefcase className="w-6 h-6 text-yellow-500" />
          ) : (
            <span className="text-lg font-semibold text-foreground">
              {(conversation.title || conversation.name || '?')[0]}
            </span>
          )}
        </div>
        
        {/* Online indicator for DMs */}
        {conversation.type === 'dm' && conversation.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {conversation.title || conversation.name || 'Conversation'}
            </h3>
            {conversation.type === 'business' && conversation.tag && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full font-medium
                ${conversation.tag === 'New' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''}
                ${conversation.tag === 'Pending' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : ''}
                ${conversation.tag === 'Resolved' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ''}
              `}>
                {conversation.tag}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message_preview || 'No messages yet'}
          </p>
          {conversation.unread > 0 && (
            <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
              {conversation.unread}
            </span>
          )}
        </div>
        
        {conversation.type === 'group' && conversation.members && (
          <p className="text-xs text-muted-foreground mt-1">
            {conversation.members} members
          </p>
        )}
      </div>
    </button>
  );
}
