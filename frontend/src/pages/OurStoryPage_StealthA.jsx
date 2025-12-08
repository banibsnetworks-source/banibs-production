import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, Shield, Users, TrendingUp, 
  Globe, Lock, Newspaper, ShoppingBag,
  Network, Eye, Volume2, Building2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Our Story Page - Stealth A+ Version
 * Created with care. Rooted in love. Built for Black communities.
 */
const OurStoryPage = () => {
  const [variant, setVariant] = useState('gold');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
      <title>BANIBS – Our Story</title>

      {/* Hero Section - STEALTH A+ */}
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
            Our Story
          </h1>
          <p style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.7rem)',
            lineHeight: '1.8',
            color: styles.textSecondary,
            fontWeight: '500',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Created with care. Rooted in love. Built for Black communities.
          </p>
          <p style={{
            fontSize: 'clamp(1.15rem, 2vw, 1.5rem)',
            lineHeight: '1.8',
            color: styles.textSecondary,
            fontWeight: '500',
            maxWidth: '800px',
            margin: '24px auto 0'
          }}>
            BANIBS began with a simple idea:<br />
            <span style={{ color: styles.accent, fontWeight: '700' }}>
              What if there were a calm, private digital home designed specifically with Black communities in mind?
            </span>
          </p>
        </div>
      </div>

      {/* Where It Began - STEALTH A+ */}
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
              fontSize: '1.25rem',
              lineHeight: '2',
              marginBottom: '24px'
            }}>
              Many people felt unseen or overwhelmed in existing digital spaces. BANIBS was created to offer something gentler and more attuned to Black cultural experience.
            </p>
            <p style={{
              fontSize: '1.15rem',
              lineHeight: '1.9',
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              We noticed:
            </p>
            <ul style={{
              fontSize: '1.1rem',
              lineHeight: '2',
              listStyle: 'none',
              padding: 0
            }}>
              {[
                'Too much noise and intrusion',
                'Not enough culturally aligned design',
                'Fragmented community spaces',
                'Limited visibility for Black-owned businesses'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '12px',
                  paddingLeft: '32px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: styles.accent,
                    fontSize: '1.4rem'
                  }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.9',
              marginTop: '32px'
            }}>
              BANIBS is a response shaped with care—not urgency, not confrontation.
            </p>
          </div>
        </div>
      </div>

      {/* Turning Point - STEALTH A+ */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
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
              Turning Point
            </h2>
            <p style={{
              fontSize: '1.35rem',
              lineHeight: '2.1',
              marginBottom: '32px'
            }}>
              We realized that no major platform offered a peaceful social experience crafted specifically for Black users.
            </p>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '2',
              marginBottom: '40px'
            }}>
              So we decided to build one—carefully, patiently, and with long-term trust at the center.
            </p>
            <div style={{
              fontSize: '1.35rem',
              lineHeight: '2.1',
              fontWeight: '500'
            }}>
              <p style={{ marginBottom: '20px' }}>
                BANIBS is not a reaction.
              </p>
              <p style={{ color: styles.accent, fontWeight: '700' }}>
                It is an intentional beginning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Started - STEALTH A+ */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '56px',
            textAlign: 'center',
            color: styles.accent
          }}>
            How It Started
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
              The idea formed simply:<br />
              Create a private, culturally aware platform where Black people can communicate comfortably and feel at home.
            </p>
            <p style={{ marginBottom: '32px' }}>
              Built with <strong style={{ color: styles.accent }}>clarity</strong>.<br />
              Designed with <strong style={{ color: styles.accent }}>patience</strong>.<br />
              Guided by <strong style={{ color: styles.accent }}>care</strong>.
            </p>
            <p style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: styles.accent,
              fontStyle: 'italic'
            }}>
              "Created with purpose. Built with intention."
            </p>
          </div>
        </div>
      </div>

      {/* What Guides Us - STEALTH A+ */}
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
              <p>Care.</p>
              <p>Thoughtfulness.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Where We're Going - STEALTH A+ */}
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
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '2',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              BANIBS will grow gently and naturally, introducing new tools only when the foundation is strong and the community is ready.
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '1.25rem',
              lineHeight: '2.3'
            }}>
              {[
                'Social spaces',
                'Business visibility',
                'Thoughtful future features'
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

      {/* CTA Section - STEALTH A+ */}
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
            BANIBS launches soon.
          </h2>
          <p style={{
            fontSize: '1.4rem',
            marginBottom: '48px',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            A thoughtful, grounded digital experience for Black communities is on the way.
          </p>

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

      {/* Footer - STEALTH A+ */}
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
