import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b-2 border-[#FFD700] bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#FFD700]">BANIBS</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/opportunities')}
                className="px-4 py-2 text-[#FFD700] hover:bg-[#FFD700] hover:text-black rounded transition-all"
              >
                View Opportunities
              </button>
              <button
                onClick={() => navigate('/submit')}
                className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all"
              >
                Submit Opportunity
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-4 py-2 text-gray-400 hover:text-[#FFD700] transition-all"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-[#FFD700] mb-6 tracking-tight">
              BANIBS
            </h1>
            <p className="text-2xl text-white mb-4">
              Black and Native Indigenous Business Opportunities
            </p>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Discover curated opportunities for Black and Native Indigenous communities.
              Jobs, grants, scholarships, training programs, and events — all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/opportunities')}
                className="px-8 py-4 bg-[#FFD700] text-black font-bold text-lg rounded-lg hover:bg-[#FFC700] transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              >
                Browse Opportunities
              </button>
              <button
                onClick={() => navigate('/contributor/register')}
                className="px-8 py-4 border-2 border-[#FFD700] text-[#FFD700] font-bold text-lg rounded-lg hover:bg-[#FFD700] hover:text-black transition-all"
              >
                Become a Contributor
              </button>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-radial from-[#FFD700]/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Features Section */}
      <div className="bg-[#1a1a1a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-16">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-white mb-3">Jobs & Careers</h3>
              <p className="text-gray-400">
                Find employment opportunities specifically seeking diverse talent from Black and Indigenous communities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">Grants & Funding</h3>
              <p className="text-gray-400">
                Discover grants, funding opportunities, and financial support for entrepreneurs and businesses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-white mb-3">Education & Training</h3>
              <p className="text-gray-400">
                Access scholarships, training programs, and educational resources to advance your skills.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-3">Events & Networking</h3>
              <p className="text-gray-400">
                Connect with community events, conferences, and networking opportunities.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-white mb-3">Curated & Verified</h3>
              <p className="text-gray-400">
                Every opportunity is human-reviewed and verified to ensure quality and relevance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-white mb-3">Community-Driven</h3>
              <p className="text-gray-400">
                Contributors from the community help source and share opportunities for collective growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#FFD700] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Whether you're looking for opportunities or want to share them with the community,
            BANIBS is here to help.
          </p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => navigate('/opportunities')}
              className="px-8 py-4 bg-[#FFD700] text-black font-bold text-lg rounded-lg hover:bg-[#FFC700] transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            >
              Explore Opportunities
            </button>
            <button
              onClick={() => navigate('/submit')}
              className="px-8 py-4 border-2 border-[#FFD700] text-[#FFD700] font-bold text-lg rounded-lg hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Share an Opportunity
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t-2 border-[#FFD700]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 BANIBS. All opportunities are human-reviewed and curated.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => navigate('/opportunities')}
                className="text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Browse
              </button>
              <button
                onClick={() => navigate('/submit')}
                className="text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Submit
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
