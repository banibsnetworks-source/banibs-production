import React, { useState } from 'react';
import { MapPin, Phone, Globe, Clock, Edit2 } from 'lucide-react';

/**
 * BusinessInfoPanel - Phase 8.1 Stage 2
 * Displays business operational information
 */

const BusinessInfoPanel = ({ business, isOwner, onEdit }) => {
  const hasInfo = business?.address || business?.phone || business?.website_url || business?.hours;

  if (!hasInfo && !isOwner) {
    return null; // Don't show empty panel to public
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Business Information
        </h3>
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {hasInfo ? (
        <div className="space-y-3">
          {business.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Address</p>
                <p className="text-slate-900 dark:text-slate-100">{business.address}</p>
              </div>
            </div>
          )}

          {business.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Phone</p>
                <a
                  href={`tel:${business.phone}`}
                  className="text-slate-900 dark:text-slate-100 hover:underline"
                >
                  {business.phone}
                </a>
              </div>
            </div>
          )}

          {business.website_url && (
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Website</p>
                <a
                  href={business.website_url.startsWith('http') ? business.website_url : `https://${business.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {business.website_url}
                </a>
              </div>
            </div>
          )}

          {business.hours && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hours</p>
                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-line">{business.hours}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No business information added yet
          </p>
          {isOwner && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add business information
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessInfoPanel;
