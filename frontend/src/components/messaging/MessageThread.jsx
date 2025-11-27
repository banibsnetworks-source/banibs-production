import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const tierBadgeColors = {
  Peoples: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Cool: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  Alright: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Others: 'bg-gray-600/20 text-gray-400 border-gray-600/40'
};

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d, h:mm a');
  }
};

export const MessageThread = ({ messages, currentUserId, otherUser, trustTier, loading }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mb-4" />
        <p className="text-gray-400">{t('common.loading') || 'Loading...'}</p>
      </div>
    );
  }
  
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Start the conversation
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Send a message to {otherUser?.name || 'this person'}
          </p>
          {trustTier && (
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                tierBadgeColors[trustTier] || tierBadgeColors.Others
              }`}>
                {trustTier} Connection
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.map((message, index) => {
        const isFromCurrentUser = message.senderId === currentUserId;
        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
        
        return (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar (only show when sender changes) */}
            <div className="w-8 h-8 flex-shrink-0">
              {showAvatar && !isFromCurrentUser && (
                otherUser?.avatar_url || otherUser?.profile_picture_url ? (
                  <img
                    src={otherUser.avatar_url || otherUser.profile_picture_url}
                    alt={otherUser.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                    {(otherUser?.name || 'U')[0].toUpperCase()}
                  </div>
                )
              )}
            </div>
            
            {/* Message Bubble */}
            <div className={`max-w-[70%] flex flex-col ${
              isFromCurrentUser ? 'items-end' : 'items-start'
            }`}>
              <div className={`px-4 py-2 rounded-2xl ${
                isFromCurrentUser
                  ? 'bg-banibs-gold text-black rounded-br-md'
                  : 'bg-gray-800 text-white rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.messageText}
                </p>
              </div>
              
              {/* Timestamp */}
              <span className="text-xs text-gray-500 mt-1 px-2">
                {formatMessageTime(message.timestamp)}
                {isFromCurrentUser && message.readStatus === 'read' && (
                  <span className="ml-1 text-banibs-gold">• Read</span>
                )}
              </span>
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
