import React, { useState } from 'react';
import { Heart, Users, Briefcase, Globe, Sparkles, Shield } from 'lucide-react';

/**
 * BANIBS Gold Coming Soon Page - Variant C
 * Women's Gold Edition - Warm, elegant, uplifting
 * Designed for feminine appeal with premium gold aesthetics
 */
const ComingSoonPageGold = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Store in localStorage (frontend only)
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString(), variant: 'gold' });
      localStorage.setItem('banibs_early_access', JSON.stringify(existing));
      setEmail('');
      setSubmitted(true);
    }
  };

  const EmailCaptureBox = ({ placement }) => (
    !submitted ? (
      <form onSubmit={handleSubmit} style={{ maxWidth: '550px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(226, 189, 89, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: '3px solid rgba(226, 189, 89, 0.4)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(226, 189, 89, 0.2)'
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
              fontSize: '1.1rem',
              background: '#FFFFFF',
              border: '2px solid rgba(226, 189, 89, 0.5)',
              borderRadius: '14px',
              color: '#1A1A1A',
              marginBottom: '20px',
              outline: 'none',
              boxShadow: '0 2px 12px rgba(226, 189, 89, 0.1)'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '18px 36px',
              fontSize: '1.2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #E2BD59 0%, #D4AF37 100%)',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(226, 189, 89, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.03)';
              e.target.style.boxShadow = '0 8px 24px rgba(226, 189, 89, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(226, 189, 89, 0.4)';
            }}
          >
            Join Early Access
          </button>
        </div>
      </form>
    ) : (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '3px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '550px',
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>✨</div>
        <h3 style={{
          fontSize: '1.8rem',
          marginBottom: '16px',
          color: '#10B981',
          fontWeight: '700'
        }}>
          You're on the list!
        </h3>
        <p style={{ color: '#1A1A1A', fontSize: '1.1rem' }}>
          We'll notify you when BANIBS launches.
        </p>
      </div>
    )
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F5E8C8 0%, #FFFFFF 50%, #F5E8C8 100%)',
      color: '#1A1A1A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Gold glow effect */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '900px',
          background: 'radial-gradient(circle, rgba(226, 189, 89, 0.3) 0%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '950px' }}>
          {/* Hero Title */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, #E2BD59 0%, #1A1A1A 50%, #E2BD59 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(226, 189, 89, 0.3)'
          }}>
            BANIBS — Our New<br />Digital Home
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            lineHeight: '1.6',
            color: '#1A1A1A',
            marginBottom: '56px',
            fontWeight: '500'
          }}>
            A warm, beautiful space built to uplift,<br />
            empower, and center our people.
          </p>

          {/* Hero Message Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '3px solid rgba(226, 189, 89, 0.4)',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '56px',
            boxShadow: '0 12px 48px rgba(226, 189, 89, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              lineHeight: '1.9',
              color: '#1A1A1A',
              marginBottom: '32px',
              fontWeight: '500'
            }}>
              A safe, dignified home for our stories,<br />
              businesses, culture, and community.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#E2BD59'
            }}>
              <span>Peace</span>
              <span>•</span>
              <span>Beauty</span>
              <span>•</span>
              <span>Dignity</span>
              <span>•</span>
              <span>Community</span>
            </div>
          </div>

          {/* Email Capture - Hero */}
          <EmailCaptureBox placement="hero" />
        </div>
      </div>

      {/* Community Section */}
      <div style={{
        padding: '120px 20px',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '40px',
            color: '#E2BD59',
            textShadow: '0 2px 8px rgba(226, 189, 89, 0.2)'
          }}>
            Built With Care & Belonging
          </h2>
          <p style={{
            fontSize: '1.4rem',
            lineHeight: '1.8',
            color: '#1A1A1A',
            marginBottom: '56px',
            maxWidth: '700px',
            margin: '0 auto 56px'
          }}>
            A space designed to feel warm, safe, and welcoming for everyone in our community.
          </p>

          {/* Icon Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '28px',
            marginBottom: '48px'
          }}>
            {[
              { icon: Heart, label: 'Women' },
              { icon: Users, label: 'Families' },
              { icon: Sparkles, label: 'Creators' },
              { icon: Briefcase, label: 'Entrepreneurs' },
              { icon: Shield, label: 'Professionals' },
              { icon: Globe, label: 'Diaspora' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                padding: '32px 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(226, 189, 89, 0.12) 0%, rgba(255, 255, 255, 0.9) 100%)',
                border: '2px solid rgba(226, 189, 89, 0.3)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(226, 189, 89, 0.1)'
              }}>
                <Icon size={42} color="#E2BD59" style={{ marginBottom: '16px' }} />
                <div style={{
                  fontSize: '1.15rem',
                  color: '#1A1A1A',
                  fontWeight: '600'
                }}>{label}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '1.3rem',
            color: '#E2BD59',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            A platform where connection and care come first.
          </p>
        </div>
      </div>

      {/* Black Business Section */}
      <div style={{
        padding: '120px 20px',
        background: 'linear-gradient(135deg, rgba(226, 189, 89, 0.2) 0%, #FFFFFF 100%)'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(226, 189, 89, 0.25) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '4px solid rgba(226, 189, 89, 0.5)',
            borderRadius: '28px',
            padding: '72px 48px',
            textAlign: 'center',
            boxShadow: '0 16px 56px rgba(226, 189, 89, 0.25)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              fontWeight: '800',
              marginBottom: '32px',
              color: '#E2BD59',
              textShadow: '0 2px 12px rgba(226, 189, 89, 0.3)'
            }}>
              For Black Businesses
            </h2>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '48px',
              color: '#1A1A1A'
            }}>
              Empower your business. Grow your reach.<br />Serve your community.
            </p>

            <div style={{
              textAlign: 'left',
              maxWidth: '650px',
              margin: '0 auto 40px',
              fontSize: '1.2rem',
              lineHeight: '2.2',
              color: '#1A1A1A'
            }}>
              <p style={{ marginBottom: '24px', fontWeight: '700', fontSize: '1.25rem' }}>
                BANIBS gives Black entrepreneurs:
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  'Free listings',
                  'Business exposure',
                  'Verified customers',
                  'Culture-focused directory',
                  'Local + global reach',
                  'Built for us'
                ].map((item, i) => (
                  <li key={i} style={{
                    marginBottom: '16px',
                    paddingLeft: '40px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#E2BD59',
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#E2BD59',
              fontStyle: 'italic'
            }}>
              "A platform that puts our businesses first."
            </p>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div style={{
        padding: '120px 20px',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '56px',
            color: '#E2BD59',
            textShadow: '0 2px 8px rgba(226, 189, 89, 0.2)'
          }}>
            The News Our People Deserve
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            marginBottom: '48px'
          }}>
            {[
              'Black News Lens',
              'Diaspora coverage',
              'Africa & Caribbean voices',
              'Culture & civil rights coverage',
              'No ads, no tracking, no algorithms'
            ].map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, rgba(226, 189, 89, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%)',
                border: '3px solid rgba(226, 189, 89, 0.4)',
                borderRadius: '18px',
                padding: '32px 28px',
                fontSize: '1.2rem',
                color: '#1A1A1A',
                fontWeight: '600',
                boxShadow: '0 6px 24px rgba(226, 189, 89, 0.15)'
              }}>
                {item}
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '1.6rem',
            color: '#E2BD59',
            fontWeight: '700'
          }}>
            A clear view of the world — through our eyes.
          </p>
        </div>
      </div>

      {/* Built With Love Section */}
      <div style={{
        padding: '120px 20px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(245, 232, 200, 0.3) 100%)'
      }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '72px 48px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '28px',
          border: '3px solid rgba(226, 189, 89, 0.3)',
          boxShadow: '0 12px 48px rgba(226, 189, 89, 0.15)'
        }}>
          <Heart size={56} color="#E2BD59" style={{ marginBottom: '32px' }} />
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: '800',
            marginBottom: '40px',
            color: '#E2BD59'
          }}>
            Built With Love & Purpose
          </h2>
          <p style={{
            fontSize: '1.35rem',
            lineHeight: '2.1',
            color: '#1A1A1A',
            fontWeight: '500',
            maxWidth: '700px',
            margin: '0 auto 32px'
          }}>
            Because we deserve a home that honors who we are<br />
            and who we will become.
          </p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#E2BD59',
            fontStyle: 'italic'
          }}>
            A space built with dignity, care, and respect.
          </p>
        </div>
      </div>

      {/* Closing CTA */}
      <div style={{
        padding: '120px 20px',
        background: 'linear-gradient(180deg, rgba(245, 232, 200, 0.3) 0%, #F5E8C8 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight: '900',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #E2BD59 0%, #1A1A1A 50%, #E2BD59 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 16px rgba(226, 189, 89, 0.3)'
          }}>
            BANIBS Launches Soon
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: '#1A1A1A',
            marginBottom: '56px',
            lineHeight: '1.7',
            fontWeight: '600'
          }}>
            A new digital world for our people is on the way.
          </p>

          {/* Bottom Email Capture */}
          <EmailCaptureBox placement="bottom" />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '48px 20px',
        background: '#F5E8C8',
        textAlign: 'center',
        color: '#1A1A1A',
        fontSize: '1rem',
        letterSpacing: '2px',
        fontWeight: '600'
      }}>
        Peace • Love • Honor • Respect
      </div>
    </div>
  );
};

export default ComingSoonPageGold;
