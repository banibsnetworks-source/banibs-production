import React, { useState } from 'react';
import { X, User, Image, Palette, Lock, Bell, Settings } from 'lucide-react';
import ProfilePictureUploader from './ProfilePictureUploader';
import BannerUploader from './BannerUploader';
import AccentColorPicker from './AccentColorPicker';

/**
 * ProfileCommandCenter - Phase 8.1 Stage 1
 * Slide-out panel for profile customization
 */

const ProfileCommandCenter = ({ isOpen, onClose, currentUser, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('picture');

  if (!isOpen) return null;

  const handleProfilePictureSave = (url) => {
    onProfileUpdate({ profile_picture_url: url });
    setActiveTab('main');
  };

  const handleBannerSave = (url) => {
    onProfileUpdate({ banner_image_url: url });
    setActiveTab('main');
  };

  const handleAccentColorSave = (color) => {
    onProfileUpdate({ accent_color: color });
    setActiveTab('main');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-background shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Profile Command Center</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'main' && (
            <>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('picture')}
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">Upload or change your photo</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('banner')}
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Cover Banner</p>
                    <p className="text-sm text-muted-foreground">Customize your profile banner</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('color')}
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Accent Color</p>
                    <p className="text-sm text-muted-foreground">Choose your theme color</p>
                  </div>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Privacy Settings</p>
                    <p className="text-sm text-muted-foreground">Coming in Stage 3</p>
                  </div>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Notifications</p>
                    <p className="text-sm text-muted-foreground">Manage your alerts</p>
                  </div>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Account Settings</p>
                    <p className="text-sm text-muted-foreground">Password, email, etc.</p>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Phase 8.1 Stage 1 - More features coming soon
                </p>
              </div>
            </>
          )}

          {activeTab === 'picture' && (
            <>
              <button
                onClick={() => setActiveTab('main')}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back to menu
              </button>
              <ProfilePictureUploader
                currentImageUrl={currentUser?.profile_picture_url}
                onSave={handleProfilePictureSave}
                onCancel={() => setActiveTab('main')}
              />
            </>
          )}

          {activeTab === 'banner' && (
            <>
              <button
                onClick={() => setActiveTab('main')}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back to menu
              </button>
              <BannerUploader
                currentBannerUrl={currentUser?.banner_image_url}
                onSave={handleBannerSave}
                onCancel={() => setActiveTab('main')}
              />
            </>
          )}

          {activeTab === 'color' && (
            <>
              <button
                onClick={() => setActiveTab('main')}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back to menu
              </button>
              <AccentColorPicker
                currentColor={currentUser?.accent_color}
                onSave={handleAccentColorSave}
                onCancel={() => setActiveTab('main')}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileCommandCenter;
