import React, { useState } from 'react';

/**
 * BANIBS Coming Soon Page - V2
 * BANIBS is in motion again
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
        paddingTop: '80px',
        paddingBottom: '60px',
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

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          {/* Status Line */}
          <div style={{
            fontSize: '0.95rem',
            letterSpacing: '2px',
            color: '#FFD700',
            marginBottom: '32px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            BANIBS is in motion again
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFFFFF 40%, #FFD700 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }}>
            BANIBS — A Secure Black Digital Ecosystem
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '32px',
            maxWidth: '800px',
            margin: '0 auto 32px',
            fontWeight: '400'
          }}>
            Built for Black businesses and our people — a connected space for commerce, news, culture, 
            and community life, secured with encryption and built for our digital sovereignty.
          </p>

          {/* Coming Soon Line */}
          <p style={{
            fontSize: '1.15rem',
            color: '#FFD700',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Full platform reveal coming soon.
          </p>
        </div>
      </div>

      {/* For Black Businesses Section */}
      <div style={{
        padding: '64px 20px',
        background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 100%)',
        borderTop: '1px solid rgba(255, 215, 0, 0.15)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Section Divider */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            color: 'rgba(255, 215, 0, 0.4)',
            fontSize: '0.85rem',
            letterSpacing: '1px'
          }}>
            ––––––––––––––––––––<br />
            For Black Businesses<br />
            ––––––––––––––––––––
          </div>

          {/* Section Headline */}
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#FFD700',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            A home built for how we really work.
          </h2>

          {/* Section Description */}
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            BANIBS is designing tools to help Black-owned businesses be seen, trusted, and supported — 
            online and offline, without selling your data or exploiting your customers.
          </p>

          {/* Bullet Points */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.03)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '12px',
            padding: '32px',
            fontSize: '1.05rem',
            lineHeight: '1.9',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Connect with customers who are actively seeking Black-owned options.
              </li>
              <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Get discovered in a curated business network, not a noisy feed.
              </li>
              <li style={{ paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Prepare to list your business, services, and products on launch.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* For Our People Section */}
      <div style={{
        padding: '64px 20px',
        background: '#000000',
        borderTop: '1px solid rgba(255, 215, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Section Divider */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            color: 'rgba(255, 215, 0, 0.4)',
            fontSize: '0.85rem',
            letterSpacing: '1px'
          }}>
            ––––––––––––––––<br />
            For Our People<br />
            ––––––––––––––––
          </div>

          {/* Section Headline */}
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#FFD700',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            Social, news, and support in one place — with privacy and protection built in.
          </h2>

          {/* Section Description */}
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            BANIBS will bring together social updates, community alerts, business deals, and trusted 
            information from across the Diaspora — all under an encrypted, independently controlled platform.
          </p>

          {/* Bullet Points */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.03)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '12px',
            padding: '32px',
            fontSize: '1.05rem',
            lineHeight: '1.9',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Follow what's happening in your city and across the Black world.
              </li>
              <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Discover businesses, creators, and projects that pour back into us.
              </li>
              <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Choose how wide your reach goes — neighborhood, nation, or Diaspora.
              </li>
              <li style={{ paddingLeft: '24px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#FFD700', fontWeight: 'bold' }}>•</span>
                Know your data and conversations are protected by multi-layer security.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        padding: '64px 20px',
        background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
        borderTop: '1px solid rgba(255, 215, 0, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
          fontWeight: '700',
          color: '#FFD700',
          marginBottom: '48px',
          letterSpacing: '0.3px'
        }}>
          Black businesses: get ready to plug in on Day One.
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
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '24px',
                fontWeight: '600'
              }}>
                Get notified when we launch
              </p>
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

      {/* Footer */}
      <div style={{
        padding: '60px 20px',
        borderTop: '1px solid rgba(255, 215, 0, 0.15)',
        textAlign: 'center',
        background: '#000000'
      }}>
        <div style={{
          fontSize: '1.1rem',
          color: '#FFD700',
          fontWeight: '600',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          BANIBS · Black America News, Information & Business System
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '500'
        }}>
          Fully encrypted. Built for us, not for them.
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

export default ComingSoonPage;
