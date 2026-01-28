import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, MessageCircle, Heart, Shield,
  ChevronDown, ChevronUp, BookOpen, HelpCircle
} from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Social Landing Page (A6)
 * The front door to BANIBS Social - warm, welcoming, dignified
 */
const SocialLandingPage = () => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState('gold');
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  // Variant-aware styling - Using dark theme as default for brand consistency
  const getStyles = () => {
    // Force dark theme for captivating, brand-consistent look
    return {
      bgPrimary: 'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
      bgSecondary: '#0E0E14',
      bgTertiary: '#16161F',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      accent: '#C5A059',  // BANIBS gold
      accentLight: '#D4B068',
      accentGradient: 'linear-gradient(135deg, #C5A059 0%, #D4B068 50%, #C5A059 100%)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
      cardBorder: 'rgba(197, 160, 89, 0.25)',
      buttonPrimary: 'linear-gradient(135deg, #C5A059 0%, #D4B068 100%)',
      buttonPrimaryText: '#0A0A0F',
      buttonSecondaryBorder: '#C5A059',
      buttonSecondaryText: '#C5A059',
    };
  };

  const styles = getStyles();

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: 'Is BANIBS free?',
      answer: 'Yes. BANIBS Social is free to join and use.'
    },
    {
      question: 'Who can join?',
      answer: 'Anyone who aligns with our values of peace, dignity, and community.'
    },
    {
      question: 'How is BANIBS different?',
      answer: 'No chaos, no harassment, no algorithmic pressure. Just calm, culture-centered connection.'
    },
    {
      question: 'Can I delete my account anytime?',
      answer: 'Yes. You always have control over your data.'
    },
    {
      question: 'How do I report problems?',
      answer: 'Use the in-app support tools or visit the BANIBS Support Center.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: styles.bgPrimary,
      color: styles.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif'
    }}>
      {/* Global Navigation Bar */}
      <GlobalNavBar />
      
      {/* Hero Section */}
      <div style={{
        padding: '100px 20px 80px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '100%',
          background: `radial-gradient(ellipse at 30% 20%, rgba(197, 160, 89, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 60%, rgba(197, 160, 89, 0.1) 0%, transparent 40%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.15',
            marginBottom: '28px',
            background: `linear-gradient(135deg, #FFFFFF 0%, ${styles.accent} 50%, #FFFFFF 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to BANIBS Social
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.6',
            marginBottom: '24px',
            fontWeight: '500',
            color: styles.accent
          }}>
            A calm, beautiful space to connect, share, grow, and belong.
          </p>
          
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: styles.textSecondary,
            fontWeight: '400',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Your digital community home — built to uplift, empower, and center our people with dignity, peace, and purpose.
          </p>
        </div>
      </div>

      {/* What is BANIBS Social? */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '48px',
            color: styles.accent
          }}>
            What is BANIBS Social?
          </h2>
          
          <div style={{
            fontSize: '1.15rem',
            lineHeight: '2',
            color: styles.textSecondary,
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '28px' }}>
              BANIBS Social is a welcoming, dignified digital home for our community - built for safety, belonging, and honest connection.
            </p>
            <p style={{ marginBottom: '28px' }}>
              There is no pressure here. You can move at your own pace. Share your voice, uplift others, and enjoy a calmer alternative to mainstream social platforms.
            </p>
            <p>
              Our design puts peace first. No chaos. No noise. Just a beautiful space to grow.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works - 4 Feature Cards */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            How BANIBS Social Works
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
            gap: '28px'
          }}>
            {[
              {
                icon: Users,
                title: 'Create Your Circle',
                description: 'Build your community through trust and real connections.'
              },
              {
                icon: MessageCircle,
                title: 'Share Your Voice',
                description: 'Post thoughts, images, moments - at your pace.'
              },
              {
                icon: Heart,
                title: 'Stay In The Loop',
                description: 'See updates from people you care about.'
              },
              {
                icon: Shield,
                title: 'Build Safely',
                description: 'BANIBS protects your experience with community-first design.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${styles.accent}10`
              }}>
                <feature.icon size={40} color={styles.accent} style={{ marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: styles.textPrimary
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: styles.textSecondary
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New User Welcome Steps */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '48px',
            textAlign: 'center',
            color: styles.accent
          }}>
            First time here? Let's get you settled.
          </h2>
          
          <div style={{
            background: styles.cardBg,
            border: `2px solid ${styles.cardBorder}`,
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: `0 6px 24px ${styles.accent}12`
          }}>
            {[
              {
                step: '1',
                title: 'Create your account',
                description: 'Just your name, email, and password - fast and simple.'
              },
              {
                step: '2',
                title: 'Build your profile',
                description: 'Add a photo, a short intro, or skip and come back later.'
              },
              {
                step: '3',
                title: 'Find your circles',
                description: 'Family, friends, communities, interests - start with what matters to you.'
              },
              {
                step: '4',
                title: 'Explore the calm home feed',
                description: 'Curated updates designed to keep you informed, not overwhelmed.'
              },
              {
                step: '5',
                title: 'Need help?',
                description: 'Visit Help Center, Safety Guide, or New User Tips.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                marginBottom: i < 4 ? '32px' : '0',
                paddingLeft: '52px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: styles.accentGradient,
                  color: '#0A0A0F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}>
                  {item.step}
                </div>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: styles.textPrimary
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: styles.textSecondary
                }}>
                  {item.description}
                </p>
              </div>
            ))}
            
            <p style={{
              fontSize: '1rem',
              marginTop: '32px',
              textAlign: 'center',
              color: styles.accent,
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              You can take your time. BANIBS grows with you.
            </p>
          </div>
        </div>
      </div>

      {/* Sign In / Create Account CTA */}
      <div style={{
        padding: '80px 20px',
        background: styles.bgTertiary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: styles.cardBg,
            border: `3px solid ${styles.cardBorder}`,
            borderRadius: '20px',
            padding: '48px 40px',
            boxShadow: `0 8px 32px ${styles.accent}20`
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '32px',
              color: styles.textPrimary
            }}>
              Ready to join?
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => navigate('/auth/signin')}
                style={{
                  width: '100%',
                  padding: '18px 40px',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  background: styles.buttonPrimary,
                  color: styles.buttonPrimaryText,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px ${styles.accent}30`,
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Sign In
              </button>
              
              <button
                onClick={() => navigate('/auth/register')}
                style={{
                  width: '100%',
                  padding: '18px 40px',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  background: 'transparent',
                  color: styles.buttonSecondaryText,
                  border: `3px solid ${styles.buttonSecondaryBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Create Account
              </button>
            </div>
            
            <p style={{
              fontSize: '0.95rem',
              color: styles.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              Safe, private, and designed for our community's peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Mini FAQ */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '48px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqItems.map((item, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: `0 2px 8px ${styles.accent}08`
              }}>
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: styles.textPrimary,
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                >
                  {item.question}
                  {expandedFaq === i ? (
                    <ChevronUp size={20} color={styles.accent} />
                  ) : (
                    <ChevronDown size={20} color={styles.accent} />
                  )}
                </button>
                {expandedFaq === i && (
                  <div style={{
                    padding: '0 24px 20px',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: styles.textSecondary
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help & Support Links */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '24px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Need help or have questions? We're here.
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginTop: '48px'
          }}>
            {[
              { icon: BookOpen, text: 'New User Guide' },
              { icon: Shield, text: 'Community Rules' },
              { icon: Shield, text: 'Safety & Privacy Center' },
              { icon: Shield, text: 'How BANIBS Protects You' },
              { icon: HelpCircle, text: 'Contact Support' }
            ].map((link, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '24px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: `0 2px 8px ${styles.accent}08`
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <link.icon size={28} color={styles.accent} style={{ marginBottom: '12px' }} />
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: styles.textPrimary
                }}>
                  {link.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 20px',
        background: styles.bgSecondary,
        textAlign: 'center',
        fontSize: '0.95rem',
        letterSpacing: '2px',
        fontWeight: '500',
        color: styles.textSecondary
      }}>
        Peace • Beauty • Dignity • Community
      </div>
    </div>
  );
};

export default SocialLandingPage;
