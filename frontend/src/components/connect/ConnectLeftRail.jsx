import React from 'react';
import { Users, Activity, Briefcase, Calendar, Tag, MessageSquare, Building, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccountMode } from '../../contexts/AccountModeContext';

/**
 * ConnectLeftRail - BANIBS Connect Left Column
 * Business Network Navigation
 * 
 * Raymond's Spec:
 * - My Network / Connections
 * - Recent Activity
 * - Business Groups
 * - Events
 * - Followed Hashtags
 * - Messaging (Business Inbox)
 * - Company Pages (future)
 */

const ConnectLeftRail = () => {
  const { selectedBusinessProfile } = useAccountMode();

  const navItems = [
    {
      icon: BarChart3,
      label: 'Business Analytics',
      href: '/portal/connect/analytics',
      description: 'Insights & Performance',
      highlight: true
    },
    {
      icon: Users,
      label: 'My Network',
      count: '1.2K',
      href: '/portal/connect/network',
      description: 'Connections'
    },
    {
      icon: Activity,
      label: 'Recent Activity',
      href: '/portal/connect/activity',
      badge: '12 new'
    },
    {
      icon: Briefcase,
      label: 'Business Groups',
      count: '8',
      href: '/portal/connect/groups'
    },
    {
      icon: Calendar,
      label: 'Events',
      count: '3',
      href: '/portal/connect/events'
    },
    {
      icon: Tag,
      label: 'Followed Hashtags',
      count: '15',
      href: '/portal/connect/hashtags'
    },
    {
      icon: MessageSquare,
      label: 'Business Inbox',
      badge: '5',
      href: '/portal/connect/messages'
    },
    {
      icon: Building,
      label: 'Company Pages',
      href: '/portal/connect/companies',
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Business Profile Card */}
      {selectedBusinessProfile && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {selectedBusinessProfile.logo ? (
                <img src={selectedBusinessProfile.logo} alt={selectedBusinessProfile.name} className="w-full h-full object-cover" />
              ) : (
                selectedBusinessProfile.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {selectedBusinessProfile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                @{selectedBusinessProfile.handle}
              </p>
            </div>
          </div>
          <Link
            to={`/portal/connect/@${selectedBusinessProfile.handle}`}
            className="block text-center text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
          >
            View Profile
          </Link>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {navItems.map((item, index) => (
          <Link
            key={item.label}
            to={item.href}
            className={`
              block px-4 py-3 hover:bg-muted transition-colors
              ${index !== 0 ? 'border-t border-border' : ''}
              ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={(e) => item.comingSoon && e.preventDefault()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              {item.count && (
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span className="text-xs text-muted-foreground">Soon</span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 ml-8">
                {item.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ConnectLeftRail;
