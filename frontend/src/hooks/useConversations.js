import { useState, useEffect } from 'react';
import { mockApi } from '../utils/messaging/mockApi';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getConversations();
        setConversations(data);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const markAsRead = async (conversationId) => {
    await mockApi.markAsRead(conversationId);
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  };

  return { conversations, loading, error, markAsRead };
}
