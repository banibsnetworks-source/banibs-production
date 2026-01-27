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
      background: 'linear-gradient(180deg, #0d1f3c 0%, #091428 50%, #050d1a 100%)',
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
        background: 'radial-gradient(ellipse at center, rgba(80, 140, 255, 0.12) 0%, transparent 60%)'
      }}>
        {/* Luminous glow effect */}
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(100, 160, 255, 0.18) 0%, rgba(60, 120, 220, 0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
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
            color: '#FFFFFF',
            letterSpacing: '-1px',
            textShadow: '0 0 40px rgba(150, 200, 255, 0.4), 0 0 80px rgba(100, 160, 255, 0.2)'
          }}>
            Encrypted. Ad-Free. Built for Our People.
          </h1>

          {/* Secondary Line */}
          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.5',
            color: '#FFFFFF',
            marginBottom: '32px',
            fontWeight: '600',
            textShadow: '0 0 30px rgba(150, 200, 255, 0.3)'
          }}>
            A new digital home for our people — built with privacy and dignity at the core.
          </p>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.88)',
            marginBottom: '56px',
            maxWidth: '650px',
            margin: '0 auto 56px',
            fontWeight: '400'
          }}>
            BANIBS brings together stories, perspectives, and information from across the Black diaspora — alongside tools for business, culture, and community.
          </p>

          {/* Waitlist Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '440px', margin: '0 auto' }}>
              <div style={{
                background: 'rgba(8, 18, 35, 0.85)',
                border: '1px solid rgba(100, 150, 220, 0.2)',
                borderRadius: '18px',
                padding: '36px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 50px rgba(80, 130, 200, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  marginBottom: '22px',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  textShadow: '0 0 20px rgba(150, 200, 255, 0.25)'
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
                    background: 'rgba(0, 10, 25, 0.6)',
                    border: '1px solid rgba(100, 150, 220, 0.25)',
                    borderRadius: '10px',
                    color: 'white',
                    marginBottom: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(120, 170, 255, 0.5)';
                    e.target.style.boxShadow = '0 0 12px rgba(100, 150, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(100, 150, 220, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px 28px',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F0FF 100%)',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 15px rgba(255, 255, 255, 0.2), 0 0 25px rgba(200, 220, 255, 0.15)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 35px rgba(200, 220, 255, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 15px rgba(255, 255, 255, 0.2), 0 0 25px rgba(200, 220, 255, 0.15)';
                  }}
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

      {/* From the Founder Section */}
      <div style={{
        padding: '60px 20px',
        background: 'rgba(80, 140, 255, 0.03)',
        borderTop: '1px solid rgba(150, 190, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'rgba(220, 235, 255, 0.9)',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            From the Founder
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.55)',
            marginBottom: '28px'
          }}>
            Explore the founder's works, available on Amazon:
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            fontSize: '0.95rem',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {/* Book 1: The Devil's Dismissive Argument */}
            <a
              href="https://www.amazon.com/Devils-Dismissive-ArgumentTM-Society-Accountability-ebook/dp/B0G6V3T227"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(180, 210, 255, 0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = 'rgba(180, 210, 255, 0.85)'}
            >
              <strong>The Devil's Dismissive Argument</strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                How Society Blocks Truth, Accountability, and Growth
              </span>
            </a>

            {/* Book 2: Before You Call It Out */}
            <a
              href="https://www.amazon.com/dp/B0GC413RV6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(180, 210, 255, 0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = 'rgba(180, 210, 255, 0.85)'}
            >
              <strong>Before You Call It Out</strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                A Companion to The Devil's Dismissive Argument
              </span>
            </a>

            {/* Book 3: The Devil's Deceitful Master Plan */}
            <a
              href="https://www.amazon.com/dp/B0GCC5MHMD"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(180, 210, 255, 0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = 'rgba(180, 210, 255, 0.85)'}
            >
              <strong>The Devil's Deceitful Master Plan</strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                How Deception Works, Hides, and Repeats Across All Human Thought
              </span>
            </a>

            {/* Book 4: The Light God Wants You to See */}
            <a
              href="https://www.amazon.com/dp/B0GCLBZ534"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(180, 210, 255, 0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = 'rgba(180, 210, 255, 0.85)'}
            >
              <strong>The Light God Wants You to See</strong>
            </a>

            {/* Book 5: Human Decision Operating System (HDOS) */}
            <a
              href="https://www.amazon.com/dp/B0GF6SH8QL"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(180, 210, 255, 0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = 'rgba(180, 210, 255, 0.85)'}
            >
              <strong>Human Decision Operating System (HDOS)</strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                An Explanatory Model of Human Choice Under Pressure
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 20px',
        borderTop: '1px solid rgba(150, 190, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.9rem',
        letterSpacing: '2px'
      }}>
        Peace • Love • Honor • Respect
      </div>
    </div>
  );
};

export default ComingSoonPage;
