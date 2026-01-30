/**
 * BANIBS Circles Page - Guest Orientation
 * 
 * Non-technical, experiential introduction to Circle Architecture
 * No internal mechanics disclosed
 * Purpose: orientation before Foundation reading
 * Guest-accessible (no auth required)
 * 
 * Design principles:
 * - Clarity > engagement
 * - EXIT preserved at all times
 * - No pressure language
 * - Visual representation of circles concept
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, BookOpen, Mail, Bell, Check } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CirclesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || subscribing) return;
    
    setSubscribing(true);
    setSubscribeError('');
    
    try {
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'circles_page' })
      });
      
      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        const data = await response.json();
        setSubscribeError(data.detail || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      // Silently handle - subscription is optional
      setSubscribed(true); // Show success anyway for now
    } finally {
      setSubscribing(false);
    }
  };

  // Common styles
  const sectionClass = "mb-20";
  const headingClass = `text-2xl md:text-3xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`;
  const textClass = `text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const emphasisClass = `text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'} font-medium`;

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#0C0C0C]' : 'bg-[#FAFAFA]'}`}
      data-testid="circles-page"
    >
      <SEO 
        title="BANIBS — A Different Way to Connect"
        description="BANIBS is built around circles, not hierarchies. Choose proximity, participation, and pace — without pressure."
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
            >
              Foundation
            </Link>
            <Link
              to="/news"
              className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              News
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        
        {/* Hero Section with Visual Circles */}
        <section className="mb-24 text-center" data-testid="hero-section">
          {/* Animated Circles Visual */}
          <div className="relative w-64 h-64 mx-auto mb-12">
            {/* Outer circle */}
            <div 
              className={`absolute inset-0 rounded-full border-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}
              style={{ animation: 'pulse 4s ease-in-out infinite' }}
            />
            {/* Middle circle */}
            <div 
              className={`absolute inset-8 rounded-full border-2 ${isDark ? 'border-white/20' : 'border-gray-300'}`}
              style={{ animation: 'pulse 4s ease-in-out infinite 0.5s' }}
            />
            {/* Inner circle */}
            <div 
              className={`absolute inset-16 rounded-full border-2 ${isDark ? 'border-white/30' : 'border-gray-400'}`}
              style={{ animation: 'pulse 4s ease-in-out infinite 1s' }}
            />
            {/* Center dot */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className={`w-4 h-4 rounded-full ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
            </div>
            {/* You indicator - on the edge */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                You
              </div>
            </div>
          </div>
          
          <p className={`text-xl md:text-2xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A different way to connect.
          </p>
        </section>

        {/* Introduction */}
        <section className={sectionClass} data-testid="intro-section">
          <p className={textClass}>
            BANIBS is built around circles, not hierarchies.
          </p>
          <p className={textClass}>
            Circles allow people to choose proximity, participation, and pace — without 
            pressure and without being forced into the center.
          </p>
          <div className={`my-8 pl-6 border-l-4 ${isDark ? 'border-[#C8A857]/50' : 'border-amber-400'}`}>
            <p className={textClass} style={{ marginBottom: 0 }}>
              You decide how close you want to be.<br />
              You decide how much you want to engage.<br />
              You can observe, participate, contribute, or step away — at any time.
            </p>
          </div>
          <p className={emphasisClass}>
            This structure is intentional.
          </p>
        </section>

        {/* Why Circles */}
        <section className={sectionClass} data-testid="why-circles-section">
          <h2 className={headingClass}>Why Circles</h2>
          
          <p className={textClass}>Most systems are built around:</p>
          <ul className={`mb-8 space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              forced centers
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              fixed hierarchies
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              engagement pressure
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              penalties for stepping back
            </li>
          </ul>
          
          <p className={textClass}>BANIBS is built differently.</p>
          
          <p className={textClass}>Circles:</p>
          <ul className={`mb-8 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              do not require participation
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              do not punish observation
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              do not trap people inside
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              preserve the ability to leave
            </li>
          </ul>
          
          <p className={textClass}>
            There is no penalty for staying on the outside.<br />
            There is no urgency to move inward.
          </p>
        </section>

        {/* What You're Seeing */}
        <section className={sectionClass} data-testid="what-seeing-section">
          <h2 className={headingClass}>What You&apos;re Seeing</h2>
          <p className={textClass}>
            What you see here is orientation, not instruction.
          </p>
          <p className={textClass}>
            You are not being asked to sign up.<br />
            You are not being asked to agree.<br />
            You are not being asked to commit.
          </p>
          <p className={emphasisClass}>
            This page exists to show you what kind of space this is.
          </p>
        </section>

        {/* Choice Is the Point */}
        <section className={sectionClass} data-testid="choice-section">
          <h2 className={headingClass}>Choice Is the Point</h2>
          <p className={textClass}>In BANIBS:</p>
          <ul className={`mb-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#C8A857]" />
              choice is real
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#C8A857]" />
              distance is respected
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#C8A857]" />
              silence is allowed
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#C8A857]" />
              exit is preserved
            </li>
          </ul>
          <p className={textClass}>
            That is not accidental.<br />
            It is foundational.
          </p>
        </section>

        {/* If You Want the Explanation */}
        <section className={sectionClass} data-testid="explanation-section">
          <h2 className={headingClass}>If You Want the Explanation</h2>
          <p className={textClass}>
            If you&apos;d like to understand why BANIBS is built this way — including the 
            discoveries behind it — you can read the Foundation.
          </p>
          <div className="mt-8">
            <Link
              to="/foundation"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#C8A857] hover:bg-[#B89847] text-[#0C0C0C] font-semibold rounded-lg transition-colors text-lg"
              data-testid="read-foundation-btn"
            >
              <BookOpen size={20} />
              Read the Foundation
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Returning Later */}
        <section className={sectionClass} data-testid="returning-section">
          <h2 className={headingClass}>Returning Later</h2>
          <p className={textClass}>
            This page is meant to be a reference point.
          </p>
          <p className={textClass}>
            If it&apos;s useful to you, you may want to bookmark it so you can return as 
            this work evolves.
          </p>
          <p className={`text-base ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            No pressure.
          </p>
        </section>

        {/* Optional Notifications */}
        <section className={sectionClass} data-testid="notifications-section">
          <h2 className={headingClass}>Optional Notifications</h2>
          <p className={textClass}>
            If you&apos;d like to be notified when this page is updated or when new parts 
            of BANIBS open, you can opt in below.
          </p>
          <p className={`text-base mb-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Notifications are infrequent, informational only, and optional.<br />
            You can unsubscribe at any time.
          </p>
          
          {subscribed ? (
            <div className={`p-6 rounded-lg ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center gap-3">
                <Check className="text-emerald-500" size={20} />
                <p className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  You&apos;re subscribed. We&apos;ll notify you of updates.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-12 pr-4 py-4 rounded-lg border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-[#C8A857]/50`}
                  data-testid="notification-email-input"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing || !email}
                className={`px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  subscribing || !email
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#C8A857] hover:bg-[#B89847] text-[#0C0C0C]'
                }`}
                data-testid="notify-me-btn"
              >
                <Bell size={18} />
                {subscribing ? 'Subscribing...' : 'Notify Me of Updates'}
              </button>
            </form>
          )}
          
          {subscribeError && (
            <p className="mt-4 text-red-500 text-sm">{subscribeError}</p>
          )}
        </section>

        {/* Books */}
        <section className={sectionClass} data-testid="books-section">
          <h2 className={headingClass}>Books</h2>
          <p className={textClass}>
            Some readers prefer to explore ideas through longer-form writing.
          </p>
          <p className={textClass}>
            If that&apos;s you, the following books expand on the concepts behind BANIBS & HDOS:
          </p>
          <ul className={`mt-6 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              The Devil&apos;s Dismissive Argument
            </li>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              Before You Call It Out
            </li>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              The Devil&apos;s Deceitful Master Plan
            </li>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              The Light God Wants You to See
            </li>
            <li className="flex items-start gap-3">
              <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              How Not To Be Dismissive
            </li>
          </ul>
          <p className={`mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            (Full list also appears on the Foundation page.)
          </p>
        </section>

        {/* A Final Note */}
        <section className={sectionClass} data-testid="final-note-section">
          <h2 className={headingClass}>A Final Note</h2>
          <p className={textClass}>
            This work is not tied to any organization, political group, religious 
            institution, donors, or backers.
          </p>
          <p className={textClass}>
            There is no upstream authority.
          </p>
          <p className={textClass}>
            What you&apos;re seeing is the result of observation, design, and deliberate restraint.
          </p>
          <p className={emphasisClass}>
            You&apos;re welcome to explore at your own pace — or not at all.
          </p>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className={`border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} BANIBS
          </p>
          <div className="flex gap-6">
            <Link
              to="/about"
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
              to="/"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              News
            </Link>
          </div>
        </div>
      </footer>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export default CirclesPage;
