import React, { useState } from 'react';
import { MoreVertical, Trash2, Package, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostTextWithEmojis from '../social/PostTextWithEmojis';
import DropdownMenu, { DropdownMenuItem } from '../common/DropdownMenu';

/**
 * Listing Context Card Component
 * Non-editable system block showing listing context at the start of a conversation
 */
function ListingContextCard({ metadata }) {
  const formatPrice = (price, isFree) => {
    if (isFree || price === 0) return 'Free';
    return `$${price?.toLocaleString() || '0'}`;
  };

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-gray-700 flex items-center gap-2">
          <Package size={14} className="text-amber-500" />
          <span className="text-xs font-medium text-amber-400">Local Exchange Inquiry</span>
        </div>
        
        {/* Content */}
        <div className="p-3 flex gap-3">
          {/* Thumbnail */}
          {metadata?.listing_thumbnail ? (
            <img 
              src={metadata.listing_thumbnail} 
              alt={metadata.listing_title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-gray-500" />
            </div>
          )}
          
          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate mb-1">
              {metadata?.listing_title || 'Listing'}
            </p>
            <p 
              className="text-lg font-bold mb-1"
              style={{ color: metadata?.listing_is_free ? '#22c55e' : '#f59e0b' }}
            >
              {formatPrice(metadata?.listing_price, metadata?.listing_is_free)}
            </p>
            {metadata?.listing_location && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin size={10} />
                {metadata.listing_location}
              </p>
            )}
          </div>
        </div>
        
        {/* Link to listing */}
        {metadata?.listing_link && (
          <Link 
            to={metadata.listing_link}
            className="block px-4 py-2 text-xs text-center text-amber-400 hover:bg-amber-500/10 transition-colors border-t border-gray-700 flex items-center justify-center gap-1"
          >
            View Listing <ExternalLink size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

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
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return 'Invalid time';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid time';
    }
  };

  // Special handling for listing_context type (system block)
  if (message.type === 'listing_context') {
    return (
      <ListingContextCard metadata={message.metadata} />
    );
  }

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
