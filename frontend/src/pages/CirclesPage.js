/**
 * BANIBS Guest Page - Canonical Source
 * 
 * The authoritative explanation of BANIBS and Circle Architecture
 * Guest-accessible (no auth required)
 * 
 * Design principles:
 * - Clarity > engagement
 * - EXIT preserved at all times
 * - No pressure language, no marketing CTAs
 * - Silence-first posture
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, BookOpen, Mail, Bell, Check, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { BANIBS_BOOKS, FOUNDATION_BOOKS } from '../config/booksConfig';

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
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  // Common styles
  const sectionClass = "mb-20";
  const headingClass = `text-2xl md:text-3xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`;
  const textClass = `text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const emphasisClass = `text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'} font-medium`;

  // Topology data for comparison table
  const topologies = [
    { name: 'Tree', principle: 'Rank & control', tradeoff: 'Bottlenecks, fragility' },
    { name: 'Star', principle: 'Central efficiency', tradeoff: 'Single point of failure' },
    { name: 'Mesh', principle: 'Maximum connection', tradeoff: 'Pressure, collapse' },
    { name: 'Ring', principle: 'Symmetry', tradeoff: 'Lock-in, inertia' },
    { name: 'Circle Architecture', principle: 'Context & boundaries', tradeoff: 'Intentionality over reach', highlight: true }
  ];

  return (
    <div 
      className={`min-h-screen relative ${isDark ? 'bg-[#0C0C0C]' : 'bg-[#FAFAFA]'}`}
      data-testid="circles-page"
    >
      <SEO 
        title="BANIBS — Black America News, Information & Business System"
        description="BANIBS introduces Circle Architecture — a network topology designed around decision space, not connection pressure."
      />

      {/* Minimal Header */}
      <header className={`border-b relative z-10 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link 
            to="/"
            className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            BANIBS
          </Link>
          <div className="flex gap-6">
            <Link
              to="/foundation"
              className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
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

      {/* Hero Section */}
      <section 
        className="relative w-full"
        data-testid="hero-section"
      >
        {/* Hero Image Container */}
        <div 
          className="relative w-full flex justify-center"
          style={{
            background: isDark 
              ? 'linear-gradient(to bottom, #0C0C0C 0%, #050510 50%, #0C0C0C 100%)'
              : 'linear-gradient(to bottom, #FAFAFA 0%, #f0f0f5 50%, #FAFAFA 100%)'
          }}
        >
          <img
            src="https://customer-assets.emergentagent.com/job_news-trust-system/artifacts/uh7naq3m_ChatGPT%20Image%20Jan%2030%2C%202026%2C%2002_16_03%20PM.png"
            alt="Circle Architecture visualization showing interconnected nodes with blurred human presence"
            className="w-full max-w-4xl h-auto"
            style={{ maxHeight: '70vh' }}
          />
        </div>
        
        {/* Title Overlay Below Image */}
        <div className="text-center py-12 md:py-16">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            BANIBS
          </h1>
          <p className={`text-lg md:text-xl font-semibold ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
            Black America News, Information & Business System
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12 relative z-10">
        
        {/* Section 1: A New Network Architecture */}
        <section className={sectionClass} data-testid="new-architecture-section">
          <h2 className={headingClass}>A New Network Architecture</h2>
          
          <p className={textClass}>
            BANIBS introduces a new network topology — one not built around feeds, hierarchies, or engagement loops.
          </p>
          
          <p className={textClass}>
            Most modern networks optimize for connection density: who connects to whom, how often, and at what scale. BANIBS is built differently.
          </p>
          
          <p className={emphasisClass}>
            Its core innovation is Circle Architecture — a topology designed around decision space, not connection pressure.
          </p>
          
          <div className={`my-8 pl-6 border-l-4 ${isDark ? 'border-[#C8A857]/50' : 'border-amber-400'}`}>
            <p className={textClass} style={{ marginBottom: 0 }}>
              This is not a visual metaphor.<br />
              It is a structural change in how networks organize interaction.
            </p>
          </div>
        </section>

        {/* Section 2: Circle Architecture */}
        <section className={sectionClass} data-testid="circle-architecture-section">
          <h2 className={headingClass}>Circle Architecture</h2>
          
          <p className={emphasisClass}>
            Circle Architecture is a decision-space topology.
          </p>
          
          <p className={textClass}>
            Instead of collapsing everyone into a single stream, the system is organized into distinct circles — bounded operating environments with their own context, visibility, and participation rules.
          </p>
          
          <p className={`${textClass} mt-6`}>Each circle preserves:</p>
          <ul className={`mb-8 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>intentional participation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>scoped visibility</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>constrained escalation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>and a clear right to exit</span>
            </li>
          </ul>
          
          <p className={textClass}>
            Movement between circles is voluntary, not algorithmic.<br />
            Distance is treated as a protective feature, not a failure.
          </p>
          
          <p className={textClass}>
            Multiple circles can coexist without collapsing into hierarchy, popularity ranking, or constant engagement.
          </p>
          
          <div className={`my-8 p-6 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
            <p className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`} style={{ marginBottom: 0 }}>
              This architecture allows truth to remain actionable,<br />
              and agency to remain intact.
            </p>
          </div>
        </section>

        {/* Section 3: Topology Comparison */}
        <section className={sectionClass} data-testid="topology-comparison-section">
          <h2 className={headingClass}>Topology Comparison</h2>
          
          <p className={textClass}>
            Most network architectures are defined by connection patterns:
          </p>
          
          <ul className={`mb-8 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className={`font-semibold min-w-[60px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Tree</span>
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>— hierarchical routing (parent → child)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-semibold min-w-[60px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Star</span>
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>— centralized routing (hub → nodes)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-semibold min-w-[60px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Mesh</span>
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>— saturation routing (everyone → everyone)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-semibold min-w-[60px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Ring</span>
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>— cyclic routing (peer → peer loop)</span>
            </li>
          </ul>
          
          <p className={emphasisClass}>
            All of these optimize for connectivity.
          </p>
          <p className={emphasisClass}>
            Circle Architecture optimizes for decision space.
          </p>
          
          {/* Comparison Table */}
          <div className={`my-8 overflow-x-auto rounded-lg border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Architecture</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Organizing Principle</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Primary Tradeoff</th>
                </tr>
              </thead>
              <tbody>
                {topologies.map((t, idx) => (
                  <tr 
                    key={t.name}
                    className={`border-t ${isDark ? 'border-white/5' : 'border-gray-100'} ${
                      t.highlight 
                        ? isDark ? 'bg-[#C8A857]/10' : 'bg-amber-50' 
                        : ''
                    }`}
                  >
                    <td className={`px-4 py-3 ${t.highlight ? 'font-semibold' : ''} ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {t.name}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.principle}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.tradeoff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className={`${textClass} mt-8`}>In Circle Architecture:</p>
          <ul className={`mb-8 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>Nodes don&apos;t just connect — they enter contexts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>Visibility is scoped, not global</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>Interaction is situational, not constant</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${isDark ? 'bg-[#C8A857]' : 'bg-amber-500'}`} />
              <span>Exit is preserved, not penalized</span>
            </li>
          </ul>
          
          <p className={emphasisClass}>
            This is why Circle Architecture does not behave like a feed, a graph, or a hierarchy — even though it is a network topology.
          </p>
        </section>

        {/* Divider */}
        <div className={`border-t my-16 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        {/* Continue Reading */}
        <section className={sectionClass} data-testid="continue-reading-section">
          <h2 className={headingClass}>Continue Reading</h2>
          <p className={textClass}>
            For the full explanation of BANIBS — including the discoveries behind it, the operating system (HDOS), and the canonical sequence — read the Foundation.
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

        {/* Optional Notifications */}
        <section className={sectionClass} data-testid="notifications-section">
          <h2 className={headingClass}>Optional Notifications</h2>
          <p className={textClass}>
            If you&apos;d like to be notified when this page is updated or when new parts of BANIBS open, you can opt in below.
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
            {FOUNDATION_BOOKS.map(title => {
              const book = BANIBS_BOOKS.find(b => b.title === title);
              const hasLink = book && book.url;
              const isComingSoon = book && book.comingSoon;
              
              return (
                <li key={title} className="flex items-start gap-3">
                  <BookOpen size={18} className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  {hasLink ? (
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                      data-testid={`book-link-${book.id}`}
                    >
                      {title}
                      <ExternalLink size={14} className="opacity-50" />
                    </a>
                  ) : isComingSoon ? (
                    <span className="flex items-center gap-2">
                      <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                        Coming Soon
                      </span>
                    </span>
                  ) : (
                    <span>{title}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className={`border-t relative z-10 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} BANIBS
          </p>
          <div className="flex gap-6">
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

export default CirclesPage;
