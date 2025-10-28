import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

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
            
            {/* Category Links */}
            <div className="hidden lg:flex gap-6 items-center flex-1 justify-center">
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

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/opportunities')}
                className="px-4 py-2 text-[#FFD700] hover:bg-[#FFD700] hover:text-black rounded transition-all text-sm"
              >
                View Opportunities
              </button>
              <button
                onClick={() => navigate('/submit')}
                className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all text-sm"
              >
                Submit Opportunity
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-4 py-2 text-gray-400 hover:text-[#FFD700] transition-all text-sm"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

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

      {/* Browse by Category - Quick Access */}
      <div className="bg-black py-12 border-b-2 border-[#FFD700]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-6 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Jobs */}
            <button
              onClick={() => navigate('/opportunities?type=job')}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all group"
            >
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-[#FFD700]">Jobs & Careers</h3>
              <p className="text-gray-400 text-xs">Employment opportunities</p>
            </button>

            {/* Grants */}
            <button
              onClick={() => navigate('/opportunities?type=grant')}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all group"
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-[#FFD700]">Grants & Funding</h3>
              <p className="text-gray-400 text-xs">Financial support</p>
            </button>

            {/* Scholarships */}
            <button
              onClick={() => navigate('/opportunities?type=scholarship')}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all group"
            >
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-[#FFD700]">Scholarships</h3>
              <p className="text-gray-400 text-xs">Education funding</p>
            </button>

            {/* Training */}
            <button
              onClick={() => navigate('/opportunities?type=training')}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all group"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-[#FFD700]">Training & Education</h3>
              <p className="text-gray-400 text-xs">Skill development</p>
            </button>

            {/* Events */}
            <button
              onClick={() => navigate('/opportunities?type=event')}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all group"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-white font-bold mb-1 group-hover:text-[#FFD700]">Events & Networking</h3>
              <p className="text-gray-400 text-xs">Community connections</p>
            </button>

          </div>
        </div>
      </div>

      {/* Featured Story / Hero Article */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image placeholder */}
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-black h-80 flex items-center justify-center">
              <div className="text-6xl">🌟</div>
            </div>
            {/* Content */}
            <div className="p-8 flex flex-col justify-center">
              <span className="text-[#FFD700] text-sm font-semibold uppercase tracking-wide mb-2">
                Featured Story
              </span>
              <h2 className="text-3xl font-bold text-white mb-4">
                Building the Future: Indigenous Tech Leaders Breaking Ground
              </h2>
              <p className="text-gray-400 mb-6">
                Meet the entrepreneurs and innovators from Black and Indigenous communities 
                who are shaping the next generation of technology and business leadership.
              </p>
              <button className="self-start px-6 py-3 bg-[#FFD700] text-black font-semibold rounded hover:bg-[#FFC700] transition-all">
                Read Full Story
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid / Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-[#FFD700] mb-8">Latest Stories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Story Card 1 */}
          <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg overflow-hidden hover:border-[#FFD700] transition-all">
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-black h-48 flex items-center justify-center">
              <div className="text-4xl">💼</div>
            </div>
            <div className="p-6">
              <span className="text-[#FFD700] text-xs font-semibold uppercase">Business</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">
                New Grant Program Supports Native-Owned Startups
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                A $5M initiative aims to fund Indigenous entrepreneurs across North America.
              </p>
              <button className="text-[#FFD700] text-sm font-semibold hover:underline">
                Read More →
              </button>
            </div>
          </div>

          {/* Story Card 2 */}
          <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg overflow-hidden hover:border-[#FFD700] transition-all">
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-black h-48 flex items-center justify-center">
              <div className="text-4xl">🎓</div>
            </div>
            <div className="p-6">
              <span className="text-[#FFD700] text-xs font-semibold uppercase">Education</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">
                Scholarship Fund Opens Applications for Fall 2025
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Full-ride opportunities for Black and Indigenous students pursuing STEM degrees.
              </p>
              <button className="text-[#FFD700] text-sm font-semibold hover:underline">
                Read More →
              </button>
            </div>
          </div>

          {/* Story Card 3 */}
          <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg overflow-hidden hover:border-[#FFD700] transition-all">
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-black h-48 flex items-center justify-center">
              <div className="text-4xl">🌍</div>
            </div>
            <div className="p-6">
              <span className="text-[#FFD700] text-xs font-semibold uppercase">Community</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">
                Annual Indigenous Business Summit Announces 2025 Dates
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect with leaders, investors, and fellow entrepreneurs this October.
              </p>
              <button className="text-[#FFD700] text-sm font-semibold hover:underline">
                Read More →
              </button>
            </div>
          </div>

        </div>
      </div>

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
