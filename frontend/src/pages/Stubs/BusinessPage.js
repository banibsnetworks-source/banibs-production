import React from 'react';
import { Link } from 'react-router-dom';

function BusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">🏢</div>
        <h1 className="text-4xl font-bold text-white mb-4">BANIBS Business</h1>
        <p className="text-xl text-gray-300 mb-8">
          Directory and marketplace integration coming soon.
        </p>
        <p className="text-gray-400 mb-8">
          Discover Black and Indigenous-owned businesses, access business resources, and explore marketplace opportunities.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/portal/business"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse Business Directory
          </Link>
          <Link
            to="/hub"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BusinessPage;
