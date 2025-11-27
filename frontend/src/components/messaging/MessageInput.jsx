import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';

export const MessageInput = ({ onSend, disabled = false, placeholder }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending || disabled) return;
    
    setSending(true);
    
    try {
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4 bg-black/40">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('messages.typeMessage') || 'Type a message...'}
            disabled={disabled || sending}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-banibs-gold resize-none"
            rows={1}
            maxLength={5000}
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-banibs-gold hover:bg-banibs-gold/90 disabled:bg-gray-800 disabled:text-gray-600 text-black transition flex items-center justify-center"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Character count */}
      {message.length > 4500 && (
        <div className="mt-2 text-xs text-right text-gray-500">
          {message.length} / 5000
        </div>
      )}
    </form>
  );
};

export default MessageInput;
