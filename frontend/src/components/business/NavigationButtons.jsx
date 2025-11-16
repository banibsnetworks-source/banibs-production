import React from 'react';
import { Navigation, Map, MapPin } from 'lucide-react';

/**
 * NavigationButtons - Phase 8.2.3
 * Provides navigation links to Waze, Google Maps, and Apple Maps
 * Waze is prioritized as the first-class option
 */

const NavigationButtons = ({ business, className = '' }) => {
  if (!business) return null;
  
  const { latitude, longitude, address_line1, city, state, postal_code } = business;
  
  // Build navigation URLs
  const getWazeUrl = () => {
    if (latitude && longitude) {
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    }
    // Fallback to address
    const address = [address_line1, city, state, postal_code]
      .filter(Boolean)
      .join(', ');
    return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
  };
  
  const getGoogleMapsUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
    const address = [address_line1, city, state, postal_code]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };
  
  const getAppleMapsUrl = () => {
    if (latitude && longitude) {
      return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    }
    const address = [address_line1, city, state, postal_code]
      .filter(Boolean)
      .join(', ');
    return `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
  };
  
  // Detect iOS for Apple Maps emphasis
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      {/* Waze - Always first and prominent */}
      <a
        href={getWazeUrl()}
        target=\"_blank\"
        rel=\"noopener noreferrer\"
        className=\"flex items-center justify-center gap-2 px-4 py-2 bg-[#33CCFF] hover:bg-[#00B3E6] text-white rounded-lg transition-colors font-medium\"
        title=\"Navigate with Waze\"
      >
        <Navigation className=\"w-4 h-4\" />
        <span className=\"hidden sm:inline\">Waze</span>
      </a>
      
      {/* Google Maps */}
      <a
        href={getGoogleMapsUrl()}
        target=\"_blank\"
        rel=\"noopener noreferrer\"
        className=\"flex items-center justify-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-[#357AE8] text-white rounded-lg transition-colors\"
        title=\"Navigate with Google Maps\"
      >
        <Map className=\"w-4 h-4\" />
        <span className=\"hidden sm:inline\">Google</span>
      </a>
      
      {/* Apple Maps - Show prominently on iOS */}
      <a
        href={getAppleMapsUrl()}
        target=\"_blank\"
        rel=\"noopener noreferrer\"
        className={`flex items-center justify-center gap-2 px-4 py-2 ${
          isIOS 
            ? 'bg-[#007AFF] hover:bg-[#0051D5]' 
            : 'bg-slate-700 hover:bg-slate-600'
        } text-white rounded-lg transition-colors`}
        title=\"Navigate with Apple Maps\"
      >
        <MapPin className=\"w-4 h-4\" />
        <span className=\"hidden sm:inline\">Apple</span>
      </a>
    </div>
  );
};

export default NavigationButtons;
