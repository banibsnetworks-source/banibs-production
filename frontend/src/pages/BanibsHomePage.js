/**
 * BANIBS Home Page - Front Door Orientation
 * 
 * Purpose: Brief, calm introduction to BANIBS and HDOS
 * Leads visitors to /foundation for the full canonical explanation
 * 
 * Design principles:
 * - Short and calm (no pressure language)
 * - Clarity > engagement
 * - EXIT preserved at all times
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const BanibsHomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#0C0C0C]' : 'bg-[#FAFAFA]'}`}
      data-testid="banibs-home-page"
    >
      <SEO 
        title="BANIBS & HDOS"
        description="BANIBS is an architecture designed to connect Black America, Africa, and the global African diaspora — without pressure, coercion, or forced engagement."
      />

      {/* Minimal Header */}
      <header className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link
            to="/"
            className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            BANIBS & HDOS
          </Link>
          <div className="flex gap-6">
            <Link
              to="/foundation"
              className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              data-testid="header-foundation-link"
            >
              Foundation
            </Link>
            <Link
              to="/foundation"
              className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              News
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        
        {/* What BANIBS Is */}
        <section className="mb-16" data-testid="banibs-intro-section">
          <h2 
            className={`text-3xl md:text-4xl font-semibold mb-8 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            What BANIBS Is
          </h2>
          <p 
            className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            BANIBS (Black America News, Information & Business System) is an architecture 
            designed to connect Black America, Africa, and the global African diaspora 
            across information, business, community, and culture — without pressure, 
            coercion, or forced engagement.
          </p>
          <p 
            className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            BANIBS is the vehicle that allows clarity-first participation and preserves 
            agency by design.
          </p>
        </section>

        {/* HDOS Introduction */}
        <section className="mb-16" data-testid="hdos-intro-section">
          <h2 
            className={`text-3xl md:text-4xl font-semibold mb-8 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            HDOS
          </h2>
          <p 
            className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            While building BANIBS, a repeatable pattern was identified in how pressure 
            collapses choice and shuts down examination. That discovery led to HDOS — 
            Human Decision-Space Operating System.
          </p>
          <p 
            className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            HDOS is not a doctrine or belief system. It is a lens for understanding how 
            decision space behaves under pressure and how agency is preserved when exit 
            and examination remain intact.
          </p>
        </section>

        {/* CTA */}
        <section className="pt-8" data-testid="foundation-cta-section">
          <Link
            to="/foundation"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#C8A857] hover:bg-[#B89847] text-[#0C0C0C] font-semibold rounded-lg transition-colors text-lg"
            data-testid="read-foundation-btn"
          >
            <BookOpen size={20} />
            Read the Foundation
            <ArrowRight size={18} />
          </Link>
          <p 
            className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
          >
            The full canonical explanation of BANIBS, HDOS, and the discoveries.
          </p>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className={`border-t ${isDark ? 'border-white/10' : 'border-black/10'} mt-auto`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} BANIBS
          </p>
          <div className="flex gap-6">
            <Link
              to="/"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/foundation"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Foundation
            </Link>
            <Link
              to="/foundation"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              News
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BanibsHomePage;
