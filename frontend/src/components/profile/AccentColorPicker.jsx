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

const AccentColorPicker = ({ value, onChange, isBusinessMode = false }) => {
  const [selected, setSelected] = useState(value || (isBusinessMode ? '#EAB308' : '#3B82F6'));
  const colors = isBusinessMode ? BUSINESS_COLORS : SOCIAL_COLORS;

  const handleSelect = (hex) => {
    setSelected(hex);
    onChange(hex);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This color will appear on buttons, highlights, and profile accents
      </p>

      <div className="grid grid-cols-2 gap-3">
        {colors.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => handleSelect(color.hex)}
            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
              selected === color.hex
                ? 'border-blue-600 shadow-md'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            <div
              className="w-full h-10 rounded mb-2"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{color.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{color.desc}</p>
            {selected === color.hex && (
              <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Preview</p>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-white text-sm"
            style={{ backgroundColor: selected }}
          >
            Button
          </button>
          <div
            className="px-2 py-1 rounded-full text-xs"
            style={{ backgroundColor: selected + '20', color: selected }}
          >
            Badge
          </div>
          <div
            className="w-10 h-10 rounded-full border-4"
            style={{ borderColor: selected }}
          />
        </div>
      </div>
    </div>
  );
};

export default AccentColorPicker;
