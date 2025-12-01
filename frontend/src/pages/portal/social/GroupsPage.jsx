import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Lock, Globe, Eye, Filter } from 'lucide-react';
import * as groupsApi from '../../../api/groupsApi';

/**
 * GroupsPage - Browse and discover groups
 * Phase 8.5 - Groups & Membership Frontend
 */
const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [privacyFilter]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        privacy: privacyFilter,
        search: searchQuery,
        limit: 50
      };
      
      const data = await groupsApi.listGroups(filters);
      setGroups(data);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
      console.error('Load groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGroups();
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupsApi.joinGroup(groupId);
      // Reload groups to update membership status
      loadGroups();
    } catch (err) {
      alert(err.message || 'Failed to join group');
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'PUBLIC':
        return <Globe size={16} className="text-green-400" />;
      case 'PRIVATE':
        return <Lock size={16} className="text-yellow-400" />;
      case 'SECRET':
        return <Eye size={16} className="text-red-400" />;
      default:
        return <Globe size={16} className="text-gray-400" />;
    }
  };

  const getMembershipBadge = (membership) => {
    if (!membership) return null;
    
    const roleColors = {
      OWNER: 'bg-purple-600',
      ADMIN: 'bg-blue-600',
      MODERATOR: 'bg-green-600',
      MEMBER: 'bg-gray-600'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded ${roleColors[membership.role]} text-white`}>
        {membership.role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users size={28} className="text-yellow-400" />
              <h1 className="text-2xl font-bold">Groups</h1>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-v2 btn-v2-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Group
            </button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="input-v2 w-full pl-10"
                />
              </div>
            </form>
            
            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
              className="input-v2"
            >
              <option value="">All Privacy Levels</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-400"></div>
            <p className="mt-4 text-gray-400">Loading groups...</p>
          </div>
        )}

        {/* Groups Grid */}
        {!loading && groups.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No groups found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new group</p>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="card-v2 hover:border-yellow-400/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/portal/social/groups/${group.id}`)}
              >
                {/* Cover Image or Placeholder */}
                <div className="h-32 bg-gradient-to-br from-yellow-900/20 to-blue-900/20 rounded-t-lg flex items-center justify-center">
                  {group.cover_image ? (
                    <img src={group.cover_image} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={48} className="text-gray-600" />
                  )}
                </div>

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white truncate flex-1">
                      {group.name}
                    </h3>
                    {getPrivacyIcon(group.privacy)}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {group.description}
                  </p>

                  {/* Tags */}
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users size={16} />
                      <span>{group.member_count} members</span>
                    </div>
                    
                    {getMembershipBadge(group.membership)}
                  </div>

                  {/* Join Button */}
                  {!group.membership && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                      className="btn-v2 btn-v2-secondary w-full mt-3"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      )}
    </div>
  );
};

/**
 * CreateGroupModal - Modal for creating a new group
 */
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'PUBLIC',
    rules: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const groupData = {
        name: formData.name,
        description: formData.description,
        privacy: formData.privacy,
        rules: formData.rules || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };
      
      await groupsApi.createGroup(groupData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card-v2 max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Group</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-v2 w-full"
                placeholder="Enter group name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                maxLength={1000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-v2 w-full h-24 resize-none"
                placeholder="Describe your group..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy Level *
              </label>
              <select
                value={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                className="input-v2 w-full"
              >
                <option value="PUBLIC">Public - Anyone can join</option>
                <option value="PRIVATE">Private - Requires approval</option>
                <option value="SECRET">Secret - Invitation only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Rules (Optional)
              </label>
              <textarea
                maxLength={5000}
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="input-v2 w-full h-24 resize-none"
                placeholder="Set guidelines for your group..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-v2 w-full"
                placeholder="e.g. business, networking, tech (comma-separated)"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-v2 btn-v2-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-v2 btn-v2-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
