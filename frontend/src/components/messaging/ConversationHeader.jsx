import React, { useState } from 'react';
import { Phone, Video, Info, Users, Briefcase, Search, X } from 'lucide-react';

export function ConversationHeader({ conversation, onStartCall, onShowInfo, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {conversation.avatar ? (
                <img 
                  src={conversation.avatar} 
                  alt={conversation.title || conversation.name || 'Conversation'}
                  className="w-full h-full object-cover"
                />
              ) : conversation.type === 'group' ? (
                <Users className="w-5 h-5 text-muted-foreground" />
              ) : conversation.type === 'business' ? (
                <Briefcase className="w-5 h-5 text-yellow-500" />
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {(conversation.title || conversation.name || '?')[0]}
                </span>
              )}
            </div>
            
            {/* Online indicator for DMs */}
            {conversation.type === 'dm' && conversation.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>

          {/* Name and Status */}
          <div>
            <h2 className="font-semibold text-foreground">
              {conversation.title || conversation.name || 'Conversation'}
            </h2>
            {conversation.type === 'dm' && (
              <p className="text-xs text-muted-foreground">
                {conversation.online ? 'Online' : 'Offline'}
              </p>
            )}
            {conversation.type === 'group' && conversation.members && (
              <p className="text-xs text-muted-foreground">
                {conversation.members} members
              </p>
            )}
            {conversation.type === 'business' && conversation.tag && (
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${conversation.tag === 'New' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''}
                ${conversation.tag === 'Pending' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : ''}
                ${conversation.tag === 'Resolved' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ''}
              `}>
                {conversation.tag}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onSearch && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 hover:bg-muted rounded-lg transition-colors ${searchOpen ? 'text-yellow-500 bg-muted' : 'text-muted-foreground hover:text-foreground'}`}
              title="Search messages"
            >
              <Search size={20} />
            </button>
          )}
          {conversation.type === 'dm' && onStartCall && (
            <>
              <button
                onClick={() => onStartCall('audio')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Audio call"
              >
                <Phone size={20} />
              </button>
              <button
                onClick={() => onStartCall('video')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Video call"
              >
                <Video size={20} />
              </button>
            </>
          )}
          {onShowInfo && (
            <button
              onClick={onShowInfo}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Conversation info"
            >
              <Info size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Search Panel */}
      {searchOpen && (
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in this conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  onSearch(searchQuery);
                }
              }}
              className="flex-1 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoFocus
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  onSearch(searchQuery);
                }
              }}
              disabled={!searchQuery.trim()}
              className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Close search"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
