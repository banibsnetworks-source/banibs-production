import React, { useState } from 'react';
import { Palette, Type, Layout } from 'lucide-react';

/**
 * BusinessThemeControls - Phase 8.1 Stage 2
 * Advanced theming controls for business profiles
 */

const HEADER_STYLES = [
  { value: 'clean', label: 'Clean', description: 'Flat, modern look' },
  { value: 'carded', label: 'Carded', description: 'Banner overlaps card' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, no banner' },
];

const FONT_STYLES = [
  { value: 'default', label: 'Default', description: 'System fonts' },
  { value: 'modern', label: 'Modern', description: 'Contemporary sans-serif' },
  { value: 'serif', label: 'Serif', description: 'Classic, professional' },
];

const BusinessThemeControls = ({ theme, onChange }) => {
  const [localTheme, setLocalTheme] = useState({
    secondary_color: theme?.secondary_color || theme?.accent_color || '#d4af37',
    header_style: theme?.header_style || 'clean',
    font_style: theme?.font_style || 'default',
  });

  const handleChange = (field, value) => {
    const updated = { ...localTheme, [field]: value };
    setLocalTheme(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Secondary Color */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Secondary Color
          </h4>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Used for accents, badges, and secondary highlights
        </p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={localTheme.secondary_color}
            onChange={(e) => handleChange('secondary_color', e.target.value)}
            className="w-12 h-12 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <input
            type="text"
            value={localTheme.secondary_color}
            onChange={(e) => handleChange('secondary_color', e.target.value)}
            placeholder="#d4af37"
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          />
        </div>
      </section>

      {/* Header Style */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Header Style
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {HEADER_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleChange('header_style', style.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                localTheme.header_style === style.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {style.label}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {style.description}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Font Style */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Font Style
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {FONT_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleChange('font_style', style.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                localTheme.font_style === style.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {style.label}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {style.description}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
          Preview
        </h4>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div
            className="inline-block px-3 py-1.5 rounded-full text-sm font-medium text-white mb-2"
            style={{ backgroundColor: localTheme.secondary_color }}
          >
            Category Badge
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Business Name
          </div>
          <div
            className="mt-2 h-1 w-24 rounded"
            style={{ backgroundColor: localTheme.secondary_color }}
          />
        </div>
      </section>
    </div>
  );
};

export default BusinessThemeControls;
