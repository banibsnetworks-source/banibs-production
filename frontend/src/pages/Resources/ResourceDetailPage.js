import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SentimentBadge from '../../components/SentimentBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function ResourceDetailPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/resources/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        throw new Error('Failed to fetch resource');
      }
      
      const data = await response.json();
      setResource(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Article': '📄',
      'Guide': '📖',
      'Video': '🎥',
      'Tool': '🛠️',
      'Download': '⬇️'
    };
    return icons[type] || '📋';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 mt-4">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-red-300">{error}</p>
            <Link 
              to="/resources" 
              className="inline-block mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              ← Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/resources" className="text-yellow-500 hover:text-yellow-400 inline-block">
            ← Back to Resources
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <article className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-800">
            {/* Featured Badge */}
            {resource.featured && (
              <div className="mb-4">
                <span className="inline-block bg-yellow-500/20 text-yellow-500 text-sm font-semibold px-4 py-2 rounded-full border border-yellow-500/30">
                  ⭐ Featured Resource
                </span>
              </div>
            )}

            {/* Type & Category */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{getTypeIcon(resource.type)}</span>
              <div>
                <div className="text-sm text-gray-500">{resource.type}</div>
                <div className="text-sm text-yellow-500">{resource.category}</div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {resource.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              {resource.description}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span>{resource.author_name || 'BANIBS Admin'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatDate(resource.published_at || resource.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{resource.view_count || 0} views</span>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-800 text-gray-400 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Internal Content */}
            {resource.content && (
              <div className="prose prose-invert max-w-none mb-8">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {resource.content}
                </div>
              </div>
            )}

            {/* Video URL */}
            {resource.video_url && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">📹 Video Resource</h3>
                <a
                  href={resource.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Watch Video →
                </a>
              </div>
            )}

            {/* External URL */}
            {resource.external_url && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">🔗 External Resource</h3>
                <a
                  href={resource.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Access Resource →
                </a>
              </div>
            )}

            {/* Download Button (if type is Download) */}
            {resource.type === 'Download' && resource.external_url && (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">⬇️ Download Available</h3>
                <p className="text-gray-400 mb-4">Click below to access the downloadable resource.</p>
                <a
                  href={resource.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Download Now
                </a>
              </div>
            )}
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/resources"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            ← Back to All Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailPage;
