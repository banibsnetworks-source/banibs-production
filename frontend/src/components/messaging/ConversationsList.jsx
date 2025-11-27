import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const tierColors = {
  Peoples: 'border-l-emerald-500',
  Cool: 'border-l-sky-500',
  Alright: 'border-l-amber-500',
  Others: 'border-l-gray-500'
};

export const ConversationsList = ({ conversations, loading, onConversationClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mb-4" />
        <p className="text-gray-400">{t('messages.loading') || 'Loading messages...'}</p>
      </div>
    );
  }
  
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          {t('messages.noMessages') || 'No messages yet'}
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Start a conversation with someone from your connections
        </p>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-800">
      {conversations.map((conv) => {
        const isUnread = conv.unreadCount > 0;
        const tierColor = tierColors[conv.trustTierContext] || tierColors.Others;
        
        return (
          <button
            key={conv.conversationKey}
            onClick={() => onConversationClick ? onConversationClick(conv) : navigate(`/portal/social/messages/${conv.otherUserId}`)}
            className={`w-full flex items-start gap-4 p-4 text-left border-l-4 ${tierColor} hover:bg-gray-900/50 transition ${
              isUnread ? 'bg-gray-900/30' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conv.otherUserAvatar ? (
                <img
                  src={conv.otherUserAvatar}
                  alt={conv.otherUserName || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-banibs-gold/60 to-banibs-bronze/70 flex items-center justify-center text-black font-bold">
                  {(conv.otherUserName || 'U')[0].toUpperCase()}
                </div>
              )}
              {isUnread && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-banibs-gold rounded-full flex items-center justify-center text-black text-xs font-bold">
                  {conv.unreadCount}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className={`font-semibold truncate ${
                  isUnread ? 'text-white' : 'text-gray-300'
                }`}>
                  {conv.otherUserName || 'Unknown User'}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(conv.lastTimestamp), { addSuffix: true })}
                </span>
              </div>
              
              <p className={`text-sm truncate ${
                isUnread ? 'text-gray-300 font-medium' : 'text-gray-500'
              }`}>
                {conv.lastSenderId === conv.otherUserId ? '' : 'You: '}
                {conv.lastMessageText}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationsList;
