import React, { useState } from 'react';
import { ShieldCheck, UsersRound, Building2 } from 'lucide-react';

/**
 * BANIBS Coming Soon Page - Stealth A+ Version
 * A new social experience created with care for Black communities.
 */
const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setError('');
      setSubmitted(false);
      
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        const response = await fetch(`${backendUrl}/api/waitlist/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Failed to subscribe');
        }

        const data = await response.json();
        
        if (data.success) {
          setSubmitted(true);
          setEmail('');
        } else {
          throw new Error(data.message || 'Failed to subscribe');
        }
      } catch (err) {
        console.error('Error submitting email:', err);
        setError("We couldn't save your email right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    }
  };

  // BANIBS v2.1 Color Palette
  const colors = {
    bgDeep: '#04060A',
    bgHeroTop: '#0B1726',
    bgCard: '#090D16',
    gold: '#FFD700',
    goldSoft: '#FFE58A',
    skyBlue: '#42B5FF',
    skyBlueSoft: 'rgba(66, 181, 255, 0.2)',
    textMain: '#F9FAFB',
    textMuted: '#9CA3AF'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at top, ${colors.bgHeroTop} 0%, ${colors.bgDeep} 45%, #000000 100%)`,
      color: colors.textMain,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '60px 20px 80px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(circle at top, #0B1726 0%, #04060A 45%, #000000 100%)'
      }}>
        
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${colors.skyBlueSoft} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          {/* BANIBS Wordmark */}
          <div style={{
            fontSize: 'clamp(3.5rem, 8vw, 6rem)',
            fontWeight: '900',
            marginBottom: '24px',
            color: colors.textMain,
            letterSpacing: '0.05em',
            lineHeight: '1'
          }}>
            BANIBS
          </div>

          {/* Hero Headline - STEALTH A+ */}
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
            fontWeight: '700',
            lineHeight: '1.3',
            marginBottom: '28px',
            color: colors.textMain,
            letterSpacing: '-0.5px'
          }}>
            A new social experience created with care for Black communities.
          </h1>

          {/* Subheadline - STEALTH A+ */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: '1.7',
            color: colors.textMain,
            marginBottom: '48px',
            fontWeight: '400'
          }}>
            BANIBS is a Black-led project designed to offer a calm, private digital space where people can connect, share, and feel at ease—without ads, clutter, or noise.
          </p>

          {/* Email Capture */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: `2px solid ${colors.skyBlueSoft}`,
                borderRadius: '14px',
                padding: '32px 28px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 22px',
                      fontSize: '1rem',
                      background: '#050910',
                      border: `1px solid ${colors.skyBlueSoft}`,
                      borderRadius: '8px',
                      color: colors.textMain,
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = `1px solid ${colors.skyBlue}`;
                      e.target.style.boxShadow = `0 0 0 1px rgba(66, 181, 255, 0.4)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.border = `1px solid ${colors.skyBlueSoft}`;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '16px 28px',
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      background: loading 
                        ? 'rgba(66, 181, 255, 0.5)'
                        : `linear-gradient(135deg, ${colors.skyBlue} 0%, ${colors.goldSoft} 100%)`,
                      color: '#020617',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.5px'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = `0 0 25px ${colors.skyBlueSoft}`;
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {loading ? 'Processing...' : 'Notify me when we open'}
                  </button>
                </div>
                
                {/* Reassurance text - STEALTH A+ */}
                <p style={{
                  marginTop: '16px',
                  fontSize: '0.85rem',
                  color: colors.textMuted,
                  lineHeight: '1.5'
                }}>
                  No spam. No selling your email. We'll only reach out when there's a meaningful update.
                </p>
                
                {/* Error message */}
                {error && (
                  <p style={{
                    marginTop: '16px',
                    fontSize: '0.9rem',
                    color: '#EF4444',
                    lineHeight: '1.5',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {error}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '40px 32px',
              maxWidth: '520px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '12px',
                color: '#10B981',
                fontWeight: '700'
              }}>
                You're on the list.
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '1rem'
              }}>
                We'll reach out when there's a meaningful update.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Social Space Overview Section - STEALTH A+ */}
      <div style={{
        padding: '80px 20px',
        background: colors.bgDeep,
        borderTop: `1px solid ${colors.skyBlueSoft}`
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Card 1: Social Space */}
          <PillarCard
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22" cy="15" r="4" stroke="#42B5FF" strokeWidth="1.5" />
                <circle cx="13" cy="20" r="3.5" stroke="#FFD700" strokeWidth="1.5" />
                <circle cx="31" cy="20" r="3.5" stroke="#FFD700" strokeWidth="1.5" />
                <path d="M22 20C19 20 16 22 16 25V28H28V25C28 22 25 20 22 20Z" stroke="#42B5FF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 24.5C11 24.5 9 26 9 28V30H17" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M31 24.5C33 24.5 35 26 35 28V30H27" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="A Social Space Designed with Intention"
            body="BANIBS focuses on creating a thoughtful environment where Black individuals, families, and communities can communicate and stay connected in comfort."
            bullets={[
              'No ads',
              'No tracking',
              'No engagement tricks',
              'Just calm, private spaces to share and connect'
            ]}
          />

          {/* Card 2: Business Directory */}
          <PillarCard
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 36V16L22 8L36 16V36H8Z" stroke="#42B5FF" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 16H36" stroke="#FFD700" strokeWidth="1.5" />
                <rect x="17" y="24" width="10" height="12" stroke="#42B5FF" strokeWidth="1.5" />
                <circle cx="23" cy="30" r="1" fill="#FFD700" />
                <path d="M12 20V22M17 20V22M22 20V22M27 20V22M32 20V22" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="Supporting Black-Owned Businesses"
            body="BANIBS includes a growing directory that helps people find and support Black-owned businesses with clarity and respect."
            bullets={[
              'Simple discovery tools',
              'A clean directory layout',
              'Space to grow at a natural pace'
            ]}
          />

          {/* Card 3: Integrity */}
          <PillarCard
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6L8 12V20C8 28 14 34 22 38C30 34 36 28 36 20V12L22 6Z" stroke="#42B5FF" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M16 22L20 26L28 18" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Built on Care & Clarity"
            body="Everything in BANIBS is shaped with intention—privacy, transparency, and communication rooted in respect."
            subNote="Internal checks guide our decisions so we stay grounded, realistic, and thoughtful."
          />
        </div>
      </div>

      {/* What's Coming First Section - STEALTH A+ */}
      <div style={{
        padding: '80px 20px',
        background: '#050E1A',
        borderTop: `1px solid ${colors.skyBlueSoft}`
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: '800',
            marginBottom: '48px',
            color: colors.skyBlue,
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}>
            What's Coming First
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <PhaseItem
              number="1"
              title="Private Social Circles"
              description="Calm, ad-free spaces created for conversation and connection—built with care for Black communities."
            />
            <PhaseItem
              number="2"
              title="Early Business Directory"
              description="A gradual rollout of tools that highlight and support Black-owned businesses."
            />
          </div>
          
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.7',
            color: colors.textMuted,
            marginTop: '40px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            (Future features will be introduced naturally as the platform grows.)
          </p>
        </div>
      </div>

      {/* Founder Insight Teaser - Premium Elevated Design */}
      <div style={{
        padding: '40px 20px',
        background: 'linear-gradient(180deg, #04060A 0%, #000000 100%)',
        borderTop: `1px solid ${colors.skyBlueSoft}`,
        borderBottom: `1px solid ${colors.skyBlueSoft}`
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Blue glow wrapper */}
          <div style={{
            filter: 'drop-shadow(0 0 80px rgba(66, 181, 255, 0.25))',
            position: 'relative'
          }}>
            <section style={{
              position: 'relative',
              background: '#000000',
              border: '2px solid #D4AF37',
              borderRadius: '20px',
              padding: '36px 32px',
              boxShadow: '0 0 60px rgba(66, 181, 255, 0.3), 0 20px 80px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(66, 181, 255, 0.2), inset 0 -1px 0 rgba(212, 175, 55, 0.3)',
              overflow: 'hidden'
            }}>
              {/* Blue glow line at top */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(66, 181, 255, 0.6) 25%, rgba(66, 181, 255, 0.8) 50%, rgba(66, 181, 255, 0.6) 75%, transparent 100%)',
                opacity: 0.8
              }} />

              {/* Blue corner accent - top right */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '160px',
                height: '160px',
                background: 'radial-gradient(circle at top right, #42B5FF 0%, transparent 65%)',
                opacity: 0.2,
                pointerEvents: 'none'
              }} />

              {/* Blue corner accent - bottom left */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle at bottom left, #42B5FF 0%, transparent 70%)',
                opacity: 0.15,
                pointerEvents: 'none'
              }} />

              {/* Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontWeight: '700',
                  color: '#D4AF37'
                }}>
                  Founder Insight
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(212, 175, 55, 0.5)' }}>•</span>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#42B5FF'
                }}>
                  Cultural Intelligence
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                fontWeight: '700',
                marginBottom: '18px',
                color: '#FFFFFF',
                lineHeight: '1.3',
                position: 'relative',
                zIndex: 1
              }}>
                Founder Insight #1: The Devil&apos;s Dismissive Argument
                <span style={{ fontSize: '0.7rem', verticalAlign: 'super' }}>™</span>
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                color: '#FFFFFF',
                marginBottom: '24px',
                lineHeight: '1.7',
                position: 'relative',
                zIndex: 1
              }}>
                A powerful breakdown of a modern deception that erases accountability and distorts truth — 
                especially in families and especially for children. This Insight teaches how to recognize it, 
                name it, and break its influence.
              </p>

              {/* CTA Button */}
              <a
                href="/insights/devils-dismissive-argument"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#000000',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #BF9B30 100%)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.5), 0 0 30px rgba(66, 181, 255, 0.3)',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(212, 175, 55, 0.6), 0 0 40px rgba(66, 181, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.5), 0 0 30px rgba(66, 181, 255, 0.3)';
                }}
              >
                <span>Read the Full Insight</span>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              {/* Bottom attribution */}
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(66, 181, 255, 0.25)',
                position: 'relative',
                zIndex: 1
              }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  by <span style={{ fontWeight: '600', color: '#D4AF37' }}>Raymond Al Zedeck</span> · Founder of BANIBS
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Reassurance - STEALTH A+ */}
      <div style={{
        padding: '80px 20px 60px',
        background: colors.bgDeep,
        textAlign: 'center',
        borderTop: `1px solid ${colors.skyBlueSoft}`
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{
            fontSize: '1.3rem',
            color: colors.textMain,
            marginBottom: '24px',
            fontWeight: '600',
            lineHeight: '1.6'
          }}>
            We're building steadily and thoughtfully, with long-term trust at the center.
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: colors.textMuted,
            lineHeight: '1.6'
          }}>
            Stay close—we'll share updates as they come.
          </p>
        </div>
      </div>

      {/* Footer - STEALTH A+ */}
      <div style={{
        padding: '40px 20px',
        borderTop: `1px solid ${colors.skyBlueSoft}`,
        textAlign: 'center',
        background: colors.bgDeep
      }}>
        <p style={{
          fontSize: '0.85rem',
          color: colors.textMuted,
          lineHeight: '1.6'
        }}>
          Built with love, intention, and deep respect for those who choose to be here.
        </p>
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
        
        input:focus-visible,
        button:focus-visible {
          outline: 2px solid #42B5FF !important;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// Pillar Card Component
const PillarCard = ({ icon, title, body, bullets, subNote }) => {
  const colors = {
    bgCard: '#090D16',
    gold: '#FFD700',
    skyBlueSoft: 'rgba(66, 181, 255, 0.2)',
    textMain: '#F9FAFB',
    textMuted: '#9CA3AF'
  };
  
  return (
  <div style={{
    background: colors.bgCard,
    border: `1px solid ${colors.skyBlueSoft}`,
    borderRadius: '16px',
    padding: '36px 28px',
    transition: 'all 0.4s ease',
    cursor: 'default'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = colors.bgCard;
    e.currentTarget.style.border = `1px solid ${colors.gold}`;
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = `0 0 25px rgba(255, 215, 0, 0.2)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = colors.bgCard;
    e.currentTarget.style.border = `1px solid ${colors.skyBlueSoft}`;
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    <div style={{ marginBottom: '20px' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '1.35rem',
      fontWeight: '700',
      marginBottom: '16px',
      color: colors.gold,
      lineHeight: '1.3'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '1rem',
      lineHeight: '1.7',
      color: colors.textMain,
      marginBottom: bullets ? '20px' : '0'
    }}>
      {body}
    </p>
    {bullets && (
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: '0 0 16px 0'
      }}>
        {bullets.map((bullet, i) => (
          <li key={i} style={{
            marginBottom: '10px',
            paddingLeft: '20px',
            position: 'relative',
            fontSize: '0.95rem',
            color: colors.textMuted
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              color: colors.gold,
              fontWeight: 'bold'
            }}>•</span>
            {bullet}
          </li>
        ))}
      </ul>
    )}
    {subNote && (
      <p style={{
        fontSize: '0.9rem',
        color: colors.textMuted,
        lineHeight: '1.6',
        marginTop: '16px',
        fontStyle: 'italic'
      }}>
        {subNote}
      </p>
    )}
  </div>
  );
};

// Phase Item Component
const PhaseItem = ({ number, title, description }) => {
  const colors = {
    skyBlue: '#42B5FF',
    skyBlueSoft: 'rgba(66, 181, 255, 0.2)',
    textMain: '#F9FAFB'
  };
  
  return (
  <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'start'
  }}>
    <div style={{
      minWidth: '48px',
      height: '48px',
      borderRadius: '50%',
      background: colors.skyBlueSoft,
      border: `2px solid ${colors.skyBlue}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      fontWeight: '700',
      color: colors.skyBlue
    }}>
      {number}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '10px',
        color: colors.skyBlue
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '1rem',
        lineHeight: '1.7',
        color: colors.textMain
      }}>
        {description}
      </p>
    </div>
  </div>
  );
};

export default ComingSoonPage;
