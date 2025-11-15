import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ConversationHeader } from '../../components/messaging/ConversationHeader';
import { MessageList } from '../../components/messaging/MessageList';
import { MessageComposer } from '../../components/messaging/MessageComposer';
import GlobalNavBar from '../../components/GlobalNavBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { CreateConversationModal } from '../../components/messaging/CreateConversationModal';
import { useAuth } from '../../contexts/AuthContext';

export function MessagingHomePage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  
  const { conversations, loading: conversationsLoading, markAsRead, refetch: refetchConversations } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
  
  // Find the active conversation object
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  const { messages, loading: messagesLoading, sendMessage, deleteMessage } = useMessages(activeConversationId);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null); // 'me' or 'everyone'
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
  }, [conversationId]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversationId && activeConversation?.unread > 0) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, activeConversation?.unread]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    navigate(`/messages/${id}`);
  };

  const handleSendMessage = (text) => {
    sendMessage(text);
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
      // Keep modal open to show error
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
    console.log('[MessagingHomePage] handleCreateConversation called with:', conversationData);
    try {
      const { messagingApi } = await import('../../utils/messaging');
      console.log('[MessagingHomePage] Calling messagingApi.createConversation...');
      const newConversation = await messagingApi.createConversation(conversationData);
      console.log('[MessagingHomePage] New conversation created:', newConversation);
      
      // Refresh conversations list to show the new conversation
      console.log('[MessagingHomePage] Refreshing conversation list...');
      await refetchConversations();
      
      // Navigate to the new conversation
      setActiveConversationId(newConversation.id);
      console.log('[MessagingHomePage] Navigating to:', `/messages/${newConversation.id}`);
      navigate(`/messages/${newConversation.id}`);
    } catch (error) {
      console.error('[MessagingHomePage] Failed to create conversation:', error);
      console.error('[MessagingHomePage] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  };

  return (
    <>
      <GlobalNavBar />
      <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Left Sidebar: Conversation List */}
      <div className="w-full max-w-[360px] border-r border-border bg-muted/40 flex flex-col">
        {/* Header with New Conversation Button */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => {
                // For now, create a demo conversation
                const demoConv = {
                  id: 'demo-' + Date.now(),
                  title: 'Demo Chat',
                  type: 'dm',
                  last_message_preview: 'Start typing to test messaging...',
                  last_message_at: new Date().toISOString(),
                  participant_ids: ['demo-user']
                };
                // This is a temporary hack - in Phase 3.3 we'll add proper UI
                alert('Creating demo conversation...');
              }}
              className="p-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition"
              title="New conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            isLoading={conversationsLoading}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            onCreateNew={() => setCreateModalOpen(true)}
          />
        </div>
      </div>

      {/* Right Panel: Message Thread */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <ConversationHeader
              conversation={activeConversation}
              onStartCall={(type) => {
                console.log(`Starting ${type} call with ${activeConversation.name}`);
                // TODO: Wire to WebRTC in Phase 3.4
              }}
              onShowInfo={() => {
                console.log('Show conversation info');
                // TODO: Wire to info panel in Phase 3.1
              }}
              onSearch={handleSearch}
            />
            
            {/* Search Results Panel */}
            {isSearching || searchResults.length > 0 || searchError ? (
              <div className="flex-1 overflow-y-auto bg-background p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Search Results
                    </h3>
                    <button
                      onClick={() => {
                        setSearchResults([]);
                        setSearchError(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {isSearching ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-8 text-red-500">
                      {searchError}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((message) => (
                        <div
                          key={message.id}
                          className="p-4 bg-card border border-border rounded-lg hover:border-yellow-500 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
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
              />
            )}
            
            <MessageComposer
              onSend={handleSendMessage}
              placeholder={`Message ${activeConversation.title || activeConversation.name || 'here'}...`}
              onAttachFile={() => {
                console.log('Attach file');
                // TODO: Wire to file upload in Phase 3.3
              }}
              onStartVoice={() => {
                console.log('Start voice note');
                // TODO: Wire to voice recording in Phase 3.3
              }}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 bg-muted/20">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  BANIBS Connect
                </h2>
                <p className="text-muted-foreground">
                  {conversations.length === 0 
                    ? "Start chatting with other BANIBS members"
                    : "Select a conversation to start messaging"
                  }
                </p>
              </div>
              {conversations.length === 0 && (
                <div className="mt-6 p-5 bg-card rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Get Started
                  </p>
                  <ul className="text-sm text-muted-foreground text-left space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">→</span>
                      <span>Click the <strong>+</strong> button to create a new conversation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">→</span>
                      <span>Start a Direct Message or Group Chat</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">→</span>
                      <span>Connect with BANIBS community members</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
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
    </>
  );
}
