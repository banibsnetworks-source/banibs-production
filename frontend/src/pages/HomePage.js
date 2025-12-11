/**
 * BANIBS Homepage Layout Contract
 *
 * The BANIBS homepage must always include:
 *  - Brand identity headline ("BANIBS — Black America News, Information & Business System")
 *  - <QuickLinks /> identity nav (Social, Business, Information, Education, Youth, Opportunities, Resources)
 *  - FeaturedStory
 *  - NewsFeed / Latest Stories
 *  - The BANIBS Network section
 *  - Footer ecosystem line
 *
 * Removing <QuickLinks /> or moving it below content is a brand violation.
 * See /docs/BANIBS_IDENTITY_CONTRACT.md for details.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../contexts/ContributorAuthContext';
import { useAuth } from '../contexts/AuthContext';
import NewsFeed from '../components/NewsFeed';
import FeaturedStory from '../components/FeaturedStory';
import FeaturedVideo from '../components/FeaturedVideo';
import QuickLinks from '../components/QuickLinks';
import SEO from '../components/SEO';
import FeedbackModal from '../components/FeedbackModal'; // Phase 7.5.3
import FullWidthLayout from '../components/layouts/FullWidthLayout'; // Phase C Fix - Use global layout

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
    <FullWidthLayout>
      <div className="min-h-screen bg-black">
      <SEO 
        title="Black America News, Information & Business System"
        description="Connecting Black and Indigenous communities to news, opportunities, business resources, and education. Browse jobs, grants, scholarships, and Black-owned businesses."
      />
      {/* Navigation is now handled by FullWidthLayout's GlobalNavBar */}

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
                  className="btn-v2 btn-v2-outline btn-v2-sm"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/contributor/register')}
                  className="btn-v2 btn-v2-primary btn-v2-sm"
                  style={{ backgroundColor: '#FFD700', color: '#000' }}
                >
                  Become a Contributor
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="btn-v2 btn-v2-ghost btn-v2-sm"
                  style={{ color: '#FFD700' }}
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
                  className="btn-v2 btn-v2-primary btn-v2-sm"
                  style={{ backgroundColor: '#FFD700', color: '#000' }}
                >
                  Submit Opportunity
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="btn-v2 btn-v2-outline btn-v2-sm"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
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
                  className="btn-v2 btn-v2-primary btn-v2-sm"
                  style={{ backgroundColor: '#FFD700', color: '#000' }}
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="btn-v2 btn-v2-outline btn-v2-sm"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  View Opportunities
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-v2" style={{ background: 'linear-gradient(to bottom, #000000, #1a1a1a)' }} data-mode="business">
        <div className="hero-v2-content">
          <h1 className="hero-v2-title">
            BANIBS
          </h1>
          <p className="hero-v2-subtitle">
            Black America News Information & Business System
          </p>
          <p className="text-secondary-v2 breathing-room-sm max-w-3xl mx-auto">
            Connecting our people to opportunity, resources, and each other.
          </p>
        </div>
      </section>

      {/* Founder Insight #1 Teaser - Premium Message */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#1a1a1a] to-black">
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative overflow-hidden rounded-2xl p-8 md:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(0, 0, 0, 0.95) 100%)',
              border: '2px solid #FFD700',
              boxShadow: '0 20px 60px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.2)'
            }}
          >
            {/* Decorative corner accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-10"
              style={{
                background: 'radial-gradient(circle at top right, #FFD700 0%, transparent 70%)'
              }}
            />
            
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#FFD700] text-xs uppercase tracking-[0.2em] font-bold">
                Founder Insight
              </span>
              <span className="text-[#FFD700]/60 text-xs">•</span>
              <span className="text-gray-400 text-xs uppercase tracking-wider">
                Cultural Intelligence
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Founder Insight #1: The Devil's Dismissive Argument
              <span className="align-super text-sm">™</span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
              A powerful breakdown of a modern deception that erases accountability and distorts truth — 
              especially in families and especially for children. This Insight teaches how to recognize it, 
              name it, and break its influence.
            </p>

            {/* CTA */}
            <a
              href="/insights/devils-dismissive-argument"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FFC700] hover:from-[#FFC700] hover:to-[#FFB700] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)'
              }}
            >
              <span>Read the Full Insight</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {/* Bottom attribution */}
            <div className="mt-6 pt-6 border-t border-[#FFD700]/20">
              <p className="text-xs text-gray-500">
                by <span className="text-[#FFD700] font-semibold">Raymond Al Zedeck</span> · Founder of BANIBS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌐 BANIBS Core Quick Links - MANDATORY */}
      <QuickLinks />

      {/* 🌟 Featured Story - Dynamic from API */}
      <FeaturedStory />

      {/* 📺 BANIBS TV Featured Video - Dynamic from API */}
      <FeaturedVideo />

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
              <a
                href="/portal/social"
                className="text-sm font-semibold text-gray-800 hover:underline"
              >
                Open BANIBS Social →
              </a>
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
                href="/tv"
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
                href="/business-directory"
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
                href="/resources"
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
            <a className="text-sm font-semibold text-yellow-700 mt-3 inline-block hover:underline" href="/recognition">
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
            <a className="text-sm font-semibold text-yellow-700 mt-3 inline-block hover:underline" href="/voice">
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

          <div className="hero-v2-cta-group mt-6">
            <button
              onClick={() => navigate('/opportunities')}
              className="btn-v2 btn-v2-primary btn-v2-lg"
              style={{ backgroundColor: 'white', color: '#1a1a1a' }}
            >
              Browse Opportunities
            </button>

            <button
              onClick={() => navigate('/submit')}
              className="btn-v2 btn-v2-ghost btn-v2-md"
              style={{ color: 'white' }}
            >
              Submit an Opportunity
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-2 border-[#FFD700]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ecosystem Reinforcement Line */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm">
              Part of the BANIBS Ecosystem — Social • Business • Information • Education • Youth • Opportunities
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 BANIBS. Connecting Black America through news, business, and opportunity.
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
      
      {/* Phase 7.5.3 - Feedback Modal (floating button) */}
      <FeedbackModal />
      </div>
    </FullWidthLayout>
  );
};

export default HomePage;
