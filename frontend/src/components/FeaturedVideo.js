import React, { useState, useEffect } from 'react';

const FeaturedVideo = () => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedMedia();
  }, []);

  const fetchFeaturedMedia = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/media/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured media');
      }
      
      const data = await response.json();
      setMedia(data);
    } catch (err) {
      console.error('Error fetching featured media:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-[1100px] mx-auto px-4 mb-10">
        <div className="text-yellow-400 text-xs font-semibold tracking-wide uppercase mb-2">
          BANIBS TV
        </div>
        <div className="relative w-full h-56 md:h-48 rounded-2xl bg-black/40 border border-yellow-400/30 flex items-center justify-center">
          <div className="text-yellow-300/70 text-sm">Loading BANIBS TV...</div>
        </div>
      </section>
    );
  }

  // If error or no media, show empty state (not an error to user)
  if (error || !media) {
    return (
      <section className="w-full max-w-[1100px] mx-auto px-4 mb-10">
        <div className="text-yellow-400 text-xs font-semibold tracking-wide uppercase mb-2">
          BANIBS TV
        </div>
        <div className="relative w-full rounded-2xl overflow-hidden bg-black/60 border border-yellow-400/30 shadow-xl flex flex-col md:flex-row">
          {/* Placeholder thumbnail */}
          <div className="w-full md:w-1/2 h-56 md:h-auto bg-black/40 border-b md:border-b-0 md:border-r border-yellow-400/20 flex items-center justify-center">
            <div className="text-yellow-300/80 italic text-sm text-center px-4">
              BANIBS TV • Community Voices
            </div>
          </div>
          
          {/* Placeholder content */}
          <div className="flex-1 p-6 flex flex-col justify-between text-white">
            <div>
              <div className="text-[0.7rem] text-yellow-300/80 uppercase tracking-wide mb-2">
                BANIBS TV
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 leading-snug">
                Stories From The Network
              </h2>
              <p className="text-sm text-gray-200/90 mb-4 leading-relaxed">
                Community wealth building, youth innovation, and real talk from founders, organizers, and educators shaping the future.
              </p>
            </div>
            
            <div className="flex items-center justify-between text-[0.8rem]">
              <span className="text-yellow-400/70 font-medium">
                Coming Soon
              </span>
              <div className="text-[0.7rem] text-yellow-300/60 italic">
                BANIBS TV
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 mb-10">
      <div className="text-yellow-400 text-xs font-semibold tracking-wide uppercase mb-2">
        BANIBS TV
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden bg-black/60 border border-yellow-400/30 shadow-xl flex flex-col md:flex-row">
        {/* Thumbnail / fallback block */}
        <div className="w-full md:w-1/2 h-56 md:h-auto bg-black/40 border-b md:border-b-0 md:border-r border-yellow-400/20 flex items-center justify-center overflow-hidden">
          {media.thumbnailUrl ? (
            <img
              src={media.thumbnailUrl}
              alt={`BANIBS TV video thumbnail: ${media.title}`}
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
          ) : (
            <div className="text-yellow-300/80 italic text-sm text-center px-4">
              BANIBS TV • {media.tag || "Community Voices"}
            </div>
          )}
        </div>

        {/* Content block */}
        <div className="flex-1 p-6 flex flex-col justify-between text-white">
          <div>
            <div className="text-[0.7rem] text-yellow-300/80 uppercase tracking-wide mb-2">
              {media.tag || "BANIBS TV"}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2 leading-snug">
              {media.title}
            </h2>
            {media.description && (
              <p className="text-sm text-gray-200/90 mb-4 leading-relaxed">
                {media.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[0.8rem]">
            <a
              href={media.videoUrl}
              target={media.external ? "_blank" : "_self"}
              rel={media.external ? "noopener noreferrer" : undefined}
              className="text-yellow-400 hover:text-yellow-200 font-medium transition-colors"
            >
              Watch Now →
            </a>
            <div className="text-[0.7rem] text-yellow-300/60 italic">
              {media.sourceName || "BANIBS TV"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideo;