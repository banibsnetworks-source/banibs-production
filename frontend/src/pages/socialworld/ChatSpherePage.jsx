import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ConversationHeader } from '../../components/messaging/ConversationHeader';
import { MessageList } from '../../components/messaging/MessageList';
import { MessageComposer } from '../../components/messaging/MessageComposer';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import ConfirmModal from '../../components/common/ConfirmModal';
import { CreateConversationModal } from '../../components/messaging/CreateConversationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useWorldPersistence } from '../../hooks/useWorldPersistence';
import { ArrowLeft, MessageSquare } from 'lucide-react';

/**
 * BANIBS ChatSphere - Private Conversations
 * 
 * ChatSphere is BANIBS's relational messaging space for:
 * - 1:1 private conversations
 * - Small group chats
 * - Persistent message history
 * 
 * Design Philosophy:
 * - Privacy-first: conversations are between participants only
 * - Relational: built for meaningful connections, not broadcasts
 * - Integrated: accessible from profiles, circles, and social world
 */
const ChatSpherePage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  
  // Persist "chat" as last used world
  useWorldPersistence('chat');
  
  const { conversations, loading: conversationsLoading, markAsRead, refetch: refetchConversations } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
  
  // Find the active conversation object
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  const { messages, loading: messagesLoading, sendMessage, deleteMessage } = useMessages(activeConversationId);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Create conversation modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Sync URL param with state
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversationId && activeConversation?.unread > 0) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, activeConversation?.unread, markAsRead]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    navigate(`/socialworld/chat/${id}`);
  };

  const handleSendMessage = async (text) => {
    await sendMessage(text);
    await refetchConversations();
  };

  const handleDeleteForMe = (message) => {
    setMessageToDelete(message);
    setDeleteMode('me');
    setDeleteModalOpen(true);
  };

  const handleDeleteForEveryone = (message) => {
    setMessageToDelete(message);
    setDeleteMode('everyone');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete || !deleteMode) return;
    
    setIsDeleting(true);
    
    try {
      await deleteMessage(messageToDelete.id, deleteMode);
      setDeleteModalOpen(false);
      setMessageToDelete(null);
      setDeleteMode(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim() || !activeConversationId) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const { messagingApi } = await import('../../utils/messaging');
      const results = await messagingApi.searchMessages(query, activeConversationId);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to search messages');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateConversation = async (conversationData) => {
    try {
      const { messagingApi } = await import('../../utils/messaging');
      const newConversation = await messagingApi.createConversation(conversationData);
      
      await refetchConversations();
      
      setActiveConversationId(newConversation.id);
      navigate(`/socialworld/chat/${newConversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  return (
    <FullWidthLayout>
      <div className="flex flex-col h-screen bg-black" data-theme="dark">
        {/* ChatSphere Header */}
        <div className="flex-shrink-0 bg-gradient-to-b from-gray-900 to-black border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Back to Social World */}
              <button
                onClick={() => navigate('/socialworld')}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
                data-testid="back-to-socialworld"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline text-sm">Social World</span>
              </button>
              
              {/* ChatSphere Branding */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ChatSphere</h1>
                  <p className="text-xs text-gray-500">Private Conversations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chat Interface */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Conversation List */}
          <div className="w-full max-w-[360px] border-r border-gray-800 bg-gray-950 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                isLoading={conversationsLoading}
                activeConversationId={activeConversationId}
                onSelect={handleSelectConversation}
                onCreateNew={() => setCreateModalOpen(true)}
                onDeselectAll={() => {
                  setActiveConversationId(null);
                  navigate('/socialworld/chat');
                }}
              />
            </div>
          </div>

          {/* Right Panel: Message Thread */}
          <div className="flex-1 flex flex-col bg-black">
            {activeConversation ? (
              <>
                <ConversationHeader
                  conversation={activeConversation}
                  onStartCall={(type) => {
                    console.log(`Starting ${type} call with ${activeConversation.name}`);
                  }}
                  onShowInfo={() => {
                    console.log('Show conversation info');
                  }}
                  onSearch={handleSearch}
                />
                
                {/* Search Results Panel */}
                {isSearching || searchResults.length > 0 || searchError ? (
                  <div className="flex-1 overflow-y-auto bg-black p-4">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Search Results
                        </h3>
                        <button
                          onClick={() => {
                            setSearchResults([]);
                            setSearchError(null);
                          }}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      
                      {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-400">Searching messages...</p>
                        </div>
                      ) : searchError ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-red-500 font-semibold mb-1">Search Failed</p>
                          <p className="text-sm text-gray-400">{searchError}</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-white font-semibold mb-1">No messages found</p>
                          <p className="text-sm text-gray-400">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {searchResults.map((message) => (
                            <div
                              key={message.id}
                              className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-amber-500/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-white whitespace-pre-wrap">
                                {message.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    loading={messagesLoading}
                    isGroupChat={activeConversation.type === 'group'}
                    currentUserId={user?.id}
                    onDeleteForMe={handleDeleteForMe}
                    onDeleteForEveryone={handleDeleteForEveryone}
                    conversation={activeConversation}
                  />
                )}
                
                <MessageComposer
                  onSend={handleSendMessage}
                  placeholder={`Message ${activeConversation.title || activeConversation.name || 'here'}...`}
                  onAttachFile={() => {
                    console.log('Attach file');
                  }}
                  onStartVoice={() => {
                    console.log('Start voice note');
                  }}
                />
              </>
            ) : (
              /* Empty State - ChatSphere Welcome */
              <div className="flex flex-1 items-center justify-center p-8 bg-gradient-to-b from-gray-950 to-black">
                <div className="text-center space-y-6 max-w-md">
                  {/* ChatSphere Icon */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                    <MessageSquare size={48} className="text-white" />
                  </div>
                  
                  {/* Welcome Text */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Welcome to ChatSphere
                    </h2>
                    <p className="text-gray-400">
                      {conversations.length === 0 
                        ? "Start private conversations with BANIBS community members"
                        : "Select a conversation or start a new one"
                      }
                    </p>
                  </div>
                  
                  {/* Quick Start Guide */}
                  <div className="p-5 bg-gray-900/50 rounded-xl border border-gray-800">
                    <p className="text-sm font-semibold text-white mb-3">
                      {conversations.length === 0 ? 'Get Started' : 'Quick Actions'}
                    </p>
                    <ul className="text-sm text-gray-400 text-left space-y-2">
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">→</span>
                        <span>Click <strong className="text-white">+</strong> to start a new conversation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">→</span>
                        <span>Create 1:1 chats or small group conversations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">→</span>
                        <span>All messages are private and persistent</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* User Info */}
                  {user && (
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-800">
                      {user?.profile?.avatar_url || user?.avatar_url ? (
                        <img 
                          src={user.profile?.avatar_url || user.avatar_url} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-gray-900 font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setMessageToDelete(null);
            setDeleteMode(null);
          }}
          onConfirm={confirmDelete}
          title={deleteMode === 'everyone' ? 'Delete for Everyone' : 'Delete for Me'}
          message={
            deleteMode === 'everyone'
              ? 'This message will be deleted for all participants. This action cannot be undone.'
              : 'This message will be hidden from your view only. Other participants can still see it.'
          }
          confirmText="Delete"
          cancelText="Cancel"
          destructive={deleteMode === 'everyone'}
          isLoading={isDeleting}
        />
        
        {/* Create Conversation Modal */}
        <CreateConversationModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreateConversation={handleCreateConversation}
        />
      </div>
    </FullWidthLayout>
  );
};

export default ChatSpherePage;
