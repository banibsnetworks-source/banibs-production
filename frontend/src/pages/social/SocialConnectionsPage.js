import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SocialLayout from '../../components/social/SocialLayout';
import ConnectionCard from '../../components/connections/ConnectionCard';
import SearchInputV2 from '../../components/common/SearchInputV2';
import ComingSoonV2 from '../../components/common/ComingSoonV2';

/**
 * SocialConnectionsPage - Phase 8.2
 * Full connections management with live relationship engine
 * Uses BANIBS UI v2.0 design system
 * Phase L.0 - i18n integrated
 */
const SocialConnectionsPage = () => {
  const { t } = useTranslation();
  // State management
  const [relationships, setRelationships] = useState([]);
  const [relationshipCounts, setRelationshipCounts] = useState({
    peoples: 0,
    cool: 0,
    alright: 0,
    others: 0,
    blocked: 0
  });
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('access_token');

  // Fetch relationship counts
  const fetchCounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/relationships/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch counts');
      }

      const data = await response.json();
      setRelationshipCounts(data);
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  // Fetch relationships
  const fetchRelationships = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/api/relationships`;
      
      // Add tier filter if not "ALL"
      if (selectedTier !== 'ALL' && selectedTier !== 'BLOCKED') {
        url += `?tier=${selectedTier}`;
      } else if (selectedTier === 'BLOCKED') {
        url += `?status=BLOCKED`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch relationships');
      }

      const data = await response.json();
      
      // Fetch user details for each relationship
      const relationshipsWithUsers = await Promise.all(
        data.map(async (rel) => {
          try {
            const userResponse = await fetch(
              `${API_URL}/api/users/${rel.target_user_id}/public`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return { ...rel, user: userData };
            }
            return rel;
          } catch {
            return rel;
          }
        })
      );

      setRelationships(relationshipsWithUsers);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle tier change
  const handleChangeTier = async (targetUserId, newTier) => {
    try {
      const response = await fetch(`${API_URL}/api/relationships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          tier: newTier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update tier');
      }

      // Optimistic update
      setRelationships(prev =>
        prev.map(rel =>
          rel.target_user_id === targetUserId
            ? { ...rel, tier: newTier }
            : rel
        )
      );

      // Refresh counts
      await fetchCounts();
    } catch (err) {
      console.error('Error changing tier:', err);
      alert('Failed to update relationship tier');
    }
  };

  // Handle block
  const handleBlock = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/relationships/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: targetUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      // Refresh list
      await fetchRelationships();
      await fetchCounts();
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user');
    }
  };

  // Handle unblock
  const handleUnblock = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/relationships/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: targetUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }

      // Refresh list
      await fetchRelationships();
      await fetchCounts();
    } catch (err) {
      console.error('Error unblocking user:', err);
      alert('Failed to unblock user');
    }
  };

  // Handle remove
  const handleRemove = async (targetUserId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/relationships/${targetUserId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove connection');
      }

      // Remove from list
      setRelationships(prev =>
        prev.filter(rel => rel.target_user_id !== targetUserId)
      );

      // Refresh counts
      await fetchCounts();
    } catch (err) {
      console.error('Error removing connection:', err);
      alert('Failed to remove connection');
    }
  };

  // Add connection from search
  const handleAddConnection = async (userId, tier = 'ALRIGHT') => {
    try {
      const response = await fetch(`${API_URL}/api/relationships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: userId,
          tier: tier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add connection');
      }

      // Clear search and refresh
      setSearchQuery('');
      setSearchResults([]);
      await fetchRelationships();
      await fetchCounts();
    } catch (err) {
      console.error('Error adding connection:', err);
      alert('Failed to add connection');
    }
  };

  // Effects
  useEffect(() => {
    fetchCounts();
    fetchRelationships();
  }, [selectedTier]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Render tier filter buttons
  const renderTierFilters = () => {
    const tiers = [
      { key: 'ALL', label: 'All', count: relationships.length },
      { key: 'PEOPLES', label: 'Peoples', count: relationshipCounts.peoples },
      { key: 'COOL', label: 'Cool', count: relationshipCounts.cool },
      { key: 'ALRIGHT', label: 'Alright', count: relationshipCounts.alright },
      { key: 'OTHERS', label: 'Others', count: relationshipCounts.others },
      { key: 'BLOCKED', label: 'Blocked', count: relationshipCounts.blocked }
    ];

    return (
      <div className="flex flex-wrap gap-2 breathing-room-lg">
        {tiers.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSelectedTier(key)}
            className={`btn-v2 ${
              selectedTier === key ? 'btn-v2-primary' : 'btn-v2-secondary'
            } btn-v2-sm`}
          >
            {label} {count > 0 && `(${count})`}
          </button>
        ))}
      </div>
    );
  };

  return (
    <SocialLayout>
      <div className="container-v2 section-v2 page-enter" data-mode="social">
        {/* Header */}
        <header className="breathing-room-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground-v2 flex items-center gap-2">
                <Users className="w-8 h-8" />
                Connections
              </h1>
              <p className="text-secondary-v2 breathing-room-xs">
                Your relationship tiers and the people you trust.
              </p>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <section className="breathing-room-lg">
          <SearchInputV2
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for people to connect with..."
          />

          {/* Search Results */}
          {searchQuery && (
            <div className="breathing-room-md">
              {searchLoading ? (
                <p className="text-secondary-v2 text-sm">Searching...</p>
              ) : searchResults.length > 0 ? (
                <div className="card-v2 clean-spacing-md">
                  <h3 className="text-sm font-semibold text-foreground-v2 breathing-room-sm">
                    Search Results
                  </h3>
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-foreground-v2 font-medium">
                              {user.display_name}
                            </p>
                            {user.handle && (
                              <p className="text-xs text-secondary-v2">
                                @{user.handle}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddConnection(user.id)}
                          className="btn-v2 btn-v2-primary btn-v2-sm flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-secondary-v2 text-sm">No users found.</p>
              )}
            </div>
          )}
        </section>

        {/* Tier Filters */}
        {renderTierFilters()}

        {/* Relationships Grid */}
        <section className="breathing-room-lg">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary-v2">Loading connections...</p>
            </div>
          ) : error ? (
            <div className="card-v2 clean-spacing-md text-center">
              <p className="text-red-400">Error: {error}</p>
              <button
                onClick={fetchRelationships}
                className="btn-v2 btn-v2-primary btn-v2-sm mt-4"
              >
                Retry
              </button>
            </div>
          ) : relationships.length === 0 ? (
            <div className="empty-state-v2">
              <div className="empty-state-icon">
                <Users className="w-12 h-12" />
              </div>
              <h2 className="empty-state-title">No Connections</h2>
              <p className="empty-state-description">
                {selectedTier === 'ALL'
                  ? "Start connecting with people you trust."
                  : `No connections in "${selectedTier}" tier.`}
              </p>
            </div>
          ) : (
            <div className="grid-v2 grid-v2-3 card-cascade">
              {relationships.map((relationship) => (
                <ConnectionCard
                  key={relationship.id}
                  connection={relationship}
                  onChangeTier={handleChangeTier}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </SocialLayout>
  );
};

export default SocialConnectionsPage;
