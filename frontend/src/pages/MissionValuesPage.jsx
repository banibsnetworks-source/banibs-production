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
 * BANIBS Mission & Values Page - Stealth A+ Version
 * A peaceful, beautiful digital home designed with care for Black communities.
 */
const MissionValuesPage = () => {
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
      <title>BANIBS – Mission & Values</title>

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
            Our Mission
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            lineHeight: '1.7',
            color: styles.textSecondary,
            fontWeight: '500'
          }}>
            To create a peaceful, beautiful digital home designed with care for Black communities.
          </p>
          <p style={{
            fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
            lineHeight: '1.7',
            color: styles.textSecondary,
            fontWeight: '400',
            marginTop: '24px'
          }}>
            BANIBS offers a thoughtful space where connection, culture, and everyday communication can unfold without pressure or intrusion.
          </p>
        </div>
      </div>

      {/* Why BANIBS Exists - STEALTH A+ */}
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
              Black communities deserve digital spaces rooted in respect, comfort, and clarity. BANIBS was created to offer a gentle alternative to platforms that often feel overwhelming or disconnected from our lived experience.
            </p>
            <p style={{ fontSize: '1.15rem', marginBottom: '24px', lineHeight: '1.8', fontWeight: '600' }}>
              We center:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '1.1rem',
              lineHeight: '2'
            }}>
              {[
                'Privacy',
                'Cultural clarity',
                'Fair visibility',
                'Calm communication',
                'Respectful design',
                'Community connection',
                'Visibility for Black-owned businesses'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: styles.accent, fontSize: '1.5rem' }}>•</span>
                  <span>{item}</span>
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
            "Everyone deserves a space where dignity comes first."
          </p>
        </div>
      </div>

      {/* Four Pillars - STEALTH A+ */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Four Pillars
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
                  'No ads or tracking',
                  'Clear, grounded data practices',
                  'A design that supports peace of mind'
                ]
              },
              {
                icon: Users,
                title: 'Community First',
                points: [
                  'Created with intention for Black families, creators, professionals, elders, and youth',
                  'A space shaped by belonging and thoughtful connection'
                ]
              },
              {
                icon: Briefcase,
                title: 'Supporting Black Businesses',
                points: [
                  'A dedicated directory',
                  'Tools for entrepreneurs and creators',
                  'A focus on visibility and cultural respect'
                ]
              },
              {
                icon: Globe,
                title: 'Connection Across the Diaspora',
                points: [
                  'Stories, conversation, and connection across regions and generations'
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
            "Care and clarity guide the way."
          </p>
        </div>
      </div>

      {/* Core Values - STEALTH A+ */}
      <div style={{ padding: '100px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Core Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              { emoji: '🖤', title: 'Dignity', desc: 'We honor the humanity of Black communities in every interaction.' },
              { emoji: '🌍', title: 'Truth', desc: 'We uplift our stories and perspectives with honesty and care.' },
              { emoji: '🤝', title: 'Unity', desc: 'We celebrate connection across the diaspora.' },
              { emoji: '🔐', title: 'Stewardship', desc: 'Identity and information handled with respect and clarity.' },
              { emoji: '💛', title: 'Care', desc: 'Design choices rooted in emotional and cultural well-being.' },
              { emoji: '🚀', title: 'Long-Term Vision', desc: 'Created with the future in mind, not just today.' }
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

      {/* What BANIBS Offers - STEALTH A+ */}
      <div style={{ padding: '100px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '64px',
            textAlign: 'center',
            color: styles.accent
          }}>
            What BANIBS Offers Early On
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px',
            marginBottom: '56px'
          }}>
            {[
              { icon: MessageCircle, title: 'Social Spaces for Black Communities', desc: 'A calm, private place to share, connect, and communicate.' },
              { icon: ShoppingBag, title: 'Black-Owned Business Directory', desc: 'A clear and respectful way to find and support Black-owned businesses.' }
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
            fontSize: '1rem',
            lineHeight: '1.7',
            textAlign: 'center',
            color: styles.textSecondary,
            fontStyle: 'italic',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            (Future features will be introduced naturally as the platform grows.)
          </p>
        </div>
      </div>

      {/* Founder Statement - STEALTH A+ */}
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
              "BANIBS is built with discipline, faith, and intention.<br />
              It honors the belief that Black communities deserve a peaceful, dignified digital home—crafted carefully and with deep respect."
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

export default MissionValuesPage;
