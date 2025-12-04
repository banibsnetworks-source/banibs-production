import React from 'react';
import { Sparkles, Clock, Globe } from 'lucide-react';

/**
 * BANIBS Coming Soon / Early Access Page
 * Shown when COMING_SOON_MODE is enabled
 */
const ComingSoonPage = () => {
  return (
    <div className="coming-soon-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        color: 'white'
      }}>
        {/* Logo Section */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5A1 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            letterSpacing: '2px'
          }}>
            BANIBS
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '300',
            letterSpacing: '1px'
          }}>
            Black America News, Information & Business System
          </p>
        </div>

        {/* Icon Grid */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '48px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={40} color="#D4AF37" />
          </div>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Globe size={40} color="#D4AF37" />
          </div>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={40} color="#D4AF37" />
          </div>
        </div>

        {/* Main Message */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'white'
          }}>
            Systems in Early Access
          </h2>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '0'
          }}>
            BANIBS is in early access. Systems are online, but we are currently 
            tuning the news engine and core experience. Thank you for your patience 
            as we prepare the full public launch.
          </p>
        </div>

        {/* Status Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(16, 185, 129, 1)',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              ✅ Backend Systems
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Operational
            </div>
          </div>
          
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(251, 191, 36, 1)',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              🔧 News Engine
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Tuning
            </div>
          </div>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(59, 130, 246, 1)',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              🚀 Full Launch
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Coming Soon
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem',
          letterSpacing: '1px'
        }}>
          Peace • Love • Honor • Respect
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
