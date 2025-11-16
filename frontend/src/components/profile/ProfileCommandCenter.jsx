import React from "react";
import ProfilePictureUploader from "./ProfilePictureUploader";
import BannerUploader from "./BannerUploader";
import AccentColorPicker from "./AccentColorPicker";

const ProfileCommandCenter = ({
  isOpen,
  onClose,
  mode = "social",
  profile,
  onProfileChange,
  onSave,
  isSaving = false,
}) => {
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

  const title =
    mode === "business" ? "Customize Business Profile" : "Edit Profile";

  return (
    <div className="fixed inset-0 z-50 flex">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Profile Picture */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
              Profile Picture
            </h3>
            <ProfilePictureUploader
              currentUrl={profile?.profile_picture_url || ""}
              onChange={handleProfilePictureChange}
            />
          </section>

          {/* Banner */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
              Banner Image
            </h3>
            <BannerUploader
              currentUrl={profile?.banner_image_url || ""}
              onChange={handleBannerChange}
            />
          </section>

          {/* Accent Color */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
              Accent Color
            </h3>
            <AccentColorPicker
              value={profile?.accent_color || "#2563EB"}
              onChange={handleAccentColorChange}
            />
          </section>
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
