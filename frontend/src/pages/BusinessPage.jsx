import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, TrendingUp, Users, Sparkles,
  Store, ShoppingBag, Home, Network,
  Newspaper, Heart, UserPlus
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Business Page (Community Beautiful Edition)
 * A4 - Public-facing explanation of the BANIBS platform ecosystem
 */
const BusinessPage = () => {
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
          accent: '#87bce9',
          accentGradient: 'linear-gradient(135deg, #87bce9 0%, #5A8FBD 100%)',
          cardBg: 'rgba(188, 227, 255, 0.2)',
          cardBorder: 'rgba(135, 188, 233, 0.4)',
        };
      case 'gold':
      default:
        return {
          bgPrimary: 'linear-gradient(180deg, #F7F0E3 0%, #FFFFFF 100%)',
          bgSecondary: '#FFFFFF',
          bgTertiary: 'rgba(247, 240, 227, 0.4)',
          textPrimary: '#2A2A2A',
          textSecondary: '#3A3A3A',
          accent: '#D9B77A',
          accentGradient: 'linear-gradient(135deg, #D9B77A 0%, #B89968 100%)',
          cardBg: 'rgba(217, 183, 122, 0.12)',
          cardBorder: 'rgba(217, 183, 122, 0.4)',
        };
    }
  };

  const styles = getStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString(), source: 'business-page' });
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif'
    }}>
      {/* SEO Meta Tags */}
      <title>BANIBS — Business, Community & Digital Opportunity</title>

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
          background: `radial-gradient(circle, ${styles.accent}35 0%, transparent 70%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '32px',
            background: variant === 'gold' 
              ? `linear-gradient(135deg, ${styles.accent} 0%, ${styles.textPrimary} 50%, ${styles.accent} 100%)`
              : styles.textPrimary,
            WebkitBackgroundClip: variant === 'gold' ? 'text' : 'initial',
            WebkitTextFillColor: variant === 'gold' ? 'transparent' : 'initial',
            backgroundClip: variant === 'gold' ? 'text' : 'initial'
          }}>
            A beautiful home for business, culture, and community.
          </h1>
          <div style={{
            background: styles.cardBg,
            border: `2px solid ${styles.cardBorder}`,
            borderRadius: '12px',
            padding: '28px',
            maxWidth: '740px',
            margin: '0 auto',
            boxShadow: `0 4px 16px ${styles.accent}15`
          }}>
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
              lineHeight: '1.8',
              color: styles.textSecondary,
              fontWeight: '500'
            }}>
              BANIBS is a digital ecosystem designed to uplift our people — creating space for opportunity, connection, and visibility across business, news, media, culture, and community life.
            </p>
          </div>
        </div>
      </div>

      {/* The Work We Do - 4 Pillars */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '56px',
            textAlign: 'center',
            color: styles.accent
          }}>
            How BANIBS Serves Our People
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {[
              {
                icon: Eye,
                title: 'Visibility',
                description: 'Helping our people and our businesses be seen. BANIBS amplifies stories, voices, achievements, and contributions — across neighborhoods, cities, and the world.'
              },
              {
                icon: TrendingUp,
                title: 'Opportunity',
                description: 'Creating pathways to growth. Through digital storefronts, business listings, jobs, and community networks, BANIBS opens the door to economic empowerment.'
              },
              {
                icon: Users,
                title: 'Connection',
                description: 'Building meaningful relationships. From business to community life, BANIBS brings people together across shared goals, regions, and interests.'
              },
              {
                icon: Sparkles,
                title: 'Culture',
                description: 'Honoring who we are. Our platform celebrates beauty, dignity, and the richness of our lived experience.'
              }
            ].map((pillar, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '28px',
                boxShadow: `0 4px 16px ${styles.accent}12`
              }}>
                <pillar.icon size={40} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: styles.accent
                }}>
                  {pillar.title}
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: styles.textSecondary
                }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Directory Preview */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '32px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Your Business, Seen and Supported
          </h2>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.8',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '740px',
            margin: '0 auto 48px',
            color: styles.textSecondary
          }}>
            Our Business Directory helps community members discover local shops, professionals, restaurants, creators, and rising entrepreneurs — all in one dignified digital home.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {[
              { icon: Store, title: 'Food & Dining' },
              { icon: UserPlus, title: 'Professional Services' },
              { icon: Sparkles, title: 'Creators & Makers' }
            ].map((category, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: variant === 'gold' 
                  ? `2px solid ${styles.cardBorder}` 
                  : variant === 'blue'
                  ? `2px solid ${styles.accent}`
                  : `1px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${styles.accent}10`
              }}>
                <category.icon size={36} color={styles.accent} style={{ marginBottom: '16px' }} />
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: styles.textPrimary
                }}>
                  {category.title}
                </h3>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button style={{
              padding: '14px 40px',
              fontSize: '1rem',
              fontWeight: '600',
              background: styles.cardBg,
              color: styles.accent,
              border: `2px solid ${styles.cardBorder}`,
              borderRadius: '12px',
              cursor: 'default',
              boxShadow: `0 4px 16px ${styles.accent}15`
            }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Economic Empowerment / Marketplace Preview */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '32px',
            textAlign: 'center',
            color: styles.accent
          }}>
            A Marketplace Designed for Us
          </h2>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.8',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '740px',
            margin: '0 auto 48px',
            color: styles.textSecondary
          }}>
            BANIBS Marketplace is a clean, modern shopping space where community members can buy and sell products with pride. Built to strengthen economic power from the inside out.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {[
              { icon: ShoppingBag, title: 'Clothing' },
              { icon: Sparkles, title: 'Beauty / Wellness' },
              { icon: Home, title: 'Home & Lifestyle' }
            ].map((category, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: variant === 'gold' 
                  ? `2px solid ${styles.cardBorder}` 
                  : variant === 'blue'
                  ? `2px solid ${styles.accent}`
                  : `1px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${styles.accent}10`
              }}>
                <category.icon size={36} color={styles.accent} style={{ marginBottom: '16px' }} />
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: styles.textPrimary
                }}>
                  {category.title}
                </h3>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button style={{
              padding: '14px 40px',
              fontSize: '1rem',
              fontWeight: '600',
              background: styles.cardBg,
              color: styles.accent,
              border: `2px solid ${styles.cardBorder}`,
              borderRadius: '12px',
              cursor: 'default',
              boxShadow: `0 4px 16px ${styles.accent}15`
            }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Community Ecosystem Preview */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '24px',
            textAlign: 'center',
            color: styles.accent
          }}>
            More Than a Platform — A Community Home
          </h2>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.7',
            textAlign: 'center',
            marginBottom: '56px',
            color: styles.textSecondary,
            fontWeight: '500'
          }}>
            BANIBS is built with intention: a place where our people can learn, share, grow, support, and uplift each other.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px'
          }}>
            {[
              {
                icon: Newspaper,
                title: 'News & Information',
                description: 'Trusted coverage centered on our stories and our perspective.'
              },
              {
                icon: Network,
                title: 'Connections & Relationships',
                description: 'Tools to build supportive networks and meaningful relationships.'
              },
              {
                icon: Heart,
                title: 'Media & Expression',
                description: 'Shortform video, storytelling, and creative outlets — all in a beautiful environment.'
              }
            ].map((block, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 28px',
                boxShadow: `0 4px 16px ${styles.accent}12`
              }}>
                <block.icon size={40} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: styles.accent
                }}>
                  {block.title}
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: styles.textSecondary
                }}>
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Capture Footer */}
      <div style={{
        padding: '80px 20px',
        background: styles.bgSecondary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '20px',
            color: styles.accent
          }}>
            Stay Connected
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '40px',
            lineHeight: '1.7',
            color: styles.textSecondary
          }}>
            Be the first to know when the BANIBS community platform goes live.
          </p>

          {/* Email Capture Form */}
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
                  Keep Me Updated
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
        background: styles.bgTertiary,
        textAlign: 'center',
        fontSize: '0.95rem',
        letterSpacing: '2px',
        fontWeight: '500',
        color: styles.textSecondary
      }}>
        Peace • Beauty • Dignity • Community
      </div>
    </div>
  );
};

export default BusinessPage;
