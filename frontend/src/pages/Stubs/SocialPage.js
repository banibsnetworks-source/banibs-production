import React from 'react';
import { Link } from 'react-router-dom';

function SocialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">👥</div>
        <h1 className="text-4xl font-bold text-white mb-4">BANIBS Social</h1>
        <p className="text-xl text-gray-300 mb-8">
          Community feed, profiles, and social networking features coming in Phase 7.
        </p>
        <p className="text-gray-400 mb-8">
          Connect with Black and Indigenous community members, share stories, and build meaningful relationships.
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

export default SocialPage;
