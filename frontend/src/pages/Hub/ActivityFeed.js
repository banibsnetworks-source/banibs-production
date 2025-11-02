import React from 'react';
import { formatDate } from '../../utils/dateUtils';

const ActivityFeed = ({ news, opportunities }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  return (
    <div className="space-y-6">
      {/* Top Stories Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📰</span>
          <span>Top Stories</span>
        </h2>
        
        {news.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No news items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => {
              const imgSrc = item.imageUrl || `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
              
              return (
                <article
                  key={item.id}
                  className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-black/40 border border-yellow-400/20 mb-3">
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                      }}
                    />
                  </div>

                  {/* Category + Date */}
                  <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
                    {item.category && (
                      <span className="font-semibold text-gray-700">{item.category}</span>
                    )}
                    {item.publishedAt && (
                      <span className="text-gray-400">
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  {/* Read More */}
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-800 mt-2 inline-block hover:underline"
                    >
                      Read More →
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Opportunities Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💼</span>
          <span>Featured Opportunities</span>
        </h2>
        
        {opportunities.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No featured opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Type Badge */}
                <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-900 text-xs font-semibold rounded-full mb-3">
                  {opp.type || 'Opportunity'}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {opp.title}
                </h3>

                {/* Organization & Deadline */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {opp.organization && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Organization:</span>
                      <span>{opp.organization}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Deadline:</span>
                      <span>{formatDate(opp.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {opp.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {opp.description}
                  </p>
                )}

                {/* Apply Button */}
                {opp.applicationUrl && (
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivityFeed;
