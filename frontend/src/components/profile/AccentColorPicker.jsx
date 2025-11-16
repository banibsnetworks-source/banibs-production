import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';

const SOCIAL_COLORS = [
  { name: 'Royal Blue', hex: '#3B82F6', desc: 'Default' },
  { name: 'Violet', hex: '#8B5CF6', desc: 'Creative' },
  { name: 'Emerald', hex: '#10B981', desc: 'Fresh' },
  { name: 'Sunset Orange', hex: '#F97316', desc: 'Bold' },
  { name: 'Soft Gold', hex: '#F59E0B', desc: 'Warm' },
  { name: 'Black Ice', hex: '#1F2937', desc: 'Sleek' }
];

const BUSINESS_COLORS = [
  { name: 'Enterprise Gold', hex: '#EAB308', desc: 'Default' },
  { name: 'Navy', hex: '#1E40AF', desc: 'Trust' },
  { name: 'Slate Gray', hex: '#64748B', desc: 'Professional' },
  { name: 'Teal', hex: '#14B8A6', desc: 'Modern' },
  { name: 'Burgundy', hex: '#BE123C', desc: 'Elegant' },
  { name: 'Minimal White', hex: '#F8FAFC', desc: 'Clean' }
];

const AccentColorPicker = ({ currentColor, isBusinessMode = false, onSave, onCancel }) => {
  const [selected, setSelected] = useState(currentColor || (isBusinessMode ? '#EAB308' : '#3B82F6'));
  const [saving, setSaving] = useState(false);

  const colors = isBusinessMode ? BUSINESS_COLORS : SOCIAL_COLORS;

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('accent_color', selected);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile-media/update-accent-color`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (response.ok) {
        onSave(selected);
      } else {
        alert('Failed to update accent color');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update accent color');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          Choose Accent Color
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        This color will appear on buttons, highlights, and profile accents
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => setSelected(color.hex)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              selected === color.hex
                ? 'border-blue-600 shadow-md'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div
              className="w-full h-12 rounded mb-2"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-sm font-medium text-foreground">{color.name}</p>
            <p className="text-xs text-muted-foreground">{color.desc}</p>
            {selected === color.hex && (
              <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 border border-border rounded-lg">
        <p className="text-sm font-medium text-foreground mb-3">Preview</p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: selected }}
          >
            Primary Button
          </button>
          <div
            className="px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: selected + '20', color: selected }}
          >
            Badge
          </div>
          <div
            className="w-12 h-12 rounded-full border-4"
            style={{ borderColor: selected }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Color'}
        </button>
      </div>
    </div>
  );
};

export default AccentColorPicker;
