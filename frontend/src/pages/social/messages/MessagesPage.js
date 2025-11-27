import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, MessageCircle } from 'lucide-react';

import { ConversationsList } from '../../../components/messaging/ConversationsList';
import { MessageThread } from '../../../components/messaging/MessageThread';
import { MessageInput } from '../../../components/messaging/MessageInput';

import {
  getConversationPreviews,
  getConversationThread,
  sendMessage,
  markConversationRead
} from '../../../api/messagingApi';

export const MessagesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [trustTier, setTrustTier] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  
  // Load conversations list
  useEffect(() => {
    if (!user?.id) return;
    loadConversations();
  }, [user?.id]);
  
  // Load selected conversation
  useEffect(() => {
    if (!selectedUserId || !user?.id) {
      setMessages([]);
      setOtherUser(null);
      return;
    }
    
    loadConversation(selectedUserId);
  }, [selectedUserId, user?.id]);
  
  const loadConversations = async () => {
    setLoadingConversations(true);
    setError(null);
    
    try {
      const previews = await getConversationPreviews();
      setConversations(previews);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const loadConversation = async (otherUserId) => {
    setLoadingMessages(true);
    setError(null);
    
    try {
      const thread = await getConversationThread(otherUserId);
      setMessages(thread);
      
      // Get other user info from conversations or first message
      if (thread.length > 0) {
        setTrustTier(thread[0].trustTierContext);
        
        // Find user info from conversations list
        const conv = conversations.find(c => c.otherUserId === otherUserId);
        if (conv) {
          setOtherUser({
            id: conv.otherUserId,
            name: conv.otherUserName,
            avatar_url: conv.otherUserAvatar
          });
        } else {
          // Fallback if not in conversations list yet
          setOtherUser({
            id: otherUserId,
            name: 'User'
          });
        }
      }
      
      // Mark as read
      await markConversationRead(otherUserId);
      
      // Refresh conversations to update unread count
      loadConversations();
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const handleSendMessage = async (messageText) => {
    if (!selectedUserId) return;
    
    try {
      const newMessage = await sendMessage(selectedUserId, messageText);
      setMessages(prev => [...prev, newMessage]);
      
      // Refresh conversations list
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };
  
  const handleConversationClick = (conv) => {
    navigate(`/portal/social/messages/${conv.otherUserId}`);
  };
  
  const handleBack = () => {
    navigate('/portal/social/messages');
  };
  
  // Mobile: Show list or thread based on selection
  const showList = !selectedUserId;
  const showThread = !!selectedUserId;
  
  return (
    <div className=\"h-screen flex flex-col bg-black\">
      {/* Header */}
      <div className=\"border-b border-gray-800 bg-gradient-to-b from-black to-gray-900/50 flex-shrink-0\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">
          <div className=\"flex items-center gap-4\">
            {showThread && (
              <button
                onClick={handleBack}
                className=\"lg:hidden flex items-center gap-2 text-gray-400 hover:text-banibs-gold transition\"
              >
                <ArrowLeft className=\"w-5 h-5\" />
              </button>
            )}
            
            <div className=\"flex-1\">
              <h1 className=\"text-3xl sm:text-4xl font-bold bg-gradient-to-r from-banibs-gold via-yellow-400 to-banibs-gold bg-clip-text text-transparent\">
                {showThread && otherUser ? otherUser.name : t('messages.title') || 'Messages'}
              </h1>
              {showThread && trustTier && (
                <p className=\"text-sm text-gray-400 mt-1\">
                  {trustTier} Connection
                </p>
              )}
            </div>
            
            <MessageCircle className=\"w-8 h-8 text-banibs-gold\" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className=\"flex-1 flex overflow-hidden\">
        {/* Conversations List (Desktop: always visible, Mobile: only when no selection) */}
        <div className={`w-full lg:w-96 border-r border-gray-800 flex flex-col bg-black overflow-hidden ${\n          showThread ? 'hidden lg:flex' : 'flex'\n        }`}>\n          <div className=\"flex-1 overflow-y-auto\">\n            <ConversationsList\n              conversations={conversations}\n              loading={loadingConversations}\n              onConversationClick={handleConversationClick}\n            />\n          </div>\n        </div>\n        \n        {/* Message Thread (Desktop: always visible, Mobile: only when selected) */}\n        <div className={`flex-1 flex flex-col overflow-hidden ${\n          showList ? 'hidden lg:flex' : 'flex'\n        }`}>\n          {!selectedUserId ? (\n            <div className=\"flex-1 flex items-center justify-center p-8\">\n              <div className=\"text-center\">\n                <div className=\"w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4\">\n                  <MessageCircle className=\"w-8 h-8 text-gray-600\" />\n                </div>\n                <h3 className=\"text-xl font-semibold text-gray-300 mb-2\">\n                  Select a conversation\n                </h3>\n                <p className=\"text-gray-500\">\n                  Choose a conversation from the list to start messaging\n                </p>\n              </div>\n            </div>\n          ) : (\n            <>\n              <div className=\"flex-1 overflow-y-auto px-4\">\n                <MessageThread\n                  messages={messages}\n                  currentUserId={user?.id}\n                  otherUser={otherUser}\n                  trustTier={trustTier}\n                  loading={loadingMessages}\n                />\n              </div>\n              \n              <MessageInput onSend={handleSendMessage} />\n            </>\n          )}\n        </div>\n      </div>\n      
      {/* Error Display */}\n      {error && (\n        <div className=\"fixed bottom-4 right-4 bg-red-900/90 border border-red-500/50 rounded-xl px-4 py-3 shadow-lg\">\n          <p className=\"text-red-200 text-sm\">{error}</p>\n        </div>\n      )}\n    </div>\n  );
};

export default MessagesPage;
