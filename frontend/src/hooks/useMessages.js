import { useState, useEffect } from 'react';
import { messagingApi } from '../utils/messaging';
import { mockUser } from '../utils/messaging/mockApi';

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messagingApi.getMessages(conversationId);
        // Automatically set direction based on senderId
        const messagesWithDirection = data.map(msg => ({
          ...msg,
          direction: msg.senderId === mockUser.id ? 'outgoing' : 'incoming'
        }));
        setMessages(messagesWithDirection);
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (text) => {
    if (!conversationId || !text.trim()) return;

    try {
      const newMessage = await mockApi.sendMessage(conversationId, {
        text: text.trim(),
        type: 'text'
      });
      
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  return { messages, loading, error, sendMessage };
}
