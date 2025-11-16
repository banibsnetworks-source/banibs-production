import React from 'react';
import { Briefcase, Edit2 } from 'lucide-react';

/**
 * BusinessServicesList - Phase 8.1 Stage 2
 * Displays list of services offered by business
 */

const BusinessServicesList = ({ services = [], isOwner, onEdit }) => {
  const hasServices = services && services.length > 0;

  if (!hasServices && !isOwner) {
    return null; // Don't show empty section to public
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Services & Offerings
        </h3>
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Manage
          </button>
        )}
      </div>

      {hasServices ? (
        <div className="space-y-3">
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                {service.title}
              </h4>
              {service.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {service.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No services added yet
          </p>
          {isOwner && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first service
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessServicesList;
