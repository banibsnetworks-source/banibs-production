import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Edit3, 
  Video,
  User,
  FileText,
  Mic,
  Star,
  Bookmark,
  Search,
  Briefcase,
  TrendingUp,
  Shield,
  EyeOff,
  XCircle,
  Flag,
  Settings,
  Lock,
  ShieldCheck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocialLayout } from '../../../contexts/SocialLayoutContext';
import { ProfileAvatar } from '../ProfileAvatar';
import './LeftRail.css';

/**
 * BANIBS Social Left Rail - Phase 10.0
 * Collapsible navigation with Medium Glass transparency
 */
const LeftRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isCollapsed, toggleCollapse } = useSocialLayout();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get user profile data
  const userHandle = user?.profile?.handle || user?.email?.split('@')[0] || 'user';
  const userName = user?.name || user?.display_name || 'BANIBS Member';
  const userAvatar = user?.profile?.avatar_url;

  const isActive = (path) => {
    if (path === '/portal/social' && location.pathname === '/portal/social') {
      return true;
    }
    if (path !== '/portal/social' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const handleNavClick = (path, action) => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  const handleMouseEnter = (e, label) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2 - 20,
        left: rect.right + 12
      });
      setHoveredItem(label);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Navigation configuration
  const navSections = [
    {
      id: 'main',
      label: null,
      items: [
        { icon: Home, label: 'Home', path: '/portal/social' },
        { icon: Edit3, label: 'Create Post', action: () => {
          // TODO: Open post composer modal
          console.log('Open composer');
        }},
        { icon: Video, label: 'Go Live', path: '/portal/social/live' }
      ]
    },
    {
      id: 'my-space',
      label: 'MY SPACE',
      items: [
        { icon: User, label: 'My Profile', path: `/portal/social/u/${userHandle}` },
        { icon: FileText, label: 'My Posts', path: `/portal/social/u/${userHandle}?tab=posts` },
        { icon: Mic, label: 'My Lives', path: '/portal/social/lives' },
        { icon: Star, label: 'My Subscriptions', path: '/portal/social/subscriptions' },
        { icon: Bookmark, label: 'Saved', path: '/portal/social/saved' }
      ]
    },
    {
      id: 'discover',
      label: 'DISCOVER',
      items: [
        { icon: Search, label: 'People', path: '/portal/social/discover/people' },
        { icon: Briefcase, label: 'Businesses & Creators', path: '/portal/social/discover/creators' },
        { icon: TrendingUp, label: 'Trending', path: '/portal/social/trending' }
      ]
    },
    {
      id: 'community',
      label: 'COMMUNITY & SAFETY',
      items: [
        { icon: Shield, label: 'Community Watch', path: '/portal/social/watch' },
        { icon: EyeOff, label: 'Hidden & Muted', path: '/portal/social/hidden' },
        { icon: XCircle, label: 'Blocked Users', path: '/portal/social/blocked' },
        { icon: Flag, label: 'My Reports', path: '/portal/social/reports' }
      ]
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      items: [
        { icon: Settings, label: 'Preferences', path: '/portal/social/settings' },
        { icon: Lock, label: 'Privacy & Visibility', path: '/portal/social/settings/privacy' },
        { icon: ShieldCheck, label: 'Security', path: '/portal/social/settings/security' },
        { icon: DollarSign, label: 'Monetization', path: '/portal/social/settings/monetization' }
      ]
    }
  ];

  return (
    <>
      <aside className={`left-rail ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="rail-inner">
          {/* User Strip */}
          <div 
            className={`user-strip ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => navigate(`/portal/social/u/${userHandle}`)}
            onMouseEnter={(e) => handleMouseEnter(e, userName)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="user-strip-avatar">
              {userAvatar ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${userAvatar}`}
                  alt={userName}
                />
              ) : (
                <ProfileAvatar name={userName} size="md" />
              )}
            </div>
            <div className="user-strip-info">
              <div className="user-strip-name">{userName}</div>
              <div className="user-strip-handle">@{userHandle}</div>
            </div>
          </div>

          {/* Navigation Sections */}
          {navSections.map((section, sectionIdx) => (
            <div key={section.id} className="nav-section">
              {section.label && (
                <div className="nav-section-header">{section.label}</div>
              )}
              
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const active = item.path && isActive(item.path);
                
                return (
                  <div
                    key={`${section.id}-${itemIdx}`}
                    className={`nav-item ${isCollapsed ? 'collapsed' : ''} ${active ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path, item.action)}
                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="nav-item-icon">
                      <Icon />
                    </div>
                    <div className="nav-item-label">{item.label}</div>
                  </div>
                );
              })}
              
              {/* Add divider after main sections (except last) */}
              {sectionIdx < navSections.length - 1 && sectionIdx === 0 && (
                <div className="nav-divider"></div>
              )}
            </div>
          ))}
        </div>

        {/* Collapse Toggle */}
        <div className="collapse-toggle" onClick={toggleCollapse}>
          <div className="collapse-toggle-icon">
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </div>
          <div className="collapse-toggle-text">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </div>
        </div>
      </aside>

      {/* Tooltip for collapsed state */}
      {isCollapsed && hoveredItem && (
        <div 
          className="nav-tooltip show"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          {hoveredItem}
        </div>
      )}
    </>
  );
};

export default LeftRail;
