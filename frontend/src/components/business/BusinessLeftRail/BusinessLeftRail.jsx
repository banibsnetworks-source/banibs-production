import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Briefcase,
  Users,
  TrendingUp,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Building2,
  FileText,
  Target,
  Bell,
  ChevronLeft,
  ChevronRight,
  Wallet,
  GraduationCap,
  Heart,
  Shield
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useBusinessLayout } from '../../../contexts/BusinessLayoutContext';
import { ProfileAvatar } from '../../social/ProfileAvatar';
import ThemeToggle from '../../social/ThemeToggle';
import './BusinessLeftRail.css';

/**
 * BANIBS Business Left Rail - Phase 8.4
 * Business-focused navigation with glass transparency
 */
const BusinessLeftRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isCollapsed, toggleCollapse } = useBusinessLayout();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Get user/business profile data
  const businessName = user?.business_name || user?.name || 'My Business';
  const businessHandle = user?.business_handle || user?.email?.split('@')[0] || 'business';
  const businessAvatar = user?.business_avatar || user?.profile?.avatar_url;

  const isActive = (path) => {
    if (path === '/portal/business' && location.pathname === '/portal/business') {
      return true;
    }
    if (path !== '/portal/business' && location.pathname.startsWith(path)) {
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

  // Business Navigation Configuration - Phase 8.4
  const navSections = [
    {
      id: 'main',
      label: 'MAIN',
      items: [
        { icon: Home, label: 'Business Home', path: '/portal/business' },
        { icon: Building2, label: 'My Profile', path: '/portal/business/profile' },
        { icon: MessageSquare, label: 'Business Board', path: '/portal/business/board' },
        { icon: Briefcase, label: 'Business Directory', path: '/business-directory' },
        { icon: TrendingUp, label: 'Jobs & Opportunities', path: '/opportunities' }
      ]
    },
    {
      id: 'manage',
      label: 'MANAGE',
      items: [
        { icon: FileText, label: 'My Posts', path: '/portal/business/posts' },
        { icon: Shield, label: 'Verification', path: '/portal/business/profile?tab=verification' },
        { icon: Users, label: 'Team & Staff', path: '/portal/business/team' },
        { icon: Target, label: 'Services & Offerings', path: '/portal/business/services' },
        { icon: Calendar, label: 'Events & Bookings', path: '/portal/business/events' },
        { icon: Wallet, label: 'Payments & Billing', path: '/portal/business/payments' }
      ]
    },
    {
      id: 'grow',
      label: 'GROW',
      items: [
        { icon: BarChart3, label: 'Analytics', path: '/portal/business/analytics' },
        { icon: Heart, label: 'Helping Hands', path: '/portal/helping-hands' },
        { icon: Bell, label: 'Notifications', path: '/portal/business/notifications' },
        { icon: GraduationCap, label: 'Business Lessons', path: '/portal/business/lessons' }
      ]
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      items: [
        { icon: Settings, label: 'Business Settings', path: '/portal/business/settings' }
      ]
    }
  ];

  return (
    <>
      <aside className={`business-left-rail ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="rail-inner">
          {/* Business Strip */}
          <div 
            className={`business-strip ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => {
              console.log('Business strip clicked, navigating to profile');
              navigate('/portal/business/profile');
            }}
            onMouseEnter={(e) => handleMouseEnter(e, 'Edit Business Profile')}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
          >
            <div className="business-strip-avatar">
              {businessAvatar ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${businessAvatar}`}
                  alt={businessName}
                />
              ) : (
                <ProfileAvatar name={businessName} size="md" />
              )}
            </div>
            <div className="business-strip-info">
              <div className="business-strip-name">{businessName}</div>
              <div className="business-strip-handle">@{businessHandle}</div>
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
              
              {/* Add divider after main section */}
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

export default BusinessLeftRail;
