// BANIBS Connect – Mock API v1.0
// Used for Phase 3.0 UI development (DM, Group, Business Inbox)

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {'dm'|'group'|'business'} type
 * @property {string} name
 * @property {string|null} [avatar]
 * @property {number} [members]
 * @property {string} lastMessage
 * @property {string} lastTimestamp
 * @property {number} unread
 * @property {boolean} [online]
 * @property {'New'|'Pending'|'Resolved'} [tag]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} conversationId
 * @property {string} senderId
 * @property {string} [senderName]
 * @property {'incoming'|'outgoing'} [direction]
 * @property {'text'|'emoji'|'image'|'file'|'voice'|'call_event'} type
 * @property {string} [text]
 * @property {string} [mediaUrl]
 * @property {string} [fileName]
 * @property {number} [duration]
 * @property {string} createdAt
 * @property {boolean} [isRead]
 */

export const mockUser = {
  id: "user_001",
  name: "Social Test User",
  avatar: "/static/avatars/default.png"
};

// --- Conversation List ---
export const mockConversations = [
  {
    id: "c_dm_001",
    type: "dm",
    name: "Marcus Johnson",
    avatar: "/static/avatars/marcus.png",
    lastMessage: "Bro you seen this??? 😂😂",
    lastTimestamp: "2025-11-14T11:22:00Z",
    unread: 2,
    online: true
  },
  {
    id: "c_dm_002",
    type: "dm",
    name: "Alicia Brown",
    avatar: "/static/avatars/alicia.png",
    lastMessage: "Got it! 👍🏾",
    lastTimestamp: "2025-11-14T10:41:00Z",
    unread: 0,
    online: false
  },
  {
    id: "c_group_001",
    type: "group",
    name: "Family Chat",
    avatar: null,
    members: 6,
    lastMessage: "Mom: Dinner is at 7.",
    lastTimestamp: "2025-11-13T19:22:00Z",
    unread: 0
  },
  {
    id: "c_group_002",
    type: "group",
    name: "Neighborhood Watch – Zone A",
    avatar: null,
    members: 18,
    lastMessage: "Derrick: Uploading video now…",
    lastTimestamp: "2025-11-13T10:40:00Z",
    unread: 0
  },
  {
    id: "c_business_001",
    type: "business",
    name: "ATL Remodelers - Lisa",
    avatar: "/static/icons/business.png",
    tag: "Pending",
    lastMessage: "Proposal attached—",
    lastTimestamp: "2025-11-13T13:04:00Z",
    unread: 1
  },
  {
    id: "c_business_002",
    type: "business",
    name: "Support Ticket #442",
    avatar: "/static/icons/business.png",
    tag: "New",
    lastMessage: "I need help with my listing.",
    lastTimestamp: "2025-11-13T17:52:00Z",
    unread: 3
  }
];

// --- Messages per Conversation ---
export const mockMessages = {
  c_dm_001: [
    {
      id: "m1",
      conversationId: "c_dm_001",
      senderId: "marcus",
      senderName: "Marcus",
      direction: "incoming",
      type: "text",
      text: "Yo! Check this out",
      createdAt: "2025-11-14T11:20:00Z",
      isRead: true
    },
    {
      id: "m2",
      conversationId: "c_dm_001",
      senderId: "user_001",
      direction: "outgoing",
      type: "text",
      text: "What's up? [emoji:banibs_full_banibs_009]",
      createdAt: "2025-11-14T11:21:00Z",
      isRead: true
    },
    {
      id: "m3",
      conversationId: "c_dm_001",
      senderId: "marcus",
      senderName: "Marcus",
      direction: "incoming",
      type: "text",
      text: "Bro you seen this??? 😂😂",
      createdAt: "2025-11-14T11:22:00Z",
      isRead: false
    }
  ],

  c_dm_002: [
    {
      id: "m4",
      conversationId: "c_dm_002",
      senderId: "user_001",
      direction: "outgoing",
      type: "text",
      text: "Hey Alicia 👋🏾",
      createdAt: "2025-11-14T10:10:00Z",
      isRead: true
    },
    {
      id: "m5",
      conversationId: "c_dm_002",
      senderId: "alicia",
      senderName: "Alicia",
      direction: "incoming",
      type: "text",
      text: "Got it! [emoji:banibs_full_banibs_013]",
      createdAt: "2025-11-14T10:41:00Z",
      isRead: true
    }
  ],

  c_group_001: [
    {
      id: "m6",
      conversationId: "c_group_001",
      senderId: "dad",
      senderName: "Dad",
      direction: "incoming",
      type: "text",
      text: "Hey family! How's everyone doing?",
      createdAt: "2025-11-13T19:20:00Z",
      isRead: true
    },
    {
      id: "m7",
      conversationId: "c_group_001",
      senderId: "mom",
      senderName: "Mom",
      direction: "incoming",
      type: "text",
      text: "Dinner is at 7. Don't be late!",
      createdAt: "2025-11-13T19:22:00Z",
      isRead: true
    },
    {
      id: "m8",
      conversationId: "c_group_001",
      senderId: "user_001",
      direction: "outgoing",
      type: "text",
      text: "I'll be there [emoji:banibs_full_banibs_029]",
      createdAt: "2025-11-13T19:23:00Z",
      isRead: true
    }
  ],

  c_business_001: [
    {
      id: "m9",
      conversationId: "c_business_001",
      senderId: "user_001",
      direction: "outgoing",
      type: "text",
      text: "Hi, I need an estimate for kitchen remodeling",
      createdAt: "2025-11-13T12:50:00Z",
      isRead: true
    },
    {
      id: "m10",
      conversationId: "c_business_001",
      senderId: "lisa",
      senderName: "Lisa (ATL Remodelers)",
      direction: "incoming",
      type: "text",
      text: "Hi! I'd be happy to help. When can we schedule a visit?",
      createdAt: "2025-11-13T13:02:00Z",
      isRead: true
    },
    {
      id: "m11",
      conversationId: "c_business_001",
      senderId: "lisa",
      senderName: "Lisa (ATL Remodelers)",
      direction: "incoming",
      type: "text",
      text: "Proposal attached—",
      createdAt: "2025-11-13T13:04:00Z",
      isRead: false
    }
  ]
};

// Fetch simulation
export const mockApi = {
  getConversations: (): Promise<Conversation[]> =>
    new Promise(resolve => setTimeout(() => resolve(mockConversations), 200)),

  getMessages: (conversationId: string): Promise<Message[]> =>
    new Promise(resolve => 
      setTimeout(() => resolve(mockMessages[conversationId] || []), 200)
    ),

  sendMessage: (conversationId: string, message: Partial<Message>): Promise<Message> =>
    new Promise(resolve =>
      setTimeout(() => {
        const newMessage: Message = {
          id: `m_${Date.now()}`,
          conversationId,
          senderId: mockUser.id,
          direction: 'outgoing',
          type: message.type || 'text',
          text: message.text,
          createdAt: new Date().toISOString(),
          isRead: false,
          ...message
        };
        
        if (!mockMessages[conversationId]) {
          mockMessages[conversationId] = [];
        }
        mockMessages[conversationId].push(newMessage);
        
        // Update conversation last message
        const conv = mockConversations.find(c => c.id === conversationId);
        if (conv) {
          conv.lastMessage = message.text || 'Sent a message';
          conv.lastTimestamp = newMessage.createdAt;
        }
        
        resolve(newMessage);
      }, 150)
    ),

  markAsRead: (conversationId: string): Promise<void> =>
    new Promise(resolve => {
      const conv = mockConversations.find(c => c.id === conversationId);
      if (conv) {
        conv.unread = 0;
      }
      resolve();
    })
};
