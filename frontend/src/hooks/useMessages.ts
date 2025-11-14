import { useState, useEffect } from 'react';
import { mockApi, Message, mockUser } from '../utils/messaging/mockApi';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getMessages(conversationId);
        // Automatically set direction based on senderId
        const messagesWithDirection = data.map(msg => ({
          ...msg,
          direction: msg.senderId === mockUser.id ? 'outgoing' as const : 'incoming' as const
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

  const sendMessage = async (text: string) => {
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
