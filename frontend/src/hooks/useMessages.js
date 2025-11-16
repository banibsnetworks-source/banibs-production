import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { messagingApi } from '../utils/messaging';

export function useMessages(conversationId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  console.log('[useMessages] Hook called with:', { 
    conversationId, 
    userId: user?.id,
    messagesCount: messages.length 
  });

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        console.log('[useMessages] Fetching messages for conversation:', conversationId);
        setLoading(true);
        const data = await messagingApi.getMessages(conversationId);
        console.log('[useMessages] Received messages from API:', {
          count: data.length,
          messages: data
        });
        
        // Automatically set direction based on senderId
        const messagesWithDirection = data.map(msg => ({
          ...msg,
          direction: msg.senderId === user?.id ? 'outgoing' : 'incoming'
        }));
        
        console.log('[useMessages] Messages with direction:', {
          userId: user?.id,
          messagesWithDirection
        });
        
        setMessages(messagesWithDirection);
      } catch (err) {
        setError('Failed to load messages');
        console.error('[useMessages] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (text) => {
    if (!conversationId || !text.trim()) return;

    try {
      const newMessage = await messagingApi.sendMessage(conversationId, {
        type: 'text',
        text: text.trim()
      });
      
      // Add direction field based on current user
      const messageWithDirection = {
        ...newMessage,
        direction: newMessage.senderId === user?.id ? 'outgoing' : 'incoming'
      };
      
      console.log('[useMessages] New message sent:', messageWithDirection);
      setMessages(prev => [...prev, messageWithDirection]);
    } catch (err) {
      setError('Failed to send message');
      console.error('[useMessages] Send message error:', err);
    }
  };

  const deleteMessage = async (messageId, mode) => {
    if (!messageId || !mode) return;

    try {
      if (mode === 'me') {
        await messagingApi.deleteMessageForMe(messageId);
        // Remove from local state
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else if (mode === 'everyone') {
        const updatedMessage = await messagingApi.deleteMessageForEveryone(messageId);
        // Update message to show deleted state
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, text: '[This message was deleted]', deleted: true } : m
        ));
      }
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage, deleteMessage };
}
