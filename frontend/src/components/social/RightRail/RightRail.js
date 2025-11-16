import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Radio } from 'lucide-react';
import NewsBeat from '../../common/NewsBeat';
import './RightRail.css';

/**
 * BANIBS Social Right Rail - Dual-Layout System
 * - NewsBeat (Headlines moving our people)
 * - Discovery, Lives, Groups, and Trending
 * Currently using mock data - will be replaced with real API calls in Phase 10.2+
 */

// Mock data - Phase 10.1
const MOCK_LIVE_SESSIONS = [
  { id: '1', title: 'Tech Talk: AI in Business', host: 'Raymond Neely', viewers: 234, thumbnail: null },
  { id: '2', title: 'BANIBS Community Roundtable', host: 'Sarah Johnson', viewers: 142, thumbnail: null },
  { id: '3', title: 'Startup Founders Chat', host: 'Michael Chen', viewers: 89, thumbnail: null }
];

const MOCK_SUGGESTED_GROUPS = [
  { id: '1', name: 'Black Tech Atlanta', members: 1420, location: 'Atlanta, GA' },
  { id: '2', name: 'Business Owners Network', members: 856, location: 'Georgia' },
  { id: '3', name: 'Tech Startups', members: 2340, location: 'Nationwide' }
];

const MOCK_SUGGESTED_PEOPLE = [
  { id: '1', name: 'Alex Turner', handle: 'alexturner', avatar: null },
  { id: '2', name: 'Jessica Williams', handle: 'jwilliams', avatar: null },
  { id: '3', name: 'David Martinez', handle: 'dmartinez', avatar: null }
];

const MOCK_TRENDING_TOPICS = [
  { tag: '#BlackTech', posts: 1234 },
  { tag: '#BANIBS', posts: 892 },
  { tag: '#StartupLife', posts: 567 },
  { tag: '#TechAtlanta', posts: 445 },
  { tag: '#Entrepreneurship', posts: 389 }
];

const RightRail = () => {
  const navigate = useNavigate();

  return (
    <aside className="right-rail">
      {/* Live Now Section */}
      <div className="right-rail-section">
        <div className="right-rail-section-header">
          <div className="right-rail-section-title">
            <Radio size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Live Now
          </div>
          <a 
            href="/portal/social/live" 
            onClick={(e) => { e.preventDefault(); navigate('/portal/social/live'); }}
            className="right-rail-section-link"
          >
            See all
          </a>
        </div>
        
        {MOCK_LIVE_SESSIONS.length > 0 ? (
          MOCK_LIVE_SESSIONS.map(session => (
            <div 
              key={session.id} 
              className="right-rail-card live-card"
              onClick={() => navigate(`/portal/social/live/${session.id}`)}
            >
              <div className="live-card-thumbnail">
                <div className="live-badge">LIVE</div>
                {/* Placeholder gradient - will be replaced with actual thumbnails */}
              </div>
              <div className="live-card-info">
                <div className="live-card-title">{session.title}</div>
                <div className="live-card-host">{session.host}</div>
                <div className="live-card-viewers">{session.viewers} watching</div>
              </div>
            </div>
          ))
        ) : (
          <div className="right-rail-empty">No live sessions right now</div>
        )}
      </div>

      {/* Suggested Groups Section */}
      <div className="right-rail-section">
        <div className="right-rail-section-header">
          <div className="right-rail-section-title">
            <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Suggested Groups Near You
          </div>
          <a 
            href="/portal/social/groups" 
            onClick={(e) => { e.preventDefault(); navigate('/portal/social/groups'); }}
            className="right-rail-section-link"
          >
            Explore
          </a>
        </div>
        
        {MOCK_SUGGESTED_GROUPS.map(group => (
          <div 
            key={group.id} 
            className="right-rail-card group-card"
            onClick={() => navigate(`/portal/social/groups/${group.id}`)}
          >
            <div className="group-card-icon">
              {group.name.charAt(0)}
            </div>
            <div className="group-card-info">
              <div className="group-card-name">{group.name}</div>
              <div className="group-card-meta">
                {group.members.toLocaleString()} members • {group.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* People You May Know Section */}
      <div className="right-rail-section">
        <div className="right-rail-section-header">
          <div className="right-rail-section-title">People You May Know</div>
          <a 
            href="/portal/social/discover/people" 
            onClick={(e) => { e.preventDefault(); navigate('/portal/social/discover/people'); }}
            className="right-rail-section-link"
          >
            See all
          </a>
        </div>
        
        {MOCK_SUGGESTED_PEOPLE.map(person => (
          <div key={person.id} className="right-rail-card person-card">
            <div className="person-card-left">
              <div className="person-card-avatar">
                {/* Placeholder - will be replaced with actual avatars */}
              </div>
              <div className="person-card-info">
                <div className="person-card-name">{person.name}</div>
                <div className="person-card-handle">@{person.handle}</div>
              </div>
            </div>
            <button 
              className="person-card-follow-btn"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Follow ${person.handle} - Phase 10.3`);
              }}
            >
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Trending Topics Section */}
      <div className="right-rail-section">
        <div className="right-rail-section-header">
          <div className="right-rail-section-title">
            <TrendingUp size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Trending Topics
          </div>
          <a 
            href="/portal/social/trending" 
            onClick={(e) => { e.preventDefault(); navigate('/portal/social/trending'); }}
            className="right-rail-section-link"
          >
            More
          </a>
        </div>
        
        {MOCK_TRENDING_TOPICS.map((topic, idx) => (
          <div 
            key={idx} 
            className="trending-card"
            onClick={() => navigate(`/portal/social/search?q=${encodeURIComponent(topic.tag)}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="trending-card-tag">{topic.tag}</div>
            <div className="trending-card-count">
              {topic.posts.toLocaleString()} posts
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RightRail;
