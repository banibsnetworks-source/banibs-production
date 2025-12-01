import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Settings, UserPlus, LogOut, 
  Globe, Lock, Eye, Crown, Shield, Star
} from 'lucide-react';
import * as groupsApi from '../../../api/groupsApi';

/**
 * GroupDetailPage - View group details and members
 * Phase 8.5 - Groups & Membership Frontend
 */
const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [groupData, membersData] = await Promise.all([
        groupsApi.getGroup(groupId),
        groupsApi.getGroupMembers(groupId, { limit: 100 })
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
    } catch (err) {
      setError(err.message || 'Failed to load group');
      console.error('Load group error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await groupsApi.joinGroup(groupId);
      await loadGroupData();
    } catch (err) {
      alert(err.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }
    
    try {
      await groupsApi.leaveGroup(groupId);
      navigate('/portal/social/groups');
    } catch (err) {
      alert(err.message || 'Failed to leave group');
    }
  };

  const getPrivacyBadge = (privacy) => {
    const badges = {
      PUBLIC: { icon: Globe, text: 'Public', color: 'text-green-400 bg-green-900/30' },
      PRIVATE: { icon: Lock, text: 'Private', color: 'text-yellow-400 bg-yellow-900/30' },
      SECRET: { icon: Eye, text: 'Secret', color: 'text-red-400 bg-red-900/30' }
    };
    
    const badge = badges[privacy] || badges.PUBLIC;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${badge.color}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
  };

  const getRoleIcon = (role) => {
    const icons = {
      OWNER: <Crown size={16} className="text-purple-400" />,
      ADMIN: <Shield size={16} className="text-blue-400" />,
      MODERATOR: <Star size={16} className="text-green-400" />,
      MEMBER: <Users size={16} className="text-gray-400" />
    };
    return icons[role] || icons.MEMBER;
  };

  const canManageGroup = () => {
    return group?.membership && ['OWNER', 'ADMIN'].includes(group.membership.role);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-400"></div>
          <p className="mt-4 text-gray-400">Loading group...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Group not found'}</p>
          <button
            onClick={() => navigate('/portal/social/groups')}
            className="btn-v2 btn-v2-secondary"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/portal/social/groups')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Groups
          </button>
          
          {/* Group Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {group.member_count} members
                </span>
                {getPrivacyBadge(group.privacy)}
              </div>
            </div>
            
            <div className="flex gap-3">
              {group.membership ? (
                <>
                  {canManageGroup() && (
                    <button
                      onClick={() => navigate(`/portal/social/groups/${groupId}/settings`)}
                      className="btn-v2 btn-v2-secondary flex items-center gap-2"
                    >
                      <Settings size={20} />
                      Settings
                    </button>
                  )}
                  
                  <button
                    onClick={handleLeaveGroup}
                    className="btn-v2 btn-v2-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut size={20} />
                    Leave Group
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoinGroup}
                  className="btn-v2 btn-v2-primary flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Join Group
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['about', 'members'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-yellow-400 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="card-v2 p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-300">{group.description}</p>
            </div>

            {group.rules && (
              <div className="card-v2 p-6">
                <h2 className="text-xl font-semibold mb-4">Group Rules</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{group.rules}</p>
              </div>
            )}

            {group.tags && group.tags.length > 0 && (
              <div className="card-v2 p-6">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card-v2 p-6">
            <h2 className="text-xl font-semibold mb-6">Members ({members.length})</h2>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div>
                      <p className="text-white font-medium">Member #{member.user_id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs rounded ${
                    member.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400' :
                    member.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;
