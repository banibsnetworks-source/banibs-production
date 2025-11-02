import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePanel = ({ user }) => {
  const navigate = useNavigate();
  const [showCommunityStub, setShowCommunityStub] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const handlePostToCommunity = () => {
    setShowCommunityStub(true);
    setTimeout(() => setShowCommunityStub(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl p-8 border border-yellow-400/20 shadow-lg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="text-yellow-400 text-6xl font-bold rotate-12 absolute top-4 right-4">
          BANIBS
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          Here's what's happening today.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/business/new')}
            className="px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add a Business</span>
          </button>
          
          <button
            onClick={handlePostToCommunity}
            className="px-5 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700"
          >
            Post to Community
          </button>
          
          <button
            onClick={() => navigate('/opportunities')}
            className="px-5 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700"
          >
            View Opportunities
          </button>
          
          <button
            onClick={() => navigate('/news')}
            className="px-5 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700"
          >
            Read News
          </button>
        </div>

        {/* Rotating Tagline */}
        <div className="mt-6 text-gray-400 text-sm italic">
          News • Business • Community • Opportunity
        </div>
      </div>

      {/* Community Stub Modal */}
      {showCommunityStub && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl z-20">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Community Coming Soon
              </h3>
              <p className="text-gray-600">
                Community posts will be available in Phase 6.2. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePanel;
