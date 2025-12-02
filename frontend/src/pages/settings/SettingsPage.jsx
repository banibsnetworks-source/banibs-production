import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Briefcase,
  Camera,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Save,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * BANIBS Settings Page
 * Comprehensive user settings with profile, account, notifications, privacy, and business sections
 */
const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saveMessage, setSaveMessage] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [allowMessagesFrom, setAllowMessagesFrom] = useState('everyone');

  const handleSave = (section) => {
    setSaveMessage(`${section} settings saved successfully!`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'business', label: 'Business Settings', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Panel */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Success Message */}
              {saveMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <p className="flex items-center gap-2">
                    <Save size={18} />
                    {saveMessage}
                  </p>
                </div>
              )}

              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                  
                  {/* Profile Photo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        {user?.profile_picture_url ? (
                          <img 
                            src={user.profile_picture_url} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Camera size={18} />
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        placeholder="your@email.com"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSave('Profile')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Account Section */}
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Security</h2>
                  
                  {/* Change Password */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Change Password</h3>
                        <p className="text-sm text-gray-600">
                          Update your password to keep your account secure
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Lock size={18} />
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Login Security */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Login Security</h3>
                        <p className="text-sm text-gray-600">
                          Two-factor authentication and security options
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <Shield size={24} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  {/* Email Notifications */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email Notifications</h3>
                        <p className="text-sm text-gray-600">
                          Receive updates and alerts via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* In-App Notifications */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">In-App Notifications</h3>
                        <p className="text-sm text-gray-600">
                          See notifications while using BANIBS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inAppNotifications}
                          onChange={(e) => setInAppNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSave('Notification')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Privacy & Safety Section */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Safety</h2>
                  
                  {/* Profile Visibility */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public - Everyone can see your profile</option>
                      <option value="community">Community - Only BANIBS members</option>
                      <option value="private">Private - Only your connections</option>
                    </select>
                  </div>

                  {/* Allow Messages From */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allow messages from
                    </label>
                    <select
                      value={allowMessagesFrom}
                      onChange={(e) => setAllowMessagesFrom(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="connections">Connections only</option>
                    </select>
                  </div>

                  {/* Legal/Policy Links */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Legal & Privacy</h3>
                    <div className="space-y-2">
                      <a 
                        href="/terms" 
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Terms of Use <ExternalLink size={14} />
                      </a>
                      <a 
                        href="/privacy" 
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Privacy Policy <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSave('Privacy')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Business Settings Section */}
              {activeSection === 'business' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Settings</h2>
                  
                  {/* Check if user has business profile */}
                  {user?.business_name ? (
                    <>
                      {/* Business Name */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={user.business_name}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      {/* Business Category */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Category
                        </label>
                        <input
                          type="text"
                          value={user.business_category || 'Not Set'}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      {/* Manage Business Listing */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Manage Business Listing</h3>
                            <p className="text-sm text-gray-600">
                              Update your business information, hours, and contact details
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Briefcase size={18} />
                            Manage Listing
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Profile</h3>
                      <p className="text-gray-600 mb-6">
                        Create a business profile to list your services in the BANIBS directory
                      </p>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Create Business Profile
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
