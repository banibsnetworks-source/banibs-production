import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Video,
  User,
  FileText,
  Mic,
  Star,
  Bookmark,
  Search,
  Briefcase,
  Shield,
  EyeOff,
  Settings,
  Lock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocialLayout } from '../../../contexts/SocialLayoutContext';
import { ProfileAvatar } from '../ProfileAvatar';
import ThemeToggle from '../ThemeToggle';
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

  // Navigation configuration - Phase 10.1 Final Structure
  const navSections = [
    {
      id: 'main',
      label: 'MAIN',
      items: [
        { icon: Home, label: 'Home', path: '/portal/social' },
        { icon: Search, label: 'Discover People', path: '/portal/social/discover/people' },
        { icon: User, label: 'Groups & Communities', path: '/portal/social/groups' },
        { icon: Briefcase, label: 'Marketplace', path: '/portal/marketplace' },
        { icon: Video, label: 'Live Now', path: '/portal/social/live' }
      ]
    },
    {
      id: 'my-space',
      label: 'MY SPACE',
      items: [
        { icon: User, label: 'My Profile', path: '/portal/social/profile' },
        { icon: FileText, label: 'My Posts', path: `/portal/social/u/${userHandle}?tab=posts` },
        { icon: User, label: 'My Groups', path: '/portal/social/groups/mine' },
        { icon: MessageCircle, label: 'My Messages', path: '/portal/social/messages' },
        { icon: User, label: 'My Peoples', path: `/portal/social/u/${userHandle}?tab=peoples` },
        { icon: Bookmark, label: 'Saved / Bookmarks', path: '/portal/social/saved' },
        { icon: Mic, label: 'My Lives', path: '/portal/social/lives' },
        { icon: Star, label: 'Subscriptions', path: '/portal/social/subscriptions' }
      ]
    },
    {
      id: 'community',
      label: 'COMMUNITY & SAFETY',
      items: [
        { icon: Lock, label: 'Privacy Settings', path: '/portal/social/settings/privacy' },
        { icon: EyeOff, label: 'Hidden / Blocked', path: '/portal/social/settings/blocked' },
        { icon: User, label: 'Anonymous Posting', path: '/portal/social/settings/anonymous' },
        { icon: Shield, label: 'Community Watch', path: '/portal/social/watch' }
      ]
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      items: [
        { icon: Settings, label: 'Theme & Display', path: '/portal/social/settings/display' },
        { icon: Video, label: 'Autoplay Settings', path: '/portal/social/settings/video' },
        { icon: Settings, label: 'Language', path: '/portal/social/settings/language' },
        { icon: ShieldCheck, label: 'Security & 2FA', path: '/portal/social/settings/security' }
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
            onClick={() => {
              console.log('User strip clicked, navigating to profile');
              navigate('/portal/social/profile');
            }}
            onMouseEnter={(e) => handleMouseEnter(e, 'Edit Profile')}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
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

        {/* Theme Toggle */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <ThemeToggle showLabel={!isCollapsed} size="sm" />
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
