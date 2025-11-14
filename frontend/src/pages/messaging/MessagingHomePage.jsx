import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ConversationHeader } from '../../components/messaging/ConversationHeader';
import { MessageList } from '../../components/messaging/MessageList';
import { MessageComposer } from '../../components/messaging/MessageComposer';
import GlobalNavBar from '../../components/GlobalNavBar';

export function MessagingHomePage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
  const { conversations, loading: conversationsLoading, markAsRead } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
  
  // Find the active conversation object
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  const { messages, loading: messagesLoading, sendMessage } = useMessages(activeConversationId);

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
            />
            <MessageList
              messages={messages}
              loading={messagesLoading}
              isGroupChat={activeConversation.type === 'group'}
            />
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
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-foreground">
                BANIBS Connect
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select a conversation from the left to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
