import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SocialLayout from '../../components/social/SocialLayout';
import { Users, Search, Loader2 } from 'lucide-react';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';
import AddToPeoplesButton from '../../components/social/AddToPeoplesButton';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SocialDiscoverPeoplePage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load initial users on mount
  useEffect(() => {
    setLoading(false); // No initial load - wait for search
  }, []);

  const loadUsers = async (query = '') => {
    // Only search if there's a query
    if (!query || query.length < 1) {
      setUsers([]);
      setLoading(false);
      return;
    }
    
    setSearching(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = `${API_URL}/api/users/search?query=${encodeURIComponent(query)}&limit=20`;
      
      const response = await fetch(endpoint, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        const filtered = (data.users || data || []).filter(u => u.id !== user?.id);
        setUsers(filtered);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <SocialLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            Discover People
          </h1>
          <p className="text-muted-foreground">
            Find and connect with creators in the BANIBS community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            data-testid="discover-search-input"
          />
          {searching && (
            <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="text-amber-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && !searching && users.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'No users found matching your search.' 
                : 'Start typing to search for creators in the BANIBS community.'}
            </p>
          </div>
        )}

        {/* User List */}
        {!loading && users.length > 0 && (
          <div className="space-y-3">
            {users.map((person) => (
              <div
                key={person.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-amber-500/30 transition-colors"
                data-testid={`user-card-${person.id}`}
              >
                <Link to={`/portal/social/id/${person.id}`}>
                  <ProfileAvatar
                    name={person.display_name || person.name || 'User'}
                    avatarUrl={person.avatar_url || person.profile_picture_url}
                    size="md"
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/portal/social/id/${person.id}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-card-foreground hover:text-amber-500 transition-colors truncate">
                      {person.display_name || person.name || 'User'}
                    </h3>
                    {person.handle && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 truncate">
                        @{person.handle}
                      </p>
                    )}
                    {person.headline && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {person.headline}
                      </p>
                    )}
                  </Link>
                </div>
                
                {user && person.id !== user.id && (
                  <AddToPeoplesButton
                    userId={person.id}
                    userName={person.display_name || person.name}
                    size="sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SocialLayout>
  );
};

export default SocialDiscoverPeoplePage;
