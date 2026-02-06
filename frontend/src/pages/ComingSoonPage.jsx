import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Mail, ChevronDown, BookOpen, Shield, Users } from 'lucide-react';
import { BANIBS_BOOKS } from '../config/booksConfig';

/**
 * BANIBS Guest Page - Full Redesign
 * An orientation and presence page — editorial, intentional, alive.
 */

// Use shared books config
const BOOKS = BANIBS_BOOKS;

// Animated dot grid component - subtle network/signal visualization
const DotGrid = () => {
  return (
    <div 
      className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none hidden lg:block"
      style={{ opacity: 0.25 }}
    >
      {/* Animated dot grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(197, 160, 89, 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'drift 60s linear infinite',
        }}
      />
      {/* Fade gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #020408 0%, transparent 50%)'
        }}
      />
      {/* CSS Animation */}
      <style>{`
        @keyframes drift {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  );
};

// Human visual anchor - editorial community image
const HeroImage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div 
      className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[58%] overflow-hidden pointer-events-none hidden md:block"
    >
      {/* Image container */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <img
          src="https://customer-assets.emergentagent.com/job_98eb7880-3cdf-494f-b92e-cec2c58a40ae/artifacts/fytksw5q_QARSP23-BlackStudies-WadeHudson-BlackStudiesFaculty_0.jpg"
          alt="Black community in conversation"
          className="w-full h-full object-cover"
          style={{ objectPosition: '40% center' }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      
      {/* Dark overlay gradients for blending - lighter to show more image */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, #020408 0%, rgba(2, 4, 8, 0.85) 8%, rgba(2, 4, 8, 0.4) 25%, rgba(2, 4, 8, 0.15) 50%, rgba(2, 4, 8, 0.1) 100%),
            linear-gradient(180deg, rgba(2, 4, 8, 0.15) 0%, transparent 20%, transparent 80%, rgba(2, 4, 8, 0.3) 100%)
          `
        }}
      />
      
      {/* Subtle gold tint overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(197, 160, 89, 0.04) 100%)',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

// BANIBS Seal - reduced to subtle background element
const BanibsSeal = () => {
  return null; // Removed from hero - human image takes priority
};

// Animated text reveal component
const RevealText = ({ children, delay = 0, className = "", block = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Section reveal on scroll
const Section = ({ children, className = "", id = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById(id);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [id]);
  
  return (
    <section 
      id={id}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </section>
  );
};

const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredBook, setHoveredBook] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('banibs_early_access', JSON.stringify(existing));
      setSubmitted(true);
    }
  };

  return (
    <div 
      data-testid="guest-page"
      className="min-h-screen text-white selection:bg-[#C5A059] selection:text-black"
      style={{ 
        backgroundColor: '#020408',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Hero Section */}
      <section 
        data-testid="hero-section"
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(30, 58, 138, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(197, 160, 89, 0.08) 0%, transparent 50%)'
          }}
        />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')"
          }}
        />

        {/* Human visual anchor - editorial community image */}
        <HeroImage />
        
        {/* Animated dot grid - subtle overlay on top of image */}
        <DotGrid />

        <div className="relative z-10 w-full md:w-[42%] lg:w-[40%]">
          {/* Label */}
          <RevealText delay={100}>
            <span 
              className="text-xs tracking-[0.25em] uppercase mb-6 block opacity-90"
              style={{ 
                fontFamily: 'JetBrains Mono, monospace',
                color: '#C5A059'
              }}
            >
              A New Digital Home
            </span>
          </RevealText>

          {/* Acronym Expansion */}
          <h1 
            data-testid="hero-title"
            className="mb-10"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <RevealText delay={200}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>B</span>lack
              </span>
            </RevealText>
            <RevealText delay={350}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>A</span>merica
              </span>
            </RevealText>
            <RevealText delay={500}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>N</span>ews
              </span>
            </RevealText>
            <RevealText delay={650}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>I</span>nformation <span className="text-white/40">&</span>
              </span>
            </RevealText>
            <RevealText delay={800}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>B</span>usiness
              </span>
            </RevealText>
            <RevealText delay={950}>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span style={{ color: '#C5A059' }}>S</span>ystem
              </span>
            </RevealText>
          </h1>

          {/* Tagline */}
          <RevealText delay={1200}>
            <p className="text-base md:text-lg text-white/50 max-w-sm leading-relaxed">
              Encrypted. Ad-free. Built for our people.
            </p>
          </RevealText>
          
          {/* Status signal */}
          <RevealText delay={1400}>
            <p 
              className="text-xs md:text-sm text-white/30 mt-6 tracking-wide"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              The full system is opening in phases.
            </p>
          </RevealText>
        </div>

        {/* Scroll indicator */}
        <RevealText delay={1500}>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span 
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Scroll to explore
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </RevealText>
      </section>

      {/* Mission Section */}
      <Section id="mission-section" className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <span 
            className="text-xs tracking-[0.25em] uppercase mb-12 block"
            style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              color: '#C5A059'
            }}
          >
            Why We Exist
          </span>

          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
            <div>
              <h2 
                data-testid="mission-title"
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                A platform built with intention.
              </h2>
            </div>
            
            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                BANIBS brings together stories, perspectives, and information from across 
                the Black diaspora — alongside tools for business, culture, and community.
              </p>
              <p>
                This is not another social network chasing engagement metrics. This is a 
                digital home where privacy is foundational, not an afterthought. Where 
                dignity shapes every design decision.
              </p>
              <p>
                We&apos;re building for those who want more than what the current platforms offer — 
                a space that respects your attention, protects your data, and centers your needs.
              </p>
            </div>
          </div>

          {/* Core Principles */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-white/10">
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#C5A059]" />
                <span 
                  className="text-xs tracking-[0.15em] uppercase text-white/50"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Privacy
                </span>
              </div>
              <p className="text-white/60 leading-relaxed">
                End-to-end encryption by default. Your data belongs to you.
              </p>
            </div>
            
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#C5A059]" />
                <span 
                  className="text-xs tracking-[0.15em] uppercase text-white/50"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Community
                </span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Built by us, for us. No algorithms designed to divide.
              </p>
            </div>
            
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-[#C5A059]" />
                <span 
                  className="text-xs tracking-[0.15em] uppercase text-white/50"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Knowledge
                </span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Curated information and perspectives that matter.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Books Section */}
      <Section id="books-section" className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <span 
            className="text-xs tracking-[0.25em] uppercase mb-6 block"
            style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              color: '#C5A059'
            }}
          >
            From the Founder
          </span>

          <div className="mb-16">
            <h2 
              data-testid="books-title"
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              A Connected Body of Work
            </h2>
            <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
              These five works form an intellectual system — each building upon the last, 
              together offering a framework for seeing clearly in a world designed to obscure.
            </p>
          </div>

          {/* Book List */}
          <div data-testid="books-list" className="border-t border-white/10">
            {BOOKS.map((book) => (
              <a
                key={book.id}
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`book-${book.id}`}
                className="block py-8 border-b border-white/10 group cursor-pointer"
                onMouseEnter={() => setHoveredBook(book.id)}
                onMouseLeave={() => setHoveredBook(null)}
                style={{
                  opacity: hoveredBook === null || hoveredBook === book.id ? 1 : 0.3,
                  transition: 'all 0.4s ease'
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="text-xs text-white/30"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {String(book.id).padStart(2, '0')}
                      </span>
                      <h3 
                        className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight group-hover:text-[#C5A059] transition-colors duration-300"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {book.title}
                      </h3>
                    </div>
                    
                    <p className="text-white/40 text-sm md:text-base ml-9 mb-3">
                      {book.subtitle}
                    </p>
                    
                    <p className="text-white/60 text-sm md:text-base ml-9 max-w-2xl leading-relaxed">
                      {book.role}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-[#C5A059] transition-all duration-300 ml-9 md:ml-0">
                    <span 
                      className="text-xs tracking-wider uppercase"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Amazon
                    </span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Foundation Documents Section */}
      <Section id="foundation-section" className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <span 
            className="text-xs tracking-[0.25em] uppercase mb-6 block"
            style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              color: '#C5A059'
            }}
          >
            Foundation / Orientation
          </span>

          <div className="mb-12">
            <h2 
              data-testid="foundation-title"
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Foundational Documents
            </h2>
            <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
              Archival readings that inform the principles underlying BANIBS. 
              Offered for examination, not enforcement.
            </p>
          </div>

          {/* Foundation Document Links */}
          <div className="border-t border-white/10">
            <a
              href="/foundation/seven-spirits-of-god"
              data-testid="foundation-seven-spirits"
              className="block py-8 border-b border-white/10 group cursor-pointer hover:bg-white/[0.02] transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl md:text-2xl font-medium text-white/90 group-hover:text-[#C5A059] transition-colors"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    The Seven Spirits of God
                  </h3>
                  <p className="text-white/50 mt-2">
                    An Operational Reading from Revelation — How authority, agency, and power operate in Scripture.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/40 group-hover:text-[#C5A059] transition-colors">
                  <span className="text-sm">Read</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </Section>

      {/* Waitlist Section */}
      <Section id="waitlist-section" className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <span 
            className="text-xs tracking-[0.25em] uppercase mb-6 block"
            style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              color: '#C5A059'
            }}
          >
            Early Access
          </span>

          <h2 
            data-testid="waitlist-title"
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Be Part of What&apos;s Next
          </h2>
          
          <p className="text-white/60 text-lg mb-12 leading-relaxed">
            BANIBS is in active development. Join the waitlist to be notified when we launch.
          </p>

          {!submitted ? (
            <form 
              onSubmit={handleSubmit} 
              data-testid="waitlist-form"
              className="max-w-md mx-auto"
            >
              <div 
                className="p-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center">
                  <div className="flex items-center pl-4">
                    <Mail className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    data-testid="email-input"
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    data-testid="submit-button"
                    className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: '#C5A059',
                      color: '#020408'
                    }}
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div 
              data-testid="success-message"
              className="p-8 rounded-2xl"
              style={{
                background: 'rgba(197, 160, 89, 0.1)',
                border: '1px solid rgba(197, 160, 89, 0.2)'
              }}
            >
              <div className="text-2xl mb-3" style={{ color: '#C5A059' }}>✓</div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                You&apos;re on the list
              </h3>
              <p className="text-white/60">
                We&apos;ll notify you when BANIBS launches.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Support BANIBS Section */}
      <Section id="support-section" className="px-6 md:px-12 lg:px-24 py-16 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 
            data-testid="support-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Support BANIBS
          </h2>
          
          <p className="text-white/60 text-base mb-8 leading-relaxed">
            Donations help cover infrastructure and operating costs.
          </p>

          <a
            href="https://buy.stripe.com/6oU00jaPqeMffyx0hk3sI00"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="support-donate-btn"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #C5A059 0%, #A8864A 100%)',
              color: '#020408',
              boxShadow: '0 4px 20px rgba(197, 160, 89, 0.3)'
            }}
          >
            Support BANIBS
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </Section>

      {/* Footer */}
      <footer 
        data-testid="footer"
        className="px-6 md:px-12 lg:px-24 py-16 border-t border-white/5 text-center"
      >
        <p 
          className="text-white/40 tracking-[0.3em] text-sm uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          Peace • Love • Honor • Respect
        </p>
        
        <p className="text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} BANIBS. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ComingSoonPage;
