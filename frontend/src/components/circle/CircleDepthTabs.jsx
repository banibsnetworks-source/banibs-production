import React from 'react';
import { useTranslation } from 'react-i18next';

export const CircleDepthTabs = ({ activeDepth, onDepthChange, maxDepth = 4 }) => {
  const { t } = useTranslation();
  
  const depths = [
    { value: 1, label: t('circles.peoples') || 'Peoples', color: 'emerald' },
    { value: 2, label: t('circles.peoplesOfPeoples') || 'Peoples-of-Peoples', color: 'sky' },
    { value: 3, label: t('circles.extendedCircle') || 'Extended Circle', color: 'amber' },
    { value: 4, label: t('circles.outerRing') || 'Outer Ring', color: 'gray' }
  ].slice(0, maxDepth);
  
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-800 bg-black/40 p-3">
      <span className="text-sm text-gray-400 mr-2">{t('circles.depth')}:</span>
      {depths.map(({ value, label, color }) => {
        const isActive = value === activeDepth;
        return (
          <button
            key={value}
            onClick={() => onDepthChange(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? `bg-${color}-500/20 border-${color}-500/60 text-${color}-300 border-2`
                : 'bg-black/40 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default CircleDepthTabs;
