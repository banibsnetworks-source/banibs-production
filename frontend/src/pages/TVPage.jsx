import React from 'react';
import { Link } from 'react-router-dom';
import FullWidthLayout from '../components/layouts/FullWidthLayout';
import SEO from '../components/SEO';

/**
 * BANIBS TV Placeholder Page
 * Temporary landing page until TV section is fully built
 */
const TVPage = () => {
  return (
    <FullWidthLayout>
      <SEO 
        title="BANIBS TV - Coming Soon"
        description="Watch interviews, business spotlights, culture segments, and live community conversations."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">📺</div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            BANIBS TV
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Coming Soon
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              What to Expect
            </h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Interviews with Black and Indigenous entrepreneurs, leaders, and creators</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Business spotlights showcasing community success stories</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Culture segments celebrating our heritage and creativity</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Live community conversations on topics that matter</span>
              </li>
            </ul>
          </div>
          
          <Link 
            to="/"
            className="inline-block px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default TVPage;
