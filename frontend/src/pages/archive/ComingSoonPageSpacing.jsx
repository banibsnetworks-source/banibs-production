import React, { useState } from 'react';
import { Shield, Newspaper, Store, Users, Briefcase } from 'lucide-react';

/**
 * BANIBS Coming Soon Page - Final Version
 * The Secure Digital Home for Black America
 */
const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      
      try {
        // Store in localStorage for now (frontend only)
        const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
        existing.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('banibs_early_access', JSON.stringify(existing));
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting email:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        paddingTop: '64px',
        paddingBottom: '48px',
        paddingLeft: '20px',
        paddingRight: '20px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.08) 0%, transparent 60%)'
      }}>
        {/* Animated glow effect */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.12) 0%, transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px' }}>
          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFFFFF 40%, #FFD700 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
            textShadow: '0 0 60px rgba(255, 215, 0, 0.4)'
          }}>
            THE SECURE DIGITAL HOME<br />FOR BLACK AMERICA
          </h1>

          {/* Sub-header */}
          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '900px',
            margin: '0 auto',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            Encrypted. Independent. Built for our news, our businesses, our communities, our future.
          </p>
        </div>
      </div>

      {/* Feature Sections Container */}
      <div style={{
        padding: '60px 20px',
        background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 50%, #000000 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {/* Section 1: Encrypted & Private */}
          <FeatureSection
            icon={<Shield size={48} color="#FFD700" strokeWidth={2} />}
            title="Encrypted & Private — By Design"
            content={
              <>
                <p style={{ marginBottom: '16px', fontWeight: '600', fontSize: '1.1rem' }}>
                  Your data belongs to YOU.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  BANIBS uses multi-layer encryption and zero-tolerance data selling.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  No surveillance. No profiling. No exploitation.
                </p>
                <p style={{ fontWeight: '600', color: '#FFD700' }}>
                  This is our platform — not owned by big tech, not controlled by outsiders.
                </p>
              </>
            }
          />

          {/* Section 2: News You Can Trust */}
          <FeatureSection
            icon={<Newspaper size={48} color="#FFD700" strokeWidth={2} />}
            title="News You Can Trust"
            content={
              <>
                <p style={{ marginBottom: '12px' }}>
                  Stay informed with verified, real-context news built around Black communities.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  No bias. No distortion.
                </p>
                <p style={{ fontWeight: '600', color: '#FFD700' }}>
                  Just clarity, truth, and our story told authentically.
                </p>
              </>
            }
          />

          {/* Section 3: Black Business Powerhouse */}
          <FeatureSection
            icon={<Store size={48} color="#FFD700" strokeWidth={2} />}
            title="Black Business Powerhouse"
            content={
              <>
                <p style={{ marginBottom: '12px', fontWeight: '600' }}>
                  The nation's most advanced, AI-powered Black Business Directory.
                </p>
                <p style={{ color: '#FFD700' }}>
                  Designed to help us buy Black, support local, grow revenue, and build wealth across the diaspora.
                </p>
              </>
            }
          />

          {/* Section 4: Real Community. Real Connection. */}
          <FeatureSection
            icon={<Users size={48} color="#FFD700" strokeWidth={2} />}
            title="Real Community. Real Connection."
            content={
              <>
                <p style={{ marginBottom: '16px', fontWeight: '600' }}>
                  BANIBS Social brings:
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  marginBottom: '16px'
                }}>
                  {[
                    'Private Circles',
                    'Community hubs',
                    'Regional groups',
                    'Diaspora links',
                    'Secure messaging',
                    'Shared opportunity networks'
                  ].map((item, i) => (
                    <li key={i} style={{
                      marginBottom: '8px',
                      paddingLeft: '20px',
                      position: 'relative',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: '#FFD700'
                      }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p style={{ fontWeight: '600', color: '#FFD700', fontSize: '0.95rem' }}>
                  It's the first encrypted social ecosystem built entirely for Black America.
                </p>
              </>
            }
          />

          {/* Section 5: Opportunity, Jobs, and Mobility */}
          <FeatureSection
            icon={<Briefcase size={48} color="#FFD700" strokeWidth={2} />}
            title="Opportunity, Jobs, and Mobility"
            content={
              <>
                <p style={{ lineHeight: '1.7' }}>
                  From career paths to entrepreneur tools to marketplace listings — 
                  BANIBS opens real doors and real upward mobility across states, industries, and communities.
                </p>
              </>
            }
          />
        </div>
      </div>

      {/* Why BANIBS Matters Section */}
      <div style={{
        padding: '64px 20px',
        background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
        borderTop: '1px solid rgba(255, 215, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '40px',
            color: '#FFD700',
            letterSpacing: '-0.5px'
          }}>
            Why BANIBS Matters
          </h2>
          <div style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '2px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '20px',
            padding: '48px 32px',
            fontSize: '1.3rem',
            lineHeight: '2',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <p style={{ marginBottom: '24px', fontWeight: '600' }}>
              Because for the first time:
            </p>
            <p style={{ marginBottom: '16px', fontSize: '1.4rem', color: '#FFD700' }}>
              We control our data.
            </p>
            <p style={{ marginBottom: '16px', fontSize: '1.4rem', color: '#FFD700' }}>
              We control our narrative.
            </p>
            <p style={{ marginBottom: '32px', fontSize: '1.4rem', color: '#FFD700' }}>
              We control our economic engine.
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#FFFFFF',
              marginTop: '32px',
              letterSpacing: '0.5px'
            }}>
              This is digital sovereignty for Black America.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon / Email Capture Section */}
      <div style={{
        padding: '80px 20px',
        background: '#000000',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            BANIBS is preparing for launch.
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Join early and be the first inside.
          </p>

          {/* Email Capture Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '550px', margin: '0 auto' }}>
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '16px',
                padding: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      fontSize: '1.05rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid rgba(255, 215, 0, 0.6)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255, 215, 0, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '18px 32px',
                      fontSize: '1.15rem',
                      fontWeight: '700',
                      background: loading 
                        ? 'rgba(255, 215, 0, 0.5)'
                        : 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {loading ? 'Processing...' : 'Notify Me'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '48px',
              maxWidth: '550px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
              <h3 style={{
                fontSize: '1.8rem',
                marginBottom: '16px',
                color: '#10B981',
                fontWeight: '700'
              }}>
                You're on the list!
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '1.1rem'
              }}>
                We'll notify you when BANIBS launches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '60px 20px',
        borderTop: '1px solid rgba(255, 215, 0, 0.15)',
        textAlign: 'center',
        background: '#000000'
      }}>
        <div style={{
          marginBottom: '24px',
          fontSize: '1rem',
          lineHeight: '1.8',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: '600' }}>Built with purpose.</p>
          <p style={{ marginBottom: '8px', fontWeight: '600' }}>Secured by sovereignty.</p>
          <p style={{ fontWeight: '600' }}>Powered by community.</p>
        </div>
        <div style={{
          fontSize: '1.1rem',
          color: '#FFD700',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          BANIBS — Black America News Information & Business System
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

// Feature Section Component
const FeatureSection = ({ icon, title, content }) => (
  <div style={{
    background: 'rgba(255, 215, 0, 0.03)',
    border: '1px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '16px',
    padding: '40px 32px',
    transition: 'all 0.4s ease',
    cursor: 'default'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.06)';
    e.currentTarget.style.border = '1px solid rgba(255, 215, 0, 0.3)';
    e.currentTarget.style.transform = 'translateY(-4px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.03)';
    e.currentTarget.style.border = '1px solid rgba(255, 215, 0, 0.15)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  >
    <div style={{ marginBottom: '24px' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#FFD700',
      lineHeight: '1.3'
    }}>
      {title}
    </h3>
    <div style={{
      fontSize: '1rem',
      lineHeight: '1.7',
      color: 'rgba(255, 255, 255, 0.85)'
    }}>
      {content}
    </div>
  </div>
);

export default ComingSoonPage;
