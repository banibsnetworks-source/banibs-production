import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations.ts';
import { useMessages } from '../../hooks/useMessages.ts';
import { ConversationList } from '../../components/messaging/ConversationList.tsx';
import { ConversationHeader } from '../../components/messaging/ConversationHeader.tsx';
import { MessageList } from '../../components/messaging/MessageList.tsx';
import { MessageComposer } from '../../components/messaging/MessageComposer.tsx';

export function MessagingHomePage() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  
  const { conversations, loading: conversationsLoading, markAsRead } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  
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

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    navigate(`/messages/${id}`);
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Left Sidebar: Conversation List */}
      <div className="w-full max-w-[360px] border-r border-border bg-muted/40">
        <ConversationList
          conversations={conversations}
          isLoading={conversationsLoading}
          activeConversationId={activeConversationId}
          onSelect={handleSelectConversation}
        />
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
              placeholder={`Message ${activeConversation.name}...`}
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
  );
}
