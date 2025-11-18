import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Briefcase, Plus } from 'lucide-react';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Account Mode Switcher - Dual-Layout System
 * Allows switching between Personal and Business modes
 * 
 * Design Specs (Raymond):
 * - Top-right, next to avatar
 * - Label: "Use BANIBS as:"
 * - Options: 
 *   - "Raymond Neely (Personal)"
 *   - "BANIBS, LLC (Business)"
 *   - "+ Create Business Profile" (future)
 * - Shows mode pill: "Personal Mode" or "Business Mode – Acting as [Name]"
 */

const AccountModeSwitcher = () => {
  const { user } = useAuth();
  const {
    mode,
    selectedBusinessProfile,
    businessProfiles,
    switchToPersonal,
    switchToBusiness,
    isPersonalMode,
    isBusinessMode
  } = useAccountMode();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display name for current mode
  const getCurrentModeName = () => {
    if (isPersonalMode) {
      return `${user?.name || 'User'} (Personal)`;
    }
    if (isBusinessMode && selectedBusinessProfile) {
      return selectedBusinessProfile.name;
    }
    return 'Unknown';
  };

  // Get mode pill text
  const getModePillText = () => {
    if (isPersonalMode) {
      return 'Personal Mode';
    }
    if (isBusinessMode && selectedBusinessProfile) {
      return `Business Mode – Acting as ${selectedBusinessProfile.name}`;
    }
    return '';
  };

  const handlePersonalClick = () => {
    switchToPersonal();
    setIsOpen(false);
  };

  const handleBusinessClick = (profile) => {
    console.log('🏢 [AccountModeSwitcher] Business profile clicked:', profile);
    switchToBusiness(profile);
    setIsOpen(false);
    
    // Navigate to business profile page
    console.log('🏢 [AccountModeSwitcher] Navigating to /portal/business/profile');
    window.location.href = '/portal/business/profile';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mode Pill */}
      <div className="hidden md:flex items-center gap-2 mr-3">
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
          isPersonalMode 
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800'
        }`}>
          {getModePillText()}
        </div>
      </div>

      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
        title="Switch account mode"
      >
        <div className="flex items-center gap-2">
          {isPersonalMode ? (
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Briefcase className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          )}
          <span className="text-sm font-medium hidden sm:inline">
            {getCurrentModeName()}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-muted border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Use BANIBS as:
            </p>
          </div>

          {/* Options */}
          <div className="py-2">
            {/* Personal Mode */}
            <button
              onClick={handlePersonalClick}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                isPersonalMode ? 'bg-blue-50 dark:bg-blue-950' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPersonalMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">Personal</p>
              </div>
              {isPersonalMode && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </button>

            {/* Business Profiles */}
            {businessProfiles.length === 0 ? (
              /* Show "Create Business" option for users with no businesses */
              <button
                onClick={() => {
                  console.log('🏢 [AccountModeSwitcher] Create Business clicked');
                  setIsOpen(false);
                  window.location.href = '/portal/business/profile';
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Create Business Profile</p>
                  <p className="text-xs text-muted-foreground">Start your business on BANIBS</p>
                </div>
              </button>
            ) : (
              /* Show existing business profiles */
              businessProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleBusinessClick(profile)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                    isBusinessMode && selectedBusinessProfile?.id === profile.id 
                      ? 'bg-yellow-50 dark:bg-yellow-950' 
                      : ''
                  }`}
                >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                  isBusinessMode && selectedBusinessProfile?.id === profile.id
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {profile.logo ? (
                    <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {profile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Business</p>
                </div>
                {isBusinessMode && selectedBusinessProfile?.id === profile.id && (
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                )}
              </button>
              ))
            )}

            {/* Create Business Profile (Future) */}
            <button
              disabled
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                <Plus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Create Business Profile
                </p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountModeSwitcher;
