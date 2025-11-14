import { useState, useEffect } from 'react';
import { messagingApi } from '../utils/messaging';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🎣 [useConversations] Hook initialized');
    console.log('🔍 [useConversations] Checking localStorage on mount:', {
      hasAccessToken: !!localStorage.getItem('access_token'),
      allKeys: Object.keys(localStorage)
    });
    
    const fetchConversations = async () => {
      try {
        console.log('📞 [useConversations] Starting to fetch conversations...');
        setLoading(true);
        const data = await messagingApi.getConversations();
        console.log('✅ [useConversations] Conversations fetched successfully:', data?.length || 0, 'conversations');
        setConversations(data);
      } catch (err) {
        console.error('❌ [useConversations] Failed to fetch conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const markAsRead = async (conversationId) => {
    await messagingApi.markAsRead(conversationId);
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  };

  return { conversations, loading, error, markAsRead };
}
