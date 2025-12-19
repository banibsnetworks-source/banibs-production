import React, { useState } from 'react';

/**
 * BANIBS Coming Soon Page
 * Final Locked Copy - Production Ready
 */
const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Store in localStorage for now (frontend only)
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('banibs_early_access', JSON.stringify(existing));
      setSubmitted(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B0B',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse at center, rgba(196, 154, 58, 0.08) 0%, transparent 70%)'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(196, 154, 58, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          {/* Primary Headline */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: '800',
            lineHeight: '1.05',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #C49A3A 50%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }}>
            Encrypted. Ad-Free. Built for Our People.
          </h1>

          {/* Secondary Line */}
          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.5',
            color: '#C49A3A',
            marginBottom: '32px',
            fontWeight: '500'
          }}>
            A new digital home for our people — built with privacy and dignity at the core.
          </p>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.75)',
            marginBottom: '56px',
            maxWidth: '650px',
            margin: '0 auto 56px'
          }}>
            BANIBS brings together stories, perspectives, and information from across the Black diaspora — alongside tools for business, culture, and community.
          </p>

          {/* Waitlist Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                background: 'rgba(196, 154, 58, 0.05)',
                border: '2px solid rgba(196, 154, 58, 0.25)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  marginBottom: '20px',
                  color: '#C49A3A',
                  fontWeight: '600'
                }}>
                  Get Early Access
                </h3>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(196, 154, 58, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    marginBottom: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px 28px',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #C49A3A 0%, #D4AF37 100%)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Join the Waitlist
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '440px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✓</div>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '8px',
                color: '#10B981',
                fontWeight: '600'
              }}>
                You're on the list
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                We'll notify you when BANIBS launches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 20px',
        borderTop: '1px solid rgba(196, 154, 58, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.9rem',
        letterSpacing: '2px'
      }}>
        Peace • Love • Honor • Respect
        <div style={{
          marginTop: '24px',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <a
            href="https://www.amazon.com/Devils-Dismissive-Argument-Duane-Cunningham/dp/B0DK3D3ZMJ"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(196, 154, 58, 0.7)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#C49A3A'}
            onMouseOut={(e) => e.target.style.color = 'rgba(196, 154, 58, 0.7)'}
          >
            Read the founder's book: The Devil's Dismissive Argument (Amazon)
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
