import React, { useState } from 'react';
import { Shield, Users, Store } from 'lucide-react';

/**
 * BANIBS Coming Soon Page - v2.0 (FINAL)
 * Ad-Free. Encrypted. Built For Us.
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
        const existing = JSON.parse(localStorage.getItem('banibs_early_access') || '[]');
        existing.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('banibs_early_access', JSON.stringify(existing));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting email:', error);
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
        background: 'transparent'
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
          {/* Status Badge */}
          <div style={{
            display: 'inline-block',
            fontSize: '0.85rem',
            letterSpacing: '1.5px',
            color: colors.skyBlue,
            marginBottom: '32px',
            fontWeight: '600',
            textTransform: 'uppercase',
            padding: '8px 20px',
            border: `1px solid ${colors.skyBlueSoft}`,
            borderRadius: '24px',
            background: `rgba(66, 181, 255, 0.08)`
          }}>
            BANIBS is in motion again
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '28px',
            color: colors.textMain,
            letterSpacing: '-1px'
          }}>
            Ad-Free. Encrypted.<br />Built For Us.
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: '1.7',
            color: colors.textMain,
            marginBottom: '48px',
            fontWeight: '400'
          }}>
            BANIBS is a Black-built digital home for our people and our businesses — a social space, 
            business hub, and marketplace designed so you're not the product.
          </p>

          {/* Email Capture */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                background: colors.bgCard,
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
                
                {/* Reassurance text */}
                <p style={{
                  marginTop: '16px',
                  fontSize: '0.85rem',
                  color: colors.textMuted,
                  lineHeight: '1.5'
                }}>
                  No spam. No selling your email. We'll only reach out when there's a real update.
                </p>
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
                We'll let you know when the doors open.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Three Pillars Section */}
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
          {/* Card 1: For Our People */}
          <PillarCard
            icon={<Users size={36} color="#FFD700" strokeWidth={2} />}
            title="For Our People"
            body="A social space that puts us first — built so you can connect, organize, and share without being chased by ads or buried by somebody else's algorithm."
            bullets={[
              'No ads in your face',
              'No \"engagement hacks\" deciding who you see',
              'Circles and spaces you control'
            ]}
          />

          {/* Card 2: For Black Businesses */}
          <PillarCard
            icon={<Store size={36} color="#FFD700" strokeWidth={2} />}
            title="For Black Businesses"
            body="BANIBS is building a place where Black businesses can be discovered, supported, and protected — without paying just to be seen."
            bullets={[
              'A directory built around us, not against us',
              'Tools to reach customers who actually want to find you',
              'Room to grow as the network grows'
            ]}
          />

          {/* Card 3: Protection & Integrity */}
          <PillarCard
            icon={<Shield size={36} color="#FFD700" strokeWidth={2} />}
            title="Protection & Integrity"
            body="From day one, BANIBS is being built with encryption, clear rules, and our own Protection Suite so we don't have to play by the usual 'harvest everything' playbook."
            subNote="Our Truth & Integrity Engine (TIES) helps us catch questionable claims and keep our messaging honest and grounded as we grow."
          />
        </div>
      </div>

      {/* What's Coming First Section */}
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
            What's coming first
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <PhaseItem
              number="1"
              title="Social Circles"
              description="Private circles and feeds designed for our people to connect without ad-chasing or surveillance tricks."
            />
            <PhaseItem
              number="2"
              title="Business Directory & Marketplace Opening Phase"
              description="A focused early directory and marketplace opening phase — we'll start small, invite businesses in, and grow inventory as the community grows."
            />
            <PhaseItem
              number="3"
              title="BANIBS NEXA"
              description="The NEXA browser and tools that move more of our digital life into spaces we control, step by step."
            />
          </div>
        </div>
      </div>

      {/* Bottom Reassurance */}
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
            We're building carefully so we don't have to walk anything back.
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: colors.textMuted,
            lineHeight: '1.6'
          }}>
            If you want to be there when the doors open, drop your email above and stay close.
          </p>
        </div>
      </div>

      {/* Footer */}
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
          Built with love, caution, and respect for our people's trust.
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
const PhaseItem = ({ number, title, description }) => (
  <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'start'
  }}>
    <div style={{
      minWidth: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'rgba(255, 215, 0, 0.1)',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#FFD700'
    }}>
      {number}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '10px',
        color: '#FFD700'
      }}>
        Phase {number} — {title}
      </h3>
      <p style={{
        fontSize: '1rem',
        lineHeight: '1.7',
        color: 'rgba(255, 255, 255, 0.85)'
      }}>
        {description}
      </p>
    </div>
  </div>
);

export default ComingSoonPage;
