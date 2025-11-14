import React, { useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import PostTextWithEmojis from '../social/PostTextWithEmojis';
import DropdownMenu, { DropdownMenuItem } from '../common/DropdownMenu';

export function MessageBubble({ 
  message, 
  showSender = false, 
  currentUserId = null,
  onDeleteForMe = null,
  onDeleteForEveryone = null
}) {
  const isOutgoing = message.direction === 'outgoing';
  const isSender = currentUserId && message.sender_id === currentUserId;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'} relative`}>
        {/* Sender name for group chats */}
        {showSender && !isOutgoing && message.senderName && (
          <p className="text-xs text-muted-foreground mb-1 ml-3">
            {message.senderName}
          </p>
        )}
        
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl relative
            ${isOutgoing 
              ? 'bg-yellow-500 text-black rounded-br-md' 
              : 'bg-muted text-foreground rounded-bl-md'
            }
          `}
        >
          {message.type === 'text' && message.text && (
            <PostTextWithEmojis 
              text={message.text}
              className="text-sm leading-relaxed"
            />
          )}
          
          {message.type === 'image' && message.mediaUrl && (
            <img 
              src={message.mediaUrl} 
              alt="Shared image"
              className="rounded-lg max-w-full"
            />
          )}
          
          {message.type === 'file' && message.fileName && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">{message.fileName}</span>
            </div>
          )}
          
          {/* Delete menu - show on hover */}
          {(onDeleteForMe || onDeleteForEveryone) && (
            <div className={`absolute top-1 ${isOutgoing ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <DropdownMenu
                trigger={
                  <button className={`p-1 rounded hover:bg-black/10 transition-colors ${isOutgoing ? 'text-black/60 hover:text-black' : 'text-muted-foreground hover:text-foreground'}`}>
                    <MoreVertical size={14} />
                  </button>
                }
                align={isOutgoing ? "left" : "right"}
              >
                {onDeleteForMe && (
                  <DropdownMenuItem
                    icon={Trash2}
                    label="Delete for Me"
                    onClick={() => onDeleteForMe(message)}
                  />
                )}
                {isSender && onDeleteForEveryone && (
                  <DropdownMenuItem
                    icon={Trash2}
                    label="Delete for Everyone"
                    destructive
                    onClick={() => onDeleteForEveryone(message)}
                  />
                )}
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-muted-foreground mt-1 ${isOutgoing ? 'text-right mr-3' : 'ml-3'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
