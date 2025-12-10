import React from 'react';
import { Link } from 'react-router-dom';
import FullWidthLayout from '../components/layouts/FullWidthLayout';
import SEO from '../components/SEO';

/**
 * Recognition Placeholder Page
 * Temporary landing page for community recognition features
 */
const RecognitionPage = () => {
  return (
    <FullWidthLayout>
      <SEO 
        title="Recognition - BANIBS"
        description="Celebrating Black and Indigenous businesses, leaders, and community champions."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🏆</div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Recognition
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Coming Soon
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Celebrating Our Community
            </h2>
            <p className="text-gray-700 mb-6">
              This section will highlight and celebrate:
            </p>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Top Black and Indigenous-led companies</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Community leaders making a difference</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Rising stars and innovators</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">✓</span>
                <span>Organizations driving economic growth</span>
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

export default RecognitionPage;
