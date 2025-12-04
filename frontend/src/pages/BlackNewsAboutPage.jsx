import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, Users, Compass, FileText,
  Briefcase, Heart, Sparkles, Shield
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Black News About Page (A5)
 * Public-facing explainer for BANIBS Black News
 * Static page - no API calls
 */
const BlackNewsAboutPage = () => {
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
          bgPrimary: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)',
          bgSecondary: '#FFFFFF',
          bgTertiary: 'rgba(188, 227, 255, 0.2)',
          textPrimary: '#1A3A52',
          textSecondary: '#2A4A62',
          accent: '#87bce9',
          accentGradient: 'linear-gradient(135deg, #87bce9 0%, #5A8FBD 100%)',
          cardBg: 'rgba(255, 255, 255, 0.9)',
          cardBorder: 'rgba(135, 188, 233, 0.4)',
        };
      case 'gold':
      default:
        return {
          bgPrimary: 'linear-gradient(180deg, #F7F0E3 0%, #FFFEF8 100%)',
          bgSecondary: '#FFFEF8',
          bgTertiary: 'rgba(247, 240, 227, 0.4)',
          textPrimary: '#2A2A2A',
          textSecondary: '#3A3A3A',
          accent: '#D9B77A',
          accentGradient: 'linear-gradient(135deg, #D9B77A 0%, #B89968 100%)',
          cardBg: 'rgba(255, 255, 255, 0.85)',
          cardBorder: 'rgba(217, 183, 122, 0.4)',
        };
    }
  };

  const styles = getStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString(), source: 'black-news-about-page' });
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
      <title>BANIBS — Black News</title>

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
          background: `radial-gradient(circle, ${styles.accent}30 0%, transparent 70%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto' }}>
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
            Black News, Centered on Our Stories
          </h1>
          
          <div style={{
            background: styles.cardBg,
            border: `2px solid ${styles.cardBorder}`,
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: `0 4px 20px ${styles.accent}15`,
            marginBottom: '28px'
          }}>
            <p style={{
              fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
              lineHeight: '1.8',
              color: styles.textSecondary,
              fontWeight: '500',
              marginBottom: '28px'
            }}>
              BANIBS Black News is a curated space focused on news, stories, and perspectives that center our people - locally, nationally, and across the globe.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: styles.textSecondary
            }}>
              BANIBS Black News highlights trusted sources, emerging voices, and stories that don't always make it to the front page elsewhere. Our goal is simple: provide a calm, beautiful, and dignified space to stay informed without feeling overwhelmed.
            </p>
          </div>
          
          {/* Soft Badge */}
          <div style={{
            display: 'inline-block',
            background: styles.cardBg,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: '24px',
            padding: '10px 28px',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: styles.accent,
            letterSpacing: '0.5px'
          }}>
            Curated • Calm • Centered
          </div>
        </div>
      </div>

      {/* Section: Why Black News Matters */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Why a Dedicated Black News Space?
          </h2>
          <div style={{
            width: '80px',
            height: '3px',
            background: styles.accent,
            margin: '0 auto 56px',
            borderRadius: '2px'
          }} />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                title: 'Representation',
                description: 'Many of our stories are overlooked, minimized, or framed without our voice. BANIBS Black News creates a space where our communities are centered, not an afterthought.'
              },
              {
                title: 'Context',
                description: 'Stories hit different when you understand the history, the culture, and the real impact on our neighborhoods and families.'
              },
              {
                title: 'Discovery',
                description: 'There are powerful Black-owned outlets, journalists, and creators doing the work every day. We help people discover and return to them.'
              }
            ].map((block, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 28px',
                boxShadow: `0 4px 16px ${styles.accent}12`,
                position: 'relative'
              }}>
                {/* Abstract circle placeholder */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `${styles.accent}20`,
                  border: `2px solid ${styles.accent}`,
                  marginBottom: '20px'
                }} />
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

      {/* Section: How BANIBS Curates */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            How BANIBS Curates Black News
          </h2>
          <div style={{
            width: '80px',
            height: '3px',
            background: styles.accent,
            margin: '0 auto 56px',
            borderRadius: '2px'
          }} />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'start'
          }}>
            {/* Left Column */}
            <div style={{
              background: styles.cardBg,
              border: `2px solid ${styles.cardBorder}`,
              borderRadius: '12px',
              padding: '36px 32px',
              boxShadow: `0 4px 16px ${styles.accent}12`
            }}>
              <p style={{
                fontSize: '1.15rem',
                lineHeight: '1.8',
                color: styles.textSecondary
              }}>
                BANIBS Black News blends automation with intentional curation. We track trusted sources, look for stories with real impact, and apply signals that prioritize relevance, dignity, and usefulness over outrage.
              </p>
            </div>
            
            {/* Right Column - Steps */}
            <div style={{
              background: styles.cardBg,
              border: `2px solid ${styles.cardBorder}`,
              borderRadius: '12px',
              padding: '36px 32px',
              boxShadow: `0 4px 16px ${styles.accent}12`
            }}>
              {[
                {
                  title: 'Source Tagging',
                  description: 'We identify outlets that are Black-owned or Black-focused and highlight their coverage.'
                },
                {
                  title: 'Topic Signals',
                  description: 'We watch for stories that affect our communities in business, health, education, justice, arts, and everyday life.'
                },
                {
                  title: 'Calm Presentation',
                  description: 'Instead of chaos and pop-ups, we present stories in a clean, thoughtful layout that is easier on the mind.'
                },
                {
                  title: 'Continuous Improvement',
                  description: 'Over time, our systems learn from what people read, share, and return to - always with privacy and respect at the core.'
                }
              ].map((step, i) => (
                <div key={i} style={{
                  marginBottom: i < 3 ? '28px' : '0',
                  paddingLeft: '24px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: styles.accent
                  }} />
                  <h4 style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: styles.accent
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: styles.textSecondary
                  }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section: What You'll See Inside */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            What You'll Find in Black News
          </h2>
          <div style={{
            width: '80px',
            height: '3px',
            background: styles.accent,
            margin: '0 auto 56px',
            borderRadius: '2px'
          }} />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '28px',
            marginBottom: '40px'
          }}>
            {[
              {
                icon: Users,
                title: 'Local & Community Stories',
                description: 'Coverage from Black-focused outlets, community organizations, and local reporters.'
              },
              {
                icon: Briefcase,
                title: 'Business & Economy',
                description: 'Stories about Black-owned businesses, funding, jobs, and wealth-building.'
              },
              {
                icon: Heart,
                title: 'Health & Wellbeing',
                description: 'Information around health, wellness, mental health, and resources that matter to our families.'
              },
              {
                icon: Sparkles,
                title: 'Arts, Culture & Future',
                description: 'Music, film, creators, innovators, and the work shaping tomorrow.'
              }
            ].map((storyType, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${styles.accent}10`
              }}>
                <storyType.icon size={40} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: styles.textPrimary
                }}>
                  {storyType.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: styles.textSecondary
                }}>
                  {storyType.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Optional note */}
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.7',
            textAlign: 'center',
            color: styles.textSecondary,
            fontStyle: 'italic',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            Over time, BANIBS Black News will grow into a deeper, richer hub — with more sources, better tools, and ways for the community to participate.
          </p>
        </div>
      </div>

      {/* Section: Trust, Respect & Harm Reduction */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Built with Care and Respect
          </h2>
          <div style={{
            width: '80px',
            height: '3px',
            background: styles.accent,
            margin: '0 auto 48px',
            borderRadius: '2px'
          }} />
          
          <div style={{
            background: styles.cardBg,
            border: `2px solid ${styles.cardBorder}`,
            borderRadius: '16px',
            padding: '48px 40px',
            boxShadow: `0 6px 24px ${styles.accent}15`
          }}>
            <p style={{
              fontSize: '1.15rem',
              lineHeight: '1.9',
              color: styles.textSecondary,
              marginBottom: '28px'
            }}>
              We know how harmful misinformation and sensational coverage can be — especially for our people. BANIBS Black News is built around care:
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '1.05rem',
              lineHeight: '2',
              color: styles.textSecondary
            }}>
              {[
                'We prioritize clarity over clickbait.',
                'We lean toward sources that have a history of serving our communities.',
                'We are careful about how we present sensitive stories.'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '12px',
                  paddingLeft: '32px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    color: styles.accent,
                    fontSize: '1.4rem'
                  }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: styles.textSecondary,
              marginTop: '28px',
              fontStyle: 'italic'
            }}>
              This won't be perfect on day one, but our commitment is clear: we want this space to do more good than harm.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Coming Soon / Call to Action */}
      <div style={{
        padding: '80px 20px',
        background: styles.bgSecondary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '24px',
            color: styles.accent
          }}>
            This Is Just the Beginning
          </h2>
          <p style={{
            fontSize: '1.15rem',
            marginBottom: '48px',
            lineHeight: '1.8',
            color: styles.textSecondary
          }}>
            BANIBS Black News will launch as part of the broader BANIBS platform. As we build, your early support and feedback help shape what this space becomes.
          </p>

          {/* Email Capture */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '12px',
              color: styles.textPrimary
            }}>
              Stay in the Loop
            </h3>
            <p style={{
              fontSize: '1rem',
              marginBottom: '32px',
              color: styles.textSecondary
            }}>
              Get an update when BANIBS Black News opens to the public.
            </p>
          </div>

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
                  Notify Me
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
              <p style={{ fontSize: '1rem' }}>We'll notify you when BANIBS Black News launches.</p>
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
        Curated • Calm • Centered
      </div>
    </div>
  );
};

export default BlackNewsAboutPage;
