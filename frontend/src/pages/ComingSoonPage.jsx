import React, { useState } from 'react';
import { Shield, Globe, Lock, Heart } from 'lucide-react';

/**
 * BANIBS Premium Coming Soon Page
 * A New Black Digital Ecosystem
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse at center, rgba(196, 154, 58, 0.08) 0%, transparent 70%)'
      }}>
        {/* Glow effect behind heading */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(196, 154, 58, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          {/* Page Title */}
          <div style={{
            fontSize: '1.1rem',
            letterSpacing: '3px',
            color: '#C49A3A',
            marginBottom: '24px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            BANIBS – A New Black Digital Ecosystem
          </div>

          {/* Hero Heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #C49A3A 50%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(196, 154, 58, 0.3)',
            letterSpacing: '-0.5px'
          }}>
            A Safer, Smarter, Ad-Free<br />Black Digital Community
          </h1>

          {/* Hero Subtext */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '64px',
            maxWidth: '800px',
            margin: '0 auto 64px'
          }}>
            BANIBS is a next-generation ecosystem built to give our people a space where we are not monitored, 
            not mined for data, and not fed algorithmic manipulation. A place built with dignity, freedom, 
            sovereignty, and respect.
          </p>

          {/* Icon Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '32px',
            marginBottom: '80px',
            maxWidth: '700px',
            margin: '0 auto 80px'
          }}>
            {[
              { icon: Shield, label: 'Privacy First' },
              { icon: Lock, label: 'Your Data' },
              { icon: Globe, label: 'Diaspora Lens' },
              { icon: Heart, label: 'Built With Love' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(196, 154, 58, 0.05)',
                border: '1px solid rgba(196, 154, 58, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <Icon size={32} color="#C49A3A" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1 - What We Are */}
      <div style={{
        padding: '80px 20px',
        background: 'linear-gradient(180deg, #0B0B0B 0%, #1A1A1A 100%)',
        borderTop: '1px solid rgba(196, 154, 58, 0.1)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#C49A3A',
            textAlign: 'center'
          }}>
            What We Are
          </h2>
          <div style={{
            fontSize: '1.2rem',
            lineHeight: '2',
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '24px', fontWeight: '600' }}>BANIBS is a full ecosystem:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Real news from across the diaspora',
                'Black-focused analysis and global coverage',
                'Community connections and social circles',
                'Business empowerment',
                'Culture, education, civil rights, and more'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '16px',
                  paddingLeft: '32px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: '#C49A3A',
                    fontWeight: 'bold'
                  }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{
              marginTop: '32px',
              fontSize: '1.3rem',
              color: '#C49A3A',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              All in one place — powered by privacy, not surveillance.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2 - Our Promise */}
      <div style={{
        padding: '80px 20px',
        background: '#0B0B0B'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#C49A3A'
          }}>
            Our Promise
          </h2>
          <div style={{
            background: 'rgba(196, 154, 58, 0.05)',
            border: '2px solid rgba(196, 154, 58, 0.2)',
            borderRadius: '16px',
            padding: '48px',
            fontSize: '1.3rem',
            lineHeight: '2',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <p style={{ fontWeight: '700', marginBottom: '16px' }}>No tracking.</p>
            <p style={{ fontWeight: '700', marginBottom: '16px' }}>No ads.</p>
            <p style={{ fontWeight: '700', marginBottom: '32px' }}>No algorithms controlling your eyes.</p>
            <p style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
              Your data belongs to you — not corporations.
            </p>
            <p style={{
              fontSize: '1.2rem',
              color: '#C49A3A',
              fontWeight: '600',
              lineHeight: '1.6'
            }}>
              We are building the world's first Black digital platform designed from the ground up 
              to protect us, uplift us, and keep our information sovereign.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 - What's Coming */}
      <div style={{
        padding: '80px 20px',
        background: 'linear-gradient(180deg, #0B0B0B 0%, #1A1A1A 100%)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#C49A3A',
            textAlign: 'center'
          }}>
            What's Coming
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              'Black News Lens – the world through our perspective',
              'Diaspora-driven reporting',
              'Secure social features',
              'Business & finance empowerment tools',
              'A trusted community built on honor, truth, and dignity'
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(196, 154, 58, 0.05)',
                border: '1px solid rgba(196, 154, 58, 0.2)',
                borderRadius: '12px',
                padding: '24px',
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.6'
              }}>
                <span style={{ color: '#C49A3A', marginRight: '12px', fontSize: '1.5rem' }}>•</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4 - Call to Action */}
      <div style={{
        padding: '100px 20px',
        background: '#0B0B0B',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #C49A3A 0%, #FFFFFF 50%, #C49A3A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            BANIBS Launches Soon
          </h2>
          <p style={{
            fontSize: '1.4rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '48px',
            lineHeight: '1.7'
          }}>
            A safer digital world for our people is on the way.
          </p>

          {/* Early Access Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{
                background: 'rgba(196, 154, 58, 0.05)',
                border: '2px solid rgba(196, 154, 58, 0.3)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '24px',
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
                    padding: '16px 20px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(196, 154, 58, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
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
                    background: 'linear-gradient(135deg, #C49A3A 0%, #D4AF37 100%)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '12px',
                color: '#10B981',
                fontWeight: '600'
              }}>
                You're on the list!
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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
      </div>
    </div>
  );
};

export default ComingSoonPage;
