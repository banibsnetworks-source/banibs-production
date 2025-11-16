import React, { useState } from "react";
import { User, Image as ImageIcon, Palette, Info, Briefcase, Layout } from 'lucide-react';
import ProfilePictureUploader from "./ProfilePictureUploader";
import BannerUploader from "./BannerUploader";
import AccentColorPicker from "./AccentColorPicker";
import BusinessThemeControls from "../business/BusinessThemeControls";

const ProfileCommandCenter = ({
  isOpen,
  onClose,
  mode = "social",
  profile,
  onProfileChange,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  const handleProfilePictureChange = (url) => {
    onProfileChange({
      ...profile,
      profile_picture_url: url,
    });
  };

  const handleBannerChange = (url) => {
    onProfileChange({
      ...profile,
      banner_image_url: url,
    });
  };

  const handleAccentColorChange = (color) => {
    onProfileChange({
      ...profile,
      accent_color: color,
    });
  };

  const handleThemeChange = (themeUpdates) => {
    onProfileChange({
      ...profile,
      ...themeUpdates,
    });
  };

  const handleInfoChange = (field, value) => {
    onProfileChange({
      ...profile,
      [field]: value,
    });
  };

  const handleServiceChange = (services) => {
    onProfileChange({
      ...profile,
      services,
    });
  };

  const addService = () => {
    const services = profile?.services || [];
    const newService = {
      id: Date.now(),
      title: '',
      description: '',
    };
    handleServiceChange([...services, newService]);
  };

  const updateService = (id, field, value) => {
    const services = profile?.services || [];
    handleServiceChange(
      services.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const deleteService = (id) => {
    const services = profile?.services || [];
    handleServiceChange(services.filter(s => s.id !== id));
  };

  const title =
    mode === "business" ? "Customize Business Profile" : "Edit Profile";

  const tabs = mode === "business" ? [
    { id: 'appearance', label: 'Appearance', icon: ImageIcon },
    { id: 'info', label: 'Business Info', icon: Info },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'theme', label: 'Theme', icon: Layout },
  ] : [
    { id: 'appearance', label: 'Appearance', icon: User },
  ];

  return (
    <div className="fixed inset-0 flex" style={{ zIndex: 10000 }}>
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <aside className="w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Tabs (Business mode only) */}
        {mode === "business" && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              <section>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
                  {mode === "business" ? "Logo" : "Profile Picture"}
                </h3>
                <ProfilePictureUploader
                  currentUrl={profile?.profile_picture_url || profile?.logo || ""}
                  onChange={handleProfilePictureChange}
                />
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
                  Banner Image
                </h3>
                <BannerUploader
                  currentUrl={profile?.banner_image_url || profile?.cover || ""}
                  onChange={handleBannerChange}
                />
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
                  Accent Color
                </h3>
                <AccentColorPicker
                  value={profile?.accent_color || "#2563EB"}
                  onChange={handleAccentColorChange}
                  isBusinessMode={mode === "business"}
                />
              </section>
            </>
          )}

          {/* Business Info Tab */}
          {activeTab === 'info' && mode === "business" && (
            <>
              <section>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-2">
                  Address
                </label>
                <textarea
                  value={profile?.address || ''}
                  onChange={(e) => handleInfoChange('address', e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </section>

              <section>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => handleInfoChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </section>

              <section>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile?.website_url || ''}
                  onChange={(e) => handleInfoChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </section>

              <section>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-2">
                  Business Hours
                </label>
                <textarea
                  value={profile?.hours || ''}
                  onChange={(e) => handleInfoChange('hours', e.target.value)}
                  placeholder="Mon-Fri: 9AM-5PM\nSat: 10AM-2PM\nSun: Closed"
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </section>
            </>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && mode === "business" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add services or offerings your business provides
                </p>
                <button
                  type="button"
                  onClick={addService}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Service
                </button>
              </div>

              {(profile?.services || []).length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No services added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(profile?.services || []).map((service) => (
                    <div key={service.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => updateService(service.id, 'title', e.target.value)}
                        placeholder="Service name"
                        className="w-full px-3 py-2 mb-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                      />
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 mb-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => deleteService(service.id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && mode === "business" && (
            <BusinessThemeControls
              theme={profile}
              onChange={handleThemeChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ProfileCommandCenter;
