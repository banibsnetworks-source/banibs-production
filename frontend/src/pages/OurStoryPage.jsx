import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, Shield, Users, TrendingUp, 
  Globe, Lock, Newspaper, ShoppingBag,
  Network, Eye, Volume2, Building2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Our Story Page
 * Founding story and purpose - emotionally grounding and trust-building
 */
const OurStoryPage = () => {
  const [variant, setVariant] = useState('gold');
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
          textSecondary: 'rgba(255, 255, 255, 0.85)',
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
      existing.push({ email, timestamp: new Date().toISOString(), source: 'our-story-page' });
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
      <title>BANIBS – Our Story</title>

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
          width: '900px',
          height: '900px',
          background: `radial-gradient(circle, ${styles.accent}40 0%, transparent 70%)`,
          filter: 'blur(120px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '950px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '40px',
            background: `linear-gradient(135deg, ${styles.accent} 0%, ${styles.textPrimary} 50%, ${styles.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Our Story: Built From Love,<br />Necessity, and Vision
          </h1>
          <p style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.7rem)',
            lineHeight: '1.8',
            color: styles.textSecondary,
            fontWeight: '500',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            BANIBS began with one question:<br />
            <span style={{ color: styles.accent, fontWeight: '700' }}>
              What would happen if Black people finally had a digital home<br />
              built to protect us, not exploit us?
            </span>
          </p>
        </div>
      </div>

      {/* The Spark Section */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '24px',
            padding: '64px 48px',
            boxShadow: `0 12px 48px ${styles.accent}22`
          }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Heart size={56} color={styles.accent} style={{ marginBottom: '24px' }} />
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                marginBottom: '32px',
                color: styles.accent
              }}>
                Where It Began
              </h2>
            </div>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '2.1',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              BANIBS was born from a simple truth:
            </p>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '2',
              marginBottom: '32px'
            }}>
              Black people have never had a digital space that was built for our safety, dignity, and empowerment.<br />
              We've been <strong>watched</strong>.<br />
              We've been <strong>tracked</strong>.<br />
              We've been <strong>silenced</strong>.<br />
              We've been <strong>ignored</strong>.
            </p>
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              marginBottom: '48px'
            }}>
              But we have never been given a platform that honors our humanity.
            </p>
            <p style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              textAlign: 'center',
              color: styles.accent
            }}>
              So we built one.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem We Saw */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            The Problem We Saw
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                icon: Eye,
                title: 'Exploitation by Big Tech',
                items: ['Ads', 'Tracking', 'Psychological profiling', 'Manipulated algorithms']
              },
              {
                icon: Volume2,
                title: 'Censorship & Voice Suppression',
                items: ['Black issues deprioritized', 'Stories buried', 'Narratives distorted']
              },
              {
                icon: Users,
                title: 'Community Fragmentation',
                items: ['Diaspora disconnected', 'No central home', 'No unified digital identity']
              },
              {
                icon: TrendingUp,
                title: 'No Economic Empowerment',
                items: ['Black businesses drowned out', 'No dedicated marketplace', 'No global visibility']
              },
              {
                icon: Shield,
                title: 'Lack of Respect & Dignity',
                items: ['Spaces not designed with us in mind', 'Experiences not shaped for our wellness']
              }
            ].map((problem, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `3px solid ${styles.cardBorder}`,
                borderRadius: '20px',
                padding: '40px 32px',
                boxShadow: `0 8px 32px ${styles.accent}18`
              }}>
                <problem.icon size={44} color={styles.accent} style={{ marginBottom: '24px' }} />
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: styles.accent
                }}>
                  {problem.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.05rem', lineHeight: '1.9' }}>
                  {problem.items.map((item, j) => (
                    <li key={j} style={{ marginBottom: '10px' }}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Decision */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: styles.cardBg,
            border: `4px solid ${styles.cardBorder}`,
            borderRadius: '24px',
            padding: '72px 48px',
            boxShadow: `0 16px 64px ${styles.accent}25`
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: '800',
              marginBottom: '48px',
              color: styles.accent
            }}>
              The Decision
            </h2>
            <p style={{
              fontSize: '1.4rem',
              lineHeight: '2.2',
              marginBottom: '40px'
            }}>
              We realized nobody was coming to build this for us.<br />
              <strong style={{ color: styles.accent }}>So we made a decision:</strong><br />
              <em>We will build it ourselves.</em>
            </p>
            <div style={{
              fontSize: '1.35rem',
              lineHeight: '2.1',
              fontWeight: '500'
            }}>
              <p style={{ marginBottom: '20px' }}>
                BANIBS is more than a platform — <strong>it is a restoration</strong>.
              </p>
              <p style={{ marginBottom: '20px' }}>
                A <strong style={{ color: styles.accent }}>homecoming</strong>.
              </p>
              <p>
                A digital future where Black people finally control our tools, our data,<br />
                our businesses, and our own stories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Origin */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '56px',
            textAlign: 'center',
            color: styles.accent
          }}>
            How BANIBS Started
          </h2>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '20px',
            padding: '56px 48px',
            fontSize: '1.25rem',
            lineHeight: '2',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '32px' }}>
              BANIBS started as an idea in a living room — a desire to protect our people<br />
              from digital harm and create a place where we can <strong>thrive</strong>.
            </p>
            <p style={{ marginBottom: '32px' }}>
              Built with <strong style={{ color: styles.accent }}>discipline, clarity, and love</strong>.<br />
              Designed step-by-step, through patience and vision.<br />
              Grounded in the belief that we deserve something better.
            </p>
            <p style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: styles.accent,
              fontStyle: 'italic'
            }}>
              "Created with purpose. Built for generations."
            </p>
          </div>
        </div>
      </div>

      {/* Growth Into an Ecosystem */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Growth Into an Ecosystem
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {[
              { icon: Newspaper, title: 'Black News Lens', desc: 'A world seen through our eyes — unfiltered, unmanipulated' },
              { icon: Users, title: 'Community Hub', desc: 'Safe spaces for families, creators, and professionals to connect' },
              { icon: Building2, title: 'Black Business Directory', desc: 'Empowering entrepreneurs with visibility and community trust' },
              { icon: ShoppingBag, title: 'Marketplace', desc: 'Circulating wealth within our communities' },
              { icon: Network, title: 'Diaspora Network', desc: 'Connecting Black people across the globe' },
              { icon: Lock, title: 'Privacy & Safety Engine', desc: 'Your data, your control — no tracking, no surveillance' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '18px',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <feature.icon size={40} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: styles.accent
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Promise */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '56px',
            textAlign: 'center',
            color: styles.accent
          }}>
            What Guides Us
          </h2>
          <div style={{
            background: `linear-gradient(135deg, ${styles.cardBg} 0%, ${styles.bgSecondary} 100%)`,
            border: `4px solid ${styles.accent}`,
            borderRadius: '24px',
            padding: '64px 48px',
            textAlign: 'center',
            boxShadow: `0 16px 64px ${styles.accent}30`
          }}>
            <p style={{
              fontSize: '1.35rem',
              lineHeight: '2.2',
              marginBottom: '32px'
            }}>
              BANIBS will always be built with:
            </p>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              lineHeight: '2.5',
              color: styles.accent
            }}>
              <p>Peace.</p>
              <p>Love.</p>
              <p>Honor.</p>
              <p>Respect.</p>
              <p>Integrity.</p>
              <p>Protection.</p>
              <p>Empowerment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Future */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '56px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Where We're Going
          </h2>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '20px',
            padding: '56px 48px'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '1.25rem',
              lineHeight: '2.3'
            }}>
              {[
                'A digital home for the global Black family',
                'A safe social environment',
                'A home for news built through our lens',
                'A thriving marketplace',
                'A unified diaspora network',
                'A sovereign platform free from ads, profiling, or corporate ownership'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '16px',
                  paddingLeft: '40px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: styles.accent,
                    fontSize: '1.6rem',
                    fontWeight: 'bold'
                  }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              textAlign: 'center',
              marginTop: '48px',
              color: styles.accent,
              fontStyle: 'italic'
            }}>
              "This is just the beginning."
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
            A dignified, beautiful digital home for our people is almost here.
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

export default OurStoryPage;