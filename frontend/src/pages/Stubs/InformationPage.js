import React from 'react';
import { Link } from 'react-router-dom';

function InformationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">ℹ️</div>
        <h1 className="text-4xl font-bold text-white mb-4">BANIBS Information</h1>
        <p className="text-xl text-gray-300 mb-8">
          Verified data, reports, and civic resources coming soon.
        </p>
        <p className="text-gray-400 mb-8">
          Access trusted information, community data, civic resources, and verified reports relevant to Black and Indigenous communities.
        </p>
        <Link
          to="/hub"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          ← Back to Hub
        </Link>
      </div>
    </div>
  );
}

export default InformationPage;
