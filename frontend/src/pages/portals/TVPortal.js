import React from 'react';
import GlobalNavBar from '../../components/GlobalNavBar';
import BanibsTVCard from '../../components/BanibsTVCard';
import SEO from '../../components/SEO';
import { useTheme } from '../../contexts/ThemeContext';
import { Play } from 'lucide-react';

/**
 * TVPortal - Phase 8.2
 * BANIBS TV Portal landing page
 */
const TVPortal = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="min-h-screen" style={{
      backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(249, 250, 251)'
    }}>
      <SEO
        title="BANIBS TV - Watch Live & On-Demand"
        description="Watch BANIBS TV live streams, news programs, and community content."
      />
      <GlobalNavBar />

      {/* Hero */}
      <div className="py-20" style={{
        background: isDark
          ? 'linear-gradient(to bottom right, rgb(127, 29, 29), rgb(17, 24, 39))'
          : 'linear-gradient(to bottom right, rgb(254, 202, 202), rgb(252, 165, 165))'
      }}>
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-full mb-6">
            <Play size={20} className="text-white" fill="white" />
            <span className="text-white font-bold">LIVE NOW</span>
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{
            color: isDark ? 'white' : 'rgb(17, 24, 39)'
          }}>
            BANIBS TV
          </h1>
          <p className="text-xl mb-8" style={{
            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
          }}>
            Your source for Black & Indigenous media
          </p>
        </div>
      </div>

      {/* Featured Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Now</h2>
          <BanibsTVCard />

          <div className="mt-12 text-center">
            <div className="inline-block px-6 py-3 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">
                Full TV Portal with live streams, show library, and schedules coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPortal;