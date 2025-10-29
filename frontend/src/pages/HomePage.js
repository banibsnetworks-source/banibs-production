import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../contexts/ContributorAuthContext';
import { useAuth } from '../contexts/AuthContext';
import NewsFeed from '../components/NewsFeed';
import FeaturedStory from '../components/FeaturedStory';

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
                Connecting Black America to news, information, opportunity, and business growth.
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          BANIBS
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mt-3 max-w-2xl mx-auto">
          Black America News Information & Business System
        </p>
        <p className="text-sm md:text-base text-gray-400 mt-2 max-w-3xl mx-auto">
          Connecting our people to opportunity, resources, and each other.
        </p>
      </section>

      {/* 🗂️ Browse by Category – compact pill nav under hero */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-lg">🗂️</span>
          <span>Browse by category</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/opportunities?type=job')}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            💼 Jobs & Careers
          </button>
          <button
            onClick={() => navigate('/opportunities?type=grant')}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            💰 Grants & Funding
          </button>
          <button
            onClick={() => navigate('/opportunities?type=scholarship')}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            🎓 Scholarships
          </button>
          <button
            onClick={() => navigate('/opportunities?type=training')}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            📚 Training & Education
          </button>
          <button
            onClick={() => navigate('/opportunities?type=event')}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            📅 Events & Networking
          </button>
        </div>
      </section>

      {/* 🌟 Featured Story - Dynamic from API */}
      <FeaturedStory />

      {/* News Feed - Dynamic from API */}
      <NewsFeed />

      {/* 🌐 BANIBS Network */}
      <section className="max-w-7xl mx-auto px-4 mt-10 md:mt-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span>The BANIBS Network</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* BANIBS Social */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <span className="text-xl">💬</span>
                <span>BANIBS Social</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Connect with Black and Indigenous creators, founders, and community leaders. Profiles, conversation, community.
              </p>
            </div>
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-800 opacity-60">
                Coming soon
              </span>
            </div>
          </div>

          {/* BANIBS TV */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <span className="text-xl">📺</span>
                <span>BANIBS TV</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Watch interviews, business spotlights, culture segments, and live community conversations.
              </p>
            </div>
            <div className="mt-4">
              <a
                href="#"
                className="text-sm font-semibold text-gray-800 hover:underline"
              >
                View Channel →
              </a>
            </div>
          </div>

          {/* BANIBS Business */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <span className="text-xl">🏢</span>
                <span>BANIBS Business</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Discover Black and Native Indigenous-owned businesses. Buy direct. Support local. Build wealth in the community.
              </p>
            </div>
            <div className="mt-4">
              <a
                href="#"
                className="text-sm font-semibold text-gray-800 hover:underline"
              >
                Browse Businesses →
              </a>
            </div>
          </div>

          {/* Resources / Funding / Support */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <span className="text-xl">📚</span>
                <span>Resources</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Grants, legal help, startup guides, funding tools, and education for founders, students, and organizers.
              </p>
            </div>
            <div className="mt-4">
              <a
                href="#"
                className="text-sm font-semibold text-gray-800 hover:underline"
              >
                Explore Resources →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 🏆 Community Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <span>Community Highlights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Highlight 1 */}
          <div className="border border-yellow-400/60 rounded-xl p-5 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="text-sm font-semibold text-yellow-700 mb-2">
              Recognition
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Top Indigenous-Led Companies of 2024
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Celebrating businesses that are making a difference and driving economic growth.
            </p>
            <a className="text-sm font-semibold text-yellow-700 mt-3 inline-block hover:underline" href="#">
              See the Full List →
            </a>
          </div>

          {/* Highlight 2 */}
          <div className="border border-yellow-400/60 rounded-xl p-5 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="text-sm font-semibold text-yellow-700 mb-2">
              Voice
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Op-Ed on Economic Sovereignty and Self-Determination
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Community leaders share perspectives on building wealth within our communities.
            </p>
            <a className="text-sm font-semibold text-yellow-700 mt-3 inline-block hover:underline" href="#">
              Read the Piece →
            </a>
          </div>
        </div>
      </section>

      {/* Opportunities CTA Section */}
      <section className="mt-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Looking for Opportunities?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-3 text-base">
            Browse curated jobs, grants, scholarships, training programs, and events
            specifically for Black and Indigenous communities.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/opportunities')}
              className="px-5 py-2.5 rounded-lg bg-white text-gray-900 font-semibold shadow hover:shadow-lg"
            >
              Browse Opportunities
            </button>

            <button
              onClick={() => navigate('/submit')}
              className="text-sm font-semibold text-white underline underline-offset-2 hover:text-gray-200"
            >
              Submit an Opportunity
            </button>
          </div>
        </div>
      </section>

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
