import React, { useState } from 'react';
import { X, Search, Users, User } from 'lucide-react';

export function CreateConversationModal({ isOpen, onClose, onCreateConversation }) {
  const [step, setStep] = useState(1); // 1: type selection, 2: participant selection
  const [conversationType, setConversationType] = useState('dm');
  const [groupTitle, setGroupTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  
  // Mock users - in production, this would come from an API
  const [availableUsers] = useState([
    { id: 'user_2', display_name: 'Alice Johnson', avatar: null },
    { id: 'user_3', display_name: 'Bob Smith', avatar: null },
    { id: 'user_4', display_name: 'Carol Williams', avatar: null },
    { id: 'user_5', display_name: 'David Brown', avatar: null },
  ]);

  const filteredUsers = availableUsers.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setStep(1);
    setConversationType('dm');
    setGroupTitle('');
    setSearchQuery('');
    setSelectedParticipants([]);
    setIsCreating(false);
    setError(null);
    onClose();
  };

  const handleSelectType = (type) => {
    setConversationType(type);
    setStep(2);
  };

  const toggleParticipant = (user) => {
    if (selectedParticipants.find(p => p.id === user.id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== user.id));
    } else {
      if (conversationType === 'dm' && selectedParticipants.length >= 1) {
        // For DMs, only allow one participant
        setSelectedParticipants([user]);
      } else {
        setSelectedParticipants([...selectedParticipants, user]);
      }
    }
  };

  const handleCreate = async () => {
    if (selectedParticipants.length === 0) return;
    if (conversationType === 'group' && !groupTitle.trim()) return;

    setIsCreating(true);
    setError(null);
    
    console.log('[CreateConversationModal] Creating conversation with data:', {
      type: conversationType,
      participant_ids: selectedParticipants.map(p => p.id),
      title: conversationType === 'group' ? groupTitle : null,
    });
    
    try {
      const result = await onCreateConversation({
        type: conversationType,
        participant_ids: selectedParticipants.map(p => p.id),
        title: conversationType === 'group' ? groupTitle : null,
      });
      console.log('[CreateConversationModal] Conversation created successfully:', result);
      handleClose();
    } catch (error) {
      console.error('[CreateConversationModal] Failed to create conversation:', error);
      setError(error.message || 'Failed to create conversation. Please try again.');
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {step === 1 ? 'New Conversation' : conversationType === 'dm' ? 'New Direct Message' : 'New Group'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 ? (
            // Step 1: Type Selection
            <div className="space-y-3">
              <button
                onClick={() => handleSelectType('dm')}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-yellow-500 transition-colors text-left flex items-center space-x-3"
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Direct Message</h3>
                  <p className="text-sm text-muted-foreground">Start a private conversation</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectType('group')}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-yellow-500 transition-colors text-left flex items-center space-x-3"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Group Chat</h3>
                  <p className="text-sm text-muted-foreground">Create a group conversation</p>
                </div>
              </button>
            </div>
          ) : (
            // Step 2: Participant Selection
            <div className="space-y-4">
              {conversationType === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group name..."
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {conversationType === 'dm' ? 'Select Person' : 'Add Participants'} *
                </label>
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Selected Participants */}
                {selectedParticipants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
                    {selectedParticipants.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-1 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium"
                      >
                        <span>{user.display_name}</span>
                        <button
                          onClick={() => toggleParticipant(user)}
                          className="hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* User List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredUsers.map(user => {
                    const isSelected = selectedParticipants.find(p => p.id === user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleParticipant(user)}
                        className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                          isSelected
                            ? 'bg-yellow-500/20 border border-yellow-500'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {user.display_name}
                        </span>
                        {isSelected && (
                          <div className="ml-auto w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Footer */}
        {step === 2 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={
                selectedParticipants.length === 0 ||
                (conversationType === 'group' && !groupTitle.trim()) ||
                isCreating
              }
              className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
