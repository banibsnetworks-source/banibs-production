import React, { useState } from 'react';
import { ConversationListItem } from './ConversationListItem';
import { Search, Plus } from 'lucide-react';

export function ConversationList({ conversations, activeConversationId, onSelect, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="New message"
          >
            <Plus className="w-5 h-5 text-foreground" />
          </button>
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
          <div className="p-8 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
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
