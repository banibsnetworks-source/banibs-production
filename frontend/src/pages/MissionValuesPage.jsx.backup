import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, Users, Briefcase, Globe, 
  Heart, Eye, Handshake, Lock, 
  Sparkles, Zap, Newspaper, Network,
  ShoppingBag, MessageCircle, Archive
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Mission & Values Page
 * Communicates core mission, values, and commitments
 */
const MissionValuesPage = () => {
  const [variant, setVariant] = useState('gold'); // default to gold
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Detect active Coming Soon variant
  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/config/feature-flags`);
        setVariant(response.data.coming_soon_variant || 'gold');
      } catch (error) {
        console.error('Failed to load variant:', error);
      }
    };
    fetchVariant();
  }, []);

  // Variant-aware styling
  const getStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          bgPrimary: 'linear-gradient(180deg, #0B0B0B 0%, #1A1A1A 100%)',
          bgSecondary: '#1A1A1A',
          bgTertiary: '#0B0B0B',
          textPrimary: '#FFFFFF',
          textSecondary: 'rgba(255, 255, 255, 0.8)',
          accent: '#C49A3A',
          accentGradient: 'linear-gradient(135deg, #C49A3A 0%, #D4AF37 100%)',
          cardBg: 'rgba(255, 255, 255, 0.04)',
          cardBorder: 'rgba(196, 154, 58, 0.3)',
        };
      case 'blue':
        return {
          bgPrimary: 'linear-gradient(180deg, #BCE3FF 0%, #FFFFFF 100%)',
          bgSecondary: '#FFFFFF',
          bgTertiary: 'rgba(188, 227, 255, 0.3)',
          textPrimary: '#223049',
          textSecondary: '#223049',
          accent: '#E8C465',
          accentGradient: 'linear-gradient(135deg, #E8C465 0%, #D4AF37 100%)',
          cardBg: 'rgba(188, 227, 255, 0.2)',
          cardBorder: 'rgba(232, 196, 101, 0.4)',
        };
      case 'gold':
      default:
        return {
          bgPrimary: 'linear-gradient(180deg, #F5E8C8 0%, #FFFFFF 100%)',
          bgSecondary: '#FFFFFF',
          bgTertiary: 'rgba(245, 232, 200, 0.3)',
          textPrimary: '#1A1A1A',
          textSecondary: '#1A1A1A',
          accent: '#E2BD59',
          accentGradient: 'linear-gradient(135deg, #E2BD59 0%, #D4AF37 100%)',
          cardBg: 'rgba(226, 189, 89, 0.12)',
          cardBorder: 'rgba(226, 189, 89, 0.4)',
        };
    }
  };

  const styles = getStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString(), source: 'mission-page' });
      localStorage.setItem('banibs_early_access', JSON.stringify(existing));
      setEmail('');
      setSubmitted(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: styles.bgPrimary,
      color: styles.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* SEO Meta Tags */}
      <title>BANIBS – Mission & Values</title>

      {/* Hero Section */}
      <div style={{
        padding: '120px 20px 100px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: `radial-gradient(circle, ${styles.accent}33 0%, transparent 70%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '32px',
            background: `linear-gradient(135deg, ${styles.accent} 0%, ${styles.textPrimary} 50%, ${styles.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Our Mission: To Build a Safe, Beautiful Digital Home for Our People
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            lineHeight: '1.7',
            color: styles.textSecondary,
            fontWeight: '500'
          }}>
            BANIBS exists to protect, uplift, and empower Black life — everywhere.
          </p>
        </div>
      </div>

      {/* Why BANIBS Exists */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '48px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Why BANIBS Exists
          </h2>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '20px',
            padding: '48px',
            marginBottom: '40px'
          }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '32px', lineHeight: '1.8' }}>
              BANIBS was created to solve the digital problems facing Black people today:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '1.1rem',
              lineHeight: '2'
            }}>
              {[
                'Constant surveillance',
                'Ads and tracking',
                'Censorship',
                'Algorithm bias',
                'Lack of ownership',
                'Disconnected communities',
                'Underexposed Black businesses',
                'Missing diaspora connection'
              ].map((problem, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: styles.accent, fontSize: '1.5rem' }}>•</span>
                  <span>{problem}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            textAlign: 'center',
            color: styles.accent,
            fontStyle: 'italic'
          }}>
            "We deserve a place where we are not studied — only respected."
          </p>
        </div>
      </div>

      {/* Four Pillars */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            The Four Pillars
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                icon: Shield,
                title: 'Privacy & Safety',
                points: [
                  'No ads, no tracking, no surveillance',
                  'Your data belongs to you, not to corporations',
                  'BANIBS never sells or manipulates your information'
                ]
              },
              {
                icon: Users,
                title: 'Community First',
                points: [
                  'Built for families, creators, professionals, elders, and youth',
                  'A digital home where care, belonging, and love guide the design'
                ]
              },
              {
                icon: Briefcase,
                title: 'Economic Empowerment',
                points: [
                  'Built-in Black Business Directory',
                  'Tools for entrepreneurs, sellers, creators',
                  'Keep wealth circulating in our communities'
                ]
              },
              {
                icon: Globe,
                title: 'Global Diaspora Connection',
                points: [
                  'News, culture, stories across U.S., Africa, Caribbean, South America, Europe, Canada, Asia'
                ]
              }
            ].map((pillar, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `3px solid ${styles.cardBorder}`,
                borderRadius: '20px',
                padding: '40px 32px',
                boxShadow: `0 8px 32px ${styles.accent}22`
              }}>
                <pillar.icon size={48} color={styles.accent} style={{ marginBottom: '24px' }} />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: styles.accent
                }}>
                  {pillar.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.05rem', lineHeight: '1.8' }}>
                  {pillar.points.map((point, j) => (
                    <li key={j} style={{ marginBottom: '12px' }}>• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            textAlign: 'center',
            marginTop: '56px',
            color: styles.accent,
            fontStyle: 'italic'
          }}>
            "When we connect, we rise."
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            The BANIBS Core Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              { emoji: '🖤', title: 'Dignity', desc: 'Every interaction and every screen protects the dignity of Black people.' },
              { emoji: '🌍', title: 'Truth', desc: 'We honor truth — our own stories, our own voices.' },
              { emoji: '🤝', title: 'Unity', desc: 'We build bridges across the diaspora, not walls.' },
              { emoji: '🔐', title: 'Sovereignty', desc: 'Your data, your identity, your community — all under your control.' },
              { emoji: '💛', title: 'Care', desc: 'Human-centered design that prioritizes emotional and psychological safety.' },
              { emoji: '🚀', title: 'Future-Making', desc: 'We build tools and spaces that prepare us for the next 100 years, not the last 10.' }
            ].map((value, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{value.emoji}</div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: styles.accent
                }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What BANIBS Will Deliver */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            What BANIBS Will Deliver
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px',
            marginBottom: '56px'
          }}>
            {[
              { icon: Newspaper, title: 'Black News Lens', desc: 'A world seen through our eyes' },
              { icon: Network, title: 'Diaspora Network', desc: 'Reconnect the global Black family' },
              { icon: ShoppingBag, title: 'Marketplace & Business Directory', desc: 'Empower our entrepreneurs' },
              { icon: MessageCircle, title: 'Social & Community Tools', desc: 'Safe communication without tracking' },
              { icon: Archive, title: 'Cultural Archives', desc: 'Protect and preserve our stories' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `3px solid ${styles.cardBorder}`,
                borderRadius: '18px',
                padding: '36px 28px',
                textAlign: 'center',
                boxShadow: `0 6px 24px ${styles.accent}18`
              }}>
                <feature.icon size={42} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: styles.accent
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center',
            color: styles.accent,
            fontStyle: 'italic'
          }}>
            "This is more than a platform. It's a restoration."
          </p>
        </div>
      </div>

      {/* Founder Statement */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '48px',
            textAlign: 'center',
            color: styles.accent
          }}>
            A Message From the Founder
          </h2>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '20px',
            padding: '56px 48px',
            boxShadow: `0 12px 48px ${styles.accent}20`
          }}>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '2',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              "BANIBS is built with love, faith, discipline, and hope.<br />
              It is built because our people deserve a safe digital home where dignity is not optional.<br />
              This work is for every Black family — past, present, and future."
            </p>
            <p style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center',
              color: styles.accent,
              letterSpacing: '1px'
            }}>
              Peace • Love • Honor • Respect
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        padding: '100px 20px',
        background: styles.bgTertiary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${styles.accent} 0%, ${styles.textPrimary} 50%, ${styles.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            BANIBS Launches Soon
          </h2>
          <p style={{
            fontSize: '1.4rem',
            marginBottom: '48px',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            A safer, smarter digital world for our people is on the way.
          </p>

          {/* Email Capture */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{
                background: variant === 'dark' ? 'rgba(196, 154, 58, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                border: `3px solid ${styles.cardBorder}`,
                borderRadius: '16px',
                padding: '32px',
                boxShadow: `0 8px 32px ${styles.accent}22`
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '1rem',
                    background: variant === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    border: `2px solid ${styles.cardBorder}`,
                    borderRadius: '12px',
                    color: styles.textPrimary,
                    marginBottom: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: styles.accentGradient,
                    color: variant === 'dark' ? '#000' : '#1A1A1A',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: `0 4px 16px ${styles.accent}44`
                  }}
                >
                  Join the Early Access List
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '3px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#10B981', fontWeight: '600' }}>
                You're on the list!
              </h3>
              <p style={{ fontSize: '1rem' }}>We'll notify you when BANIBS launches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 20px',
        background: styles.bgSecondary,
        textAlign: 'center',
        fontSize: '0.95rem',
        letterSpacing: '2px',
        fontWeight: '500'
      }}>
        Peace • Love • Honor • Respect
      </div>
    </div>
  );
};

export default MissionValuesPage;
