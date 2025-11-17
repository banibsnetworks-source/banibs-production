import React, { useState } from 'react';
import { Phone, Video, Info, Users, Briefcase, Search, X, UserCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConversationHeader({ conversation, onStartCall, onShowInfo, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar Section - Enhanced with dual avatars for DMs */}
          <div className="relative flex-shrink-0">
            {conversation.type === 'dm' && conversation.participants && conversation.participants.length > 0 ? (
              // DM: Show both participants side-by-side
              <div className="flex items-center gap-2">
                {/* Current User Avatar */}
                {conversation.currentUserAvatar ? (
                  <div className="w-14 h-14 rounded-full border-2 border-yellow-500/30 overflow-hidden">
                    <img src={conversation.currentUserAvatar} alt="You" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">You</span>
                  </div>
                )}
                
                {/* Arrow/Separator */}
                <div className="text-muted-foreground px-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                
                {/* Other User Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                    {conversation.participants[0]?.avatar_url ? (
                      <img 
                        src={conversation.participants[0].avatar_url} 
                        alt={conversation.participants[0]?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-foreground">
                        {(conversation.participants[0]?.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Online indicator */}
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
              </div>
            ) : conversation.type === 'group' && conversation.participants && conversation.participants.length > 1 ? (
              // Group: Stacked avatars
              <div className="relative w-14 h-14">
                <div className="absolute left-0 top-0 w-11 h-11 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                  {conversation.participants[0]?.avatar_url ? (
                    <img src={conversation.participants[0].avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-foreground">
                      {(conversation.participants[0]?.name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute right-0 bottom-0 w-11 h-11 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                  {conversation.participants[1]?.avatar_url ? (
                    <img src={conversation.participants[1].avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-foreground">
                      {(conversation.participants[1]?.name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              // Fallback single avatar
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {conversation.avatar ? (
                  <img 
                    src={conversation.avatar} 
                    alt={conversation.title || conversation.name || 'Conversation'}
                    className="w-full h-full object-cover"
                  />
                ) : conversation.type === 'group' ? (
                  <Users className="w-7 h-7 text-muted-foreground" />
                ) : conversation.type === 'business' ? (
                  <Briefcase className="w-7 h-7 text-yellow-500" />
                ) : (
                  <span className="text-xl font-semibold text-foreground">
                    {(conversation.title || conversation.name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Name and Status - Enhanced typography */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {conversation.title || conversation.name || 'Conversation'}
            </h2>
            {conversation.type === 'dm' && (
              <p className="text-sm text-muted-foreground">
                {conversation.online ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                ) : 'Offline'}
              </p>
            )}
            {conversation.type === 'group' && (
              <p className="text-sm text-muted-foreground truncate">
                {conversation.participants && conversation.participants.length > 0 ? (
                  <>
                    {conversation.participants.slice(0, 3).map((p, idx) => p.name).join(', ')}
                    {conversation.participants.length > 3 && ` +${conversation.participants.length - 3} more`}
                  </>
                ) : (
                  `${conversation.participantCount || conversation.participant_count || 0} members`
                )}
              </p>
            )}
            {conversation.type === 'business' && conversation.tag && (
              <span className={`
                inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1
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
          {conversation.type === 'group' && conversation.participants && conversation.participants.length > 0 && (
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-2 hover:bg-muted rounded-lg transition-colors ${showParticipants ? 'text-yellow-500 bg-muted' : 'text-muted-foreground hover:text-foreground'}`}
              title="Show group members"
            >
              <Users size={20} />
            </button>
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
      
      {/* Group Participants Panel */}
      {showParticipants && conversation.type === 'group' && conversation.participants && (
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Group Members ({conversation.participant_count})</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {conversation.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{participant.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{participant.email || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
