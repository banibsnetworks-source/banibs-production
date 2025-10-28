import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../contexts/ContributorAuthContext';
import { useAuth } from '../contexts/AuthContext';
import NewsFeed from '../components/NewsFeed';

const HomePage = () => {
  const navigate = useNavigate();
  const { contributorUser } = useContributorAuth();
  const { user: adminUser } = useAuth();

  // Determine login state
  const isLoggedIn = contributorUser || adminUser;
  const isContributor = contributorUser && !adminUser;
  const isAdmin = adminUser && (adminUser.role === 'super_admin' || adminUser.role === 'moderator');
  const displayName = contributorUser?.name || adminUser?.email || 'User';

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b-2 border-[#FFD700] bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-[#FFD700] cursor-pointer"
              >
                BANIBS
              </h1>
            </div>
            
            <div className="flex gap-8 items-center">
              {/* Group A: Directories */}
              <div className="hidden lg:flex gap-4 items-center border-r border-[#FFD700]/20 pr-8">
                <button
                  onClick={() => navigate('/opportunities?type=job')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Jobs
                </button>
                <button
                  onClick={() => navigate('/opportunities?type=grant')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Grants
                </button>
                <button
                  onClick={() => navigate('/opportunities?type=scholarship')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Scholarships
                </button>
                <button
                  onClick={() => navigate('/opportunities?type=training')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Training
                </button>
                <button
                  onClick={() => navigate('/opportunities?type=event')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Events
                </button>
              </div>

              {/* Group B: Explore */}
              <div className="hidden lg:flex gap-4 items-center border-r border-[#FFD700]/20 pr-8">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="text-sm text-[#FFD700] hover:underline transition-all font-medium"
                >
                  View Opportunities
                </button>
                <button
                  onClick={() => navigate('/opportunity-hub')}
                  className="text-sm text-gray-300 hover:text-[#FFD700] transition-all font-medium"
                >
                  Opportunity Hub
                </button>
              </div>

              {/* Group C: Account/Power */}
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => navigate('/submit')}
                  className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all text-sm"
                >
                  Submit Opportunity
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="px-4 py-2 text-gray-400 hover:text-[#FFD700] transition-all text-sm"
                  >
                    Admin Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Membership Welcome Band */}
      <div className="bg-[#1a1a1a] border-b border-[#FFD700]/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isLoggedIn ? (
            // Not logged in
            <div className="flex justify-between items-center">
              <p className="text-gray-300 text-sm">
                BANIBS is a network for Black and Native Indigenous businesses and opportunity.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/contributor/login')}
                  className="px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded hover:bg-[#FFD700] hover:text-black transition-all text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/contributor/register')}
                  className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all text-sm"
                >
                  Become a Contributor
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="px-4 py-2 text-[#FFD700] hover:underline transition-all text-sm font-medium"
                >
                  Browse Opportunities
                </button>
              </div>
            </div>
          ) : isContributor ? (
            // Logged in as contributor
            <div className="flex justify-between items-center">
              <p className="text-[#FFD700] text-sm font-medium">
                Welcome back, {displayName}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/submit')}
                  className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all text-sm"
                >
                  Submit Opportunity
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded hover:bg-[#FFD700] hover:text-black transition-all text-sm font-medium"
                >
                  View Your Submissions
                </button>
              </div>
            </div>
          ) : (
            // Logged in as admin
            <div className="flex justify-between items-center">
              <p className="text-[#FFD700] text-sm font-medium">
                Welcome back, {displayName}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/admin/opportunities')}
                  className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all text-sm"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded hover:bg-[#FFD700] hover:text-black transition-all text-sm font-medium"
                >
                  View Opportunities
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero/Masthead */}
      <div className="relative bg-gradient-to-b from-black to-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#FFD700] mb-4 tracking-tight">
              BANIBS
            </h1>
            <p className="text-xl text-white">
              Black and Native Indigenous Business Stories
            </p>
            <p className="text-gray-400 mt-2">
              News, Culture, and Community Highlights
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 Featured Story */}
      <section className="max-w-7xl mx-auto mt-8 px-4">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 md:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start gap-6">

            {/* Optional Image / Placeholder block */}
            <div className="w-full md:w-1/3 rounded-xl bg-gray-200 overflow-hidden shadow-sm flex items-center justify-center text-gray-500 text-sm font-medium">
              {/* Replace this div with an <img /> when you have a real thumbnail */}
              <span className="p-6 text-center">
                Featured Story Image
                <br />
                (optional)
              </span>
            </div>

            {/* Text Content */}
            <div className="w-full md:w-2/3">
              <div className="text-sm font-semibold text-indigo-700 tracking-wide mb-2 flex items-center gap-2">
                <span className="text-lg">🌟</span>
                <span>Featured Story</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Building the Future: Indigenous Tech Leaders Breaking Ground
              </h2>

              <p className="text-gray-700 mt-3 text-base leading-relaxed">
                Meet the entrepreneurs and innovators from Black and Indigenous communities
                who are shaping the next generation of technology and business leadership.
              </p>

              {/* CTA Row */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href="#"
                  className="inline-block text-center text-white bg-gray-900 hover:bg-black rounded-lg px-4 py-2 text-sm font-semibold shadow"
                >
                  Read Full Story
                </a>

                <div className="text-xs text-gray-500 sm:ml-2">
                  Editorial • Community & Innovation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗂️ Browse by Category – mobile responsive & visually balanced */}
      <section className="max-w-7xl mx-auto mt-10 px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 text-center">
          Browse by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Jobs & Careers */}
          <button
            onClick={() => navigate('/opportunities?type=job')}
            className="flex flex-col items-center border border-gray-100 rounded-2xl p-5 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out"
          >
            <span className="text-3xl mb-2">💼</span>
            <h3 className="font-semibold text-gray-800">Jobs & Careers</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Employment opportunities</p>
          </button>

          {/* Grants & Funding */}
          <button
            onClick={() => navigate('/opportunities?type=grant')}
            className="flex flex-col items-center border border-gray-100 rounded-2xl p-5 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out"
          >
            <span className="text-3xl mb-2">💰</span>
            <h3 className="font-semibold text-gray-800">Grants & Funding</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Financial support</p>
          </button>

          {/* Scholarships */}
          <button
            onClick={() => navigate('/opportunities?type=scholarship')}
            className="flex flex-col items-center border border-gray-100 rounded-2xl p-5 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out"
          >
            <span className="text-3xl mb-2">🎓</span>
            <h3 className="font-semibold text-gray-800">Scholarships</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Education funding</p>
          </button>

          {/* Training & Education */}
          <button
            onClick={() => navigate('/opportunities?type=training')}
            className="flex flex-col items-center border border-gray-100 rounded-2xl p-5 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out"
          >
            <span className="text-3xl mb-2">📚</span>
            <h3 className="font-semibold text-gray-800">Training & Education</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Skill development</p>
          </button>

          {/* Events & Networking */}
          <button
            onClick={() => navigate('/opportunities?type=event')}
            className="flex flex-col items-center border border-gray-100 rounded-2xl p-5 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out"
          >
            <span className="text-3xl mb-2">📅</span>
            <h3 className="font-semibold text-gray-800">Events & Networking</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Community connections</p>
          </button>
        </div>
      </section>

      {/* News Feed - Dynamic from API */}
      <NewsFeed />

      {/* Community Highlights Section */}
      <div className="bg-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-8 text-center">Community Highlights</h2>
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Highlight 1 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏆</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Recognition: Top Indigenous-Led Companies of 2024
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Celebrating businesses that are making a difference and driving economic growth.
                  </p>
                  <button className="text-[#FFD700] font-semibold hover:underline">
                    See the Full List →
                  </button>
                </div>
              </div>
            </div>

            {/* Highlight 2 */}
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-8 hover:border-[#FFD700] transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📢</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Voice: Op-Ed on Economic Sovereignty and Self-Determination
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Community leaders share perspectives on building wealth within our communities.
                  </p>
                  <button className="text-[#FFD700] font-semibold hover:underline">
                    Read the Piece →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Opportunities CTA Section */}
      <div className="py-16 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#FFD700] mb-6">
            Looking for Opportunities?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Browse curated jobs, grants, scholarships, training programs, and events 
            specifically for Black and Indigenous communities.
          </p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => navigate('/opportunities')}
              className="px-8 py-4 bg-[#FFD700] text-black font-bold text-lg rounded-lg hover:bg-[#FFC700] transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            >
              Browse Opportunities
            </button>
            <button
              onClick={() => navigate('/opportunity-hub')}
              className="px-8 py-4 border-2 border-[#FFD700] text-[#FFD700] font-bold text-lg rounded-lg hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t-2 border-[#FFD700]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 BANIBS. Celebrating Black and Native Indigenous businesses.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => navigate('/opportunities')}
                className="text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Opportunities
              </button>
              <button
                onClick={() => navigate('/opportunity-hub')}
                className="text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Opportunity Hub
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
