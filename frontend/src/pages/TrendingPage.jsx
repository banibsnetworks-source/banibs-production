import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

/**
 * Trending Topics Placeholder Page
 * Temporary landing page until trending feature is fully built
 */
const TrendingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Trending Topics - BANIBS Social"
        description="Discover what's trending on BANIBS Social"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trending Topics
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Coming Soon
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            What to Expect
          </h2>
          <p className="text-gray-700 mb-6">
            The Trending Topics page will show you what the BANIBS community is talking about right now.
          </p>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3 text-xl">✓</span>
              <span>Real-time trending hashtags and topics</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3 text-xl">✓</span>
              <span>Popular posts and discussions</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3 text-xl">✓</span>
              <span>Community-driven content discovery</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3 text-xl">✓</span>
              <span>Filter by category and timeframe</span>
            </li>
          </ul>
        </div>
        
        <Link 
          to="/portal/social"
          className="inline-flex items-center space-x-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to BANIBS Social</span>
        </Link>
      </div>
    </div>
  );
};

export default TrendingPage;
