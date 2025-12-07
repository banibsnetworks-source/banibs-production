import React, { useState } from 'react';
import { Heart, Users, Briefcase, Globe, Sparkles, Shield } from 'lucide-react';

/**
 * BANIBS Sky Blue Coming Soon Page - Variant B
 * Women-Friendly "Welcome Home" Edition
 * Designed for warmth, safety, and community appeal
 */
const ComingSoonPageBlue = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Store in localStorage (frontend only)
      const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
      existing.push({ email, timestamp: new Date().toISOString(), variant: 'blue' });
      localStorage.setItem('banibs_early_access', JSON.stringify(existing));
      setSubmitted(false); // Reset for bottom CTA
      setEmail('');
      setSubmitted(true);
    }
  };

  const EmailCaptureBox = ({ placement }) => (
    !submitted ? (
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid rgba(232, 196, 101, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <p style={{
            fontSize: '0.95rem',
            marginBottom: '20px',
            color: '#223049',
            fontWeight: '500'
          }}>
            Be the first to enter the new digital world.
          </p>
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
              background: '#FFFFFF',
              border: '2px solid rgba(232, 196, 101, 0.4)',
              borderRadius: '12px',
              color: '#223049',
              marginBottom: '16px',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #E8C465 0%, #D4AF37 100%)',
              color: '#223049',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(232, 196, 101, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 16px rgba(232, 196, 101, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(232, 196, 101, 0.3)';
            }}
          >
            Join Early Access
          </button>
        </div>
      </form>
    ) : (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
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
        <p style={{ color: '#223049', fontSize: '1rem' }}>
          We'll notify you when BANIBS launches.
        </p>
      </div>
    )
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #BCE3FF 0%, #FFFFFF 100%)',
      color: '#223049',
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
        position: 'relative',
        background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.6) 0%, transparent 70%)'
      }}>
        {/* Soft cloud glow */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          {/* Hero Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #E8C465 0%, #223049 50%, #E8C465 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px'
          }}>
            BANIBS — A New Digital Home<br />for Our People
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.7',
            color: '#223049',
            marginBottom: '48px',
            fontWeight: '500'
          }}>
            A bright, uplifting space built to protect, empower,<br />
            and celebrate Black life everywhere.
          </p>

          {/* Hero Message */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(232, 196, 101, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            marginBottom: '48px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
              lineHeight: '1.9',
              color: '#223049',
              marginBottom: '24px'
            }}>
              BANIBS is more than a website —<br />
              it is a <strong>living home</strong> for our stories, our businesses, our culture, and our future.
            </p>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              lineHeight: '1.8',
              color: '#223049'
            }}>
              A space where we are not tracked, not manipulated, and not drowned out.
            </p>
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#E8C465'
            }}>
              <span>Just peace.</span>
              <span>•</span>
              <span>Just dignity.</span>
              <span>•</span>
              <span>Just us.</span>
            </div>
          </div>

          {/* Email Capture - Hero */}
          <EmailCaptureBox placement="hero" />
        </div>
      </div>

      {/* Section 1 - A Community Built With Care */}
      <div style={{
        padding: '100px 20px',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#223049'
          }}>
            A Community Built With Care
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#223049',
            marginBottom: '48px'
          }}>
            BANIBS is designed to feel warm, safe, and human.
          </p>

          {/* Icon Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {[
              { icon: Heart, label: 'women' },
              { icon: Users, label: 'families' },
              { icon: Sparkles, label: 'creators' },
              { icon: Briefcase, label: 'entrepreneurs' },
              { icon: Shield, label: 'professionals' },
              { icon: Globe, label: 'the diaspora' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                padding: '24px 16px',
                borderRadius: '16px',
                background: 'rgba(188, 227, 255, 0.2)',
                border: '2px solid rgba(232, 196, 101, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <Icon size={36} color="#E8C465" style={{ marginBottom: '12px' }} />
                <div style={{
                  fontSize: '1rem',
                  color: '#223049',
                  fontWeight: '500'
                }}>{label}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '1.2rem',
            color: '#223049',
            fontWeight: '500',
            fontStyle: 'italic'
          }}>
            Every part of the experience reflects respect, protection, and empowerment.
          </p>
        </div>
      </div>

      {/* Section 2 - For Black Businesses */}
      <div style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, rgba(232, 196, 101, 0.15) 0%, rgba(188, 227, 255, 0.15) 100%)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(232, 196, 101, 0.2) 0%, rgba(255, 255, 255, 0.8) 100%)',
            border: '3px solid rgba(232, 196, 101, 0.4)',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(232, 196, 101, 0.2)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#E8C465',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              For Black Businesses
            </h2>
            <p style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              marginBottom: '40px',
              color: '#223049'
            }}>
              Empower your business. Grow your reach. Serve your community.
            </p>

            <div style={{
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto 32px',
              fontSize: '1.15rem',
              lineHeight: '2',
              color: '#223049'
            }}>
              <p style={{ marginBottom: '16px', fontWeight: '600' }}>BANIBS gives Black entrepreneurs:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  'Visibility',
                  'Community trust',
                  'Black-dollar circulation',
                  'Freedom from algorithm suppression',
                  'Real connection to customers',
                  'A place where Black businesses can finally thrive'
                ].map((item, i) => (
                  <li key={i} style={{
                    marginBottom: '12px',
                    paddingLeft: '32px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#E8C465',
                      fontWeight: 'bold',
                      fontSize: '1.3rem'
                    }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: '#E8C465',
              fontStyle: 'italic'
            }}>
              "It's time for a platform built to uplift us."
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 - The News Our People Deserve */}
      <div style={{
        padding: '100px 20px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(188, 227, 255, 0.3) 100%)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#223049'
          }}>
            The News Our People Deserve
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {[
              'Verified Black News',
              'Diaspora reporting',
              'Africa & Caribbean voices',
              'Culture & civil rights coverage',
              'No ads, no trackers, no algorithms'
            ].map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, rgba(188, 227, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
                border: '2px solid rgba(188, 227, 255, 0.6)',
                borderRadius: '16px',
                padding: '28px 24px',
                fontSize: '1.1rem',
                color: '#223049',
                fontWeight: '500',
                boxShadow: '0 4px 16px rgba(188, 227, 255, 0.3)'
              }}>
                {item}
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '1.4rem',
            color: '#E8C465',
            fontWeight: '600'
          }}>
            A clear view of the world — through our eyes.
          </p>
        </div>
      </div>

      {/* Section 4 - Built With Love and Purpose */}
      <div style={{
        padding: '100px 20px',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '60px 40px',
          background: 'rgba(188, 227, 255, 0.15)',
          borderRadius: '24px',
          border: '2px solid rgba(232, 196, 101, 0.2)'
        }}>
          <Heart size={48} color="#E8C465" style={{ marginBottom: '24px' }} />
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#223049'
          }}>
            Built With Love and Purpose
          </h2>
          <div style={{
            fontSize: '1.25rem',
            lineHeight: '2',
            color: '#223049'
          }}>
            <p style={{ marginBottom: '20px' }}>
              BANIBS was built to <strong>protect our dignity</strong>.
            </p>
            <p style={{ marginBottom: '20px' }}>
              To give us a <strong>peaceful digital home</strong>.
            </p>
            <p style={{ marginBottom: '20px' }}>
              To restore <strong>truth, community, and connection</strong>.
            </p>
            <p style={{ marginBottom: '32px' }}>
              To give our children <strong>something better</strong>.
            </p>
            <p style={{
              fontSize: '1.35rem',
              fontWeight: '600',
              color: '#E8C465',
              fontStyle: 'italic',
              lineHeight: '1.8'
            }}>
              "Because we deserve a space that honors who we are<br />
              and who we will become."
            </p>
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div style={{
        padding: '100px 20px',
        background: 'linear-gradient(180deg, rgba(188, 227, 255, 0.3) 0%, #BCE3FF 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #E8C465 0%, #223049 50%, #E8C465 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            BANIBS Launches Soon
          </h2>
          <p style={{
            fontSize: '1.4rem',
            color: '#223049',
            marginBottom: '48px',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            A bright, beautiful digital world for our people is on the way.
          </p>

          {/* Bottom Email Capture */}
          <EmailCaptureBox placement="bottom" />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 20px',
        background: '#BCE3FF',
        textAlign: 'center',
        color: '#223049',
        fontSize: '0.95rem',
        letterSpacing: '2px',
        fontWeight: '500'
      }}>
        Peace • Love • Honor • Respect
      </div>
    </div>
  );
};

export default ComingSoonPageBlue;
