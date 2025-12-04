import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, Heart, Store, Shield, Users, Share2,
  TrendingUp, CheckCircle, BookOpen, Package, Home,
  Sparkles, ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Marketplace Landing Page (A7)
 * Public-facing commercial pillar - premium, dignified, warm
 */
const MarketplaceLandingPage = () => {
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

  // Variant-aware styling
  const getStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          bgPrimary: 'linear-gradient(180deg, #0B0B0B 0%, #1A1A1A 100%)',
          bgSecondary: '#1A1A1A',
          bgTertiary: '#0B0B0B',
          textPrimary: '#FFFFFF',
          textSecondary: 'rgba(255, 255, 255, 0.85)',
          accent: '#C49A3A',
          accentGradient: 'linear-gradient(135deg, #C49A3A 0%, #D4AF37 100%)',
          cardBg: 'rgba(255, 255, 255, 0.04)',
          cardBorder: 'rgba(196, 154, 58, 0.3)',
          buttonPrimary: 'linear-gradient(135deg, #C49A3A 0%, #D4AF37 100%)',
          buttonPrimaryText: '#000000',
        };
      case 'blue':
        return {
          bgPrimary: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)',
          bgSecondary: '#FFFFFF',
          bgTertiary: 'rgba(188, 227, 255, 0.2)',
          textPrimary: '#1A3A52',
          textSecondary: '#2A4A62',
          accent: '#87bce9',
          accentGradient: 'linear-gradient(135deg, #87bce9 0%, #5A8FBD 100%)',
          cardBg: 'rgba(255, 255, 255, 0.9)',
          cardBorder: 'rgba(135, 188, 233, 0.4)',
          buttonPrimary: 'linear-gradient(135deg, #87bce9 0%, #5A8FBD 100%)',
          buttonPrimaryText: '#FFFFFF',
        };
      case 'gold':
      default:
        return {
          bgPrimary: 'linear-gradient(180deg, #F7F0E3 0%, #FFFEF8 100%)',
          bgSecondary: '#FFFEF8',
          bgTertiary: 'rgba(247, 240, 227, 0.4)',
          textPrimary: '#2A2A2A',
          textSecondary: '#3A3A3A',
          accent: '#D9B77A',
          accentGradient: 'linear-gradient(135deg, #D9B77A 0%, #B89968 100%)',
          cardBg: 'rgba(255, 255, 255, 0.85)',
          cardBorder: 'rgba(217, 183, 122, 0.4)',
          buttonPrimary: 'linear-gradient(135deg, #D9B77A 0%, #B89968 100%)',
          buttonPrimaryText: '#1A1A1A',
        };
    }
  };

  const styles = getStyles();

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: 'How do I open a store?',
      answer: 'Visit the Seller Dashboard and follow the guided setup process. It takes just a few minutes.'
    },
    {
      question: 'What types of products are approved?',
      answer: 'We support a wide range of products including fashion, art, books, wellness items, digital goods, and services that align with community standards.'
    },
    {
      question: 'Is there a fee to sell?',
      answer: 'Basic seller accounts are free. Transaction fees are transparent and competitive.'
    },
    {
      question: 'How do payments work?',
      answer: 'We use secure payment processing with direct deposits to your account. All transactions are protected.'
    },
    {
      question: 'Can I sell digital goods?',
      answer: 'Yes! Digital products like e-books, courses, music, and art are fully supported.'
    },
    {
      question: 'How do I handle refunds or disputes?',
      answer: 'Our platform provides clear dispute resolution guidelines and support for both buyers and sellers.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: styles.bgPrimary,
      color: styles.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '120px 20px 100px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '900px',
          background: `radial-gradient(circle, ${styles.accent}35 0%, transparent 70%)`,
          filter: 'blur(120px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '32px',
            background: variant === 'gold' 
              ? `linear-gradient(135deg, ${styles.accent} 0%, ${styles.textPrimary} 50%, ${styles.accent} 100%)`
              : styles.textPrimary,
            WebkitBackgroundClip: variant === 'gold' ? 'text' : 'initial',
            WebkitTextFillColor: variant === 'gold' ? 'transparent' : 'initial',
            backgroundClip: variant === 'gold' ? 'text' : 'initial'
          }}>
            BANIBS Marketplace
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            lineHeight: '1.6',
            marginBottom: '28px',
            fontWeight: '600',
            color: styles.accent
          }}>
            A trusted place to buy, sell, support, and build - together.
          </p>
          
          <div style={{
            background: styles.cardBg,
            border: `2px solid ${styles.cardBorder}`,
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: `0 4px 20px ${styles.accent}15`,
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '1.15rem',
              lineHeight: '1.8',
              color: styles.textSecondary,
              marginBottom: '20px'
            }}>
              Discover Black-owned businesses, creators, and community vendors in a calm, beautiful marketplace designed for dignity, opportunity, and economic growth.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: styles.textSecondary
            }}>
              BANIBS Marketplace is built to circulate dollars, uplift entrepreneurs, and create long-term pathways for wealth within our communities. Whether you're shopping, selling, or simply exploring, this space was designed with care.
            </p>
          </div>
        </div>
      </div>

      {/* What is BANIBS Marketplace? */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '48px',
            color: styles.accent
          }}>
            What is BANIBS Marketplace?
          </h2>
          
          <div style={{
            width: '80px',
            height: '3px',
            background: styles.accent,
            margin: '0 auto 48px',
            borderRadius: '2px'
          }} />
          
          <div style={{
            fontSize: '1.15rem',
            lineHeight: '2',
            color: styles.textSecondary,
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '28px' }}>
              BANIBS Marketplace is a curated ecosystem of Black-owned businesses, creators, shops, brands, and community vendors brought into one calm, unified platform.
            </p>
            <p style={{ marginBottom: '28px' }}>
              Here, you won't get lost in noise or overwhelmed by algorithms. We highlight quality, craft, authenticity, and trust.
            </p>
            <p>
              From handmade goods to digital products, services, and essentials - this is your digital aisle to discover something meaningful.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid - What You Can Do Here */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            What You Can Do Here
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {[
              {
                icon: ShoppingBag,
                title: 'Shop Black-Owned Businesses',
                description: 'Browse premium products, essentials, and everyday goods from trusted sellers.'
              },
              {
                icon: Heart,
                title: 'Support Local Creators',
                description: 'Art, culture, fashion, books, music, food - creators finally have a real home.'
              },
              {
                icon: Store,
                title: 'Promote Your Own Business',
                description: 'Open a seller storefront with easy setup, clean design, and automated management tools.'
              },
              {
                icon: Shield,
                title: 'Safe, Transparent Transactions',
                description: 'No hidden fees, no shady practices - everything is clear, fair, and protected.'
              },
              {
                icon: Users,
                title: 'Community Recommendations',
                description: 'See what others in your city and community are loving and supporting.'
              },
              {
                icon: Share2,
                title: 'Marketplace + Social Integration',
                description: 'Follow sellers, bookmark items, share products, and circulate wealth inside your circle.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 28px',
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
                  lineHeight: '1.7',
                  color: styles.textSecondary
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '48px',
            textAlign: 'center',
            color: styles.accent
          }}>
            It's Simple to Get Started
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
                title: 'Explore',
                description: 'Browse categories like fashion, wellness, books, home goods, tech accessories, and more.'
              },
              {
                step: '2',
                title: 'Support',
                description: 'Choose businesses you believe in. Every purchase fuels the community.'
              },
              {
                step: '3',
                title: 'Share',
                description: 'Post items inside your circles or home feed. Help businesses get discovered.'
              },
              {
                step: '4',
                title: 'Build',
                description: 'Open your own store and become part of the growing BANIBS economic ecosystem.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                marginBottom: i < 3 ? '32px' : '0',
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
                  color: variant === 'dark' ? '#000' : '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}>
                  {item.step}
                </div>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: styles.textPrimary
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: styles.textSecondary
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            Featured Categories
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px'
          }}>
            {[
              {
                icon: ShoppingBag,
                title: 'Fashion & Apparel',
                description: 'Modern, traditional, and handcrafted pieces that reflect our culture.'
              },
              {
                icon: BookOpen,
                title: 'Books & Learning',
                description: 'Authors, educators, independent publishers, and cultural storytelling.'
              },
              {
                icon: Home,
                title: 'Home & Wellness',
                description: 'Natural products, soaps, oils, candles, grooming, and holistic goods.'
              }
            ].map((category, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '32px 28px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${styles.accent}10`
              }}>
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: `${styles.accent}15`,
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <category.icon size={56} color={styles.accent} />
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: styles.textPrimary
                }}>
                  {category.title}
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: styles.textSecondary,
                  marginBottom: '20px'
                }}>
                  {category.description}
                </p>
                <button style={{
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: 'transparent',
                  color: styles.accent,
                  border: `2px solid ${styles.cardBorder}`,
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}>
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Business Owners */}
      <div style={{ padding: '80px 20px', background: styles.bgSecondary }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '24px',
            color: styles.accent
          }}>
            For Entrepreneurs, Creators & Business Owners
          </h2>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.7',
            color: styles.textSecondary,
            marginBottom: '56px',
            maxWidth: '800px',
            margin: '0 auto 56px'
          }}>
            BANIBS Marketplace gives you a calm, modern storefront with instant visibility inside a community that supports you.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '28px',
            marginBottom: '48px'
          }}>
            {[
              { icon: TrendingUp, title: 'Easy Setup', description: 'Create your store in minutes' },
              { icon: Sparkles, title: 'No Overwhelm', description: 'Clean design & guided setup' },
              { icon: Users, title: 'Community Visibility', description: 'Featured for local and regional shoppers' },
              { icon: CheckCircle, title: 'Integrated Payments', description: 'Safe, simple transactions' }
            ].map((benefit, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 12px ${styles.accent}08`
              }}>
                <benefit.icon size={36} color={styles.accent} style={{ marginBottom: '16px' }} />
                <h4 style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: styles.textPrimary
                }}>
                  {benefit.title}
                </h4>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  color: styles.textSecondary
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                padding: '18px 40px',
                fontSize: '1.15rem',
                fontWeight: '700',
                background: styles.buttonPrimary,
                color: styles.buttonPrimaryText,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${styles.accent}30`
              }}
            >
              Become a Seller
            </button>
            <button
              style={{
                padding: '18px 40px',
                fontSize: '1.15rem',
                fontWeight: '700',
                background: 'transparent',
                color: styles.textPrimary,
                border: `3px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Safety & Trust */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            color: styles.accent
          }}>
            A Safe Environment for Buyers & Sellers
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { icon: CheckCircle, title: 'Verified Sellers', description: 'Identity and listing checks' },
              { icon: Package, title: 'Clear Fees', description: 'No confusion or hidden charges' },
              { icon: Shield, title: 'Protected Payments', description: 'Secure transactions' },
              { icon: HelpCircle, title: 'Return & Dispute Guidance', description: 'Transparent support' },
              { icon: Heart, title: 'Respectful Community', description: 'Cultural and behavioral guidelines' }
            ].map((trust, i) => (
              <div key={i} style={{
                background: styles.cardBg,
                border: `2px solid ${styles.cardBorder}`,
                borderRadius: '12px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: `0 4px 12px ${styles.accent}08`
              }}>
                <trust.icon size={32} color={styles.accent} style={{ marginBottom: '16px' }} />
                <h4 style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: styles.textPrimary
                }}>
                  {trust.title}
                </h4>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  color: styles.textSecondary
                }}>
                  {trust.description}
                </p>
              </div>
            ))}
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

      {/* Support Section */}
      <div style={{ padding: '80px 20px', background: styles.bgTertiary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: '700',
            marginBottom: '24px',
            textAlign: 'center',
            color: styles.accent
          }}>
            We're here to help you succeed.
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginTop: '48px'
          }}>
            {[
              { icon: BookOpen, text: 'Seller Setup Guide' },
              { icon: Shield, text: 'Marketplace Policies' },
              { icon: HelpCircle, text: 'Customer Support' },
              { icon: Users, text: 'Community Standards' },
              { icon: Shield, text: 'Safety & Privacy Center' }
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

export default MarketplaceLandingPage;
