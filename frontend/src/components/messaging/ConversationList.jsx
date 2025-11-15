import React, { useState } from 'react';
import { ConversationListItem } from './ConversationListItem';
import { Search, Plus } from 'lucide-react';

export function ConversationList({ conversations, activeConversationId, onSelect, isLoading, onCreateNew, onDeselectAll }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const name = conv.title || conv.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => {
              console.log('[ConversationList] Messages heading clicked - deselecting all');
              if (onDeselectAll) onDeselectAll();
            }}
            className="text-xl font-bold text-foreground hover:text-yellow-500 transition-colors bg-transparent border-none p-0 text-left"
            title="Back to overview"
          >
            Messages
          </button>
          {onCreateNew && (
            <button 
              onClick={onCreateNew}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="New message"
            >
              <Plus className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-4 py-3 flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {searchQuery 
                ? 'Try searching with a different keyword' 
                : 'Start a new conversation by clicking the + button above'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
