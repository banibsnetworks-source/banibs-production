import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * MessagesDock - Phase 1 MVP
 * On-page chat experience for BANIBS Social
 * 
 * Desktop: Slide-out panel from right
 * Mobile: Full-screen overlay
 */
const MessagesDock = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for custom open event (for temporary trigger button)
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-messages-dock', handleOpenEvent);
    return () => window.removeEventListener('open-messages-dock', handleOpenEvent);
  }, []);

  // Fetch conversations when dock opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchConversations();
    }
  }, [isOpen, isAuthenticated]);

  // Fetch conversation messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/messages/conversations?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/messages/conversations/${conversationId}/messages?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/messages/conversations/${activeConversation.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: messageText.trim()
          })
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageText('');
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveConversation(null);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Messages Button - Positioned to be clearly visible */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 z-[99999] flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 border-2 border-gray-900"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold">Messages</span>
        </button>
      )}

      {/* Messages Panel/Overlay */}
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={handleClose}
            />
          )}

          {/* Panel */}
          <div
            className={`
              fixed z-[9999] bg-gray-900 border-l border-gray-800 shadow-2xl
              ${isMobile 
                ? 'inset-0' 
                : 'top-0 right-0 bottom-0 w-96'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              {activeConversation && isMobile ? (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
              ) : null}
              
              <h2 className="text-lg font-semibold text-white flex-1">
                {activeConversation ? activeConversation.other_user_name : 'Messages'}
              </h2>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(100%-64px)]">
              {/* Show conversation list or active chat */}
              {!activeConversation || (isMobile && !activeConversation) ? (
                /* Conversation List */
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                      <MessageCircle className="w-12 h-12 mb-2" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation)}
                          className="w-full p-4 hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center">
                              <span className="text-gray-900 font-semibold text-sm">
                                {conversation.other_user_name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white text-sm truncate">
                                  {conversation.other_user_name || 'User'}
                                </span>
                                {conversation.unread_count > 0 && (
                                  <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {conversation.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs truncate">
                                {conversation.last_message_preview || 'Start a conversation'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Active Chat Window */
                <div className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-sm">Loading messages...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-sm">No messages yet</div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isOwn = message.sender_id === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`
                                  max-w-[75%] rounded-2xl px-4 py-2
                                  ${isOwn 
                                    ? 'bg-yellow-500 text-gray-900' 
                                    : 'bg-gray-800 text-white'
                                  }
                                `}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-800"
                  >
                    <div className="flex items-end space-x-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 p-2 rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessagesDock;
