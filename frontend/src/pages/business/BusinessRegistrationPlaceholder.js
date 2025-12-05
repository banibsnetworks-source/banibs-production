import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';

/**
 * Business Registration Placeholder - Phase B.0 Hotfix
 * Temporary landing page for "List Your Business" flow
 * Shows clear messaging until full registration system is implemented
 */
const BusinessRegistrationPlaceholder = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <FullWidthLayout>
      <SEO
        title="Business Registration - BANIBS"
        description="Register your Black-owned business on BANIBS"
      />
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #C8A857 0%, #8A6F43 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={40} color="#000000" />
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: '600',
            marginBottom: '16px',
            color: isDark ? '#F7F7F7' : '#111217'
          }}>
            Business Registration Coming Online
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '18px',
            color: isDark ? '#B3B3C2' : '#4A4B57',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            We're finalizing our business registration and verification system to ensure 
            the highest quality experience for Black-owned businesses on BANIBS.
          </p>

          {/* What to Expect Section */}
          <div style={{
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              color: isDark ? '#F7F7F7' : '#111217'
            }}>
              What to Expect
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} style={{ color: '#C8A857', flexShrink: 0, marginTop: '2px' }} />
                <span style={{
                  fontSize: '16px',
                  color: isDark ? '#B3B3C2' : '#4A4B57',
                  lineHeight: '1.5'
                }}>
                  Quick business profile setup (name, location, category)
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} style={{ color: '#C8A857', flexShrink: 0, marginTop: '2px' }} />
                <span style={{
                  fontSize: '16px',
                  color: isDark ? '#B3B3C2' : '#4A4B57',
                  lineHeight: '1.5'
                }}>
                  Verification process for Black-owned business certification
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} style={{ color: '#C8A857', flexShrink: 0, marginTop: '2px' }} />
                <span style={{
                  fontSize: '16px',
                  color: isDark ? '#B3B3C2' : '#4A4B57',
                  lineHeight: '1.5'
                }}>
                  Access to business dashboard and analytics
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} style={{ color: '#C8A857', flexShrink: 0, marginTop: '2px' }} />
                <span style={{
                  fontSize: '16px',
                  color: isDark ? '#B3B3C2' : '#4A4B57',
                  lineHeight: '1.5'
                }}>
                  Priority listing in search results
                </span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `2px solid #C8A857`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#C8A857',
              marginBottom: '12px'
            }}>
              Want to be notified when registration opens?
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#B3B3C2' : '#4A4B57',
              marginBottom: '16px'
            }}>
              Contact us at <a href="mailto:business@banibs.com" style={{ color: '#C8A857', textDecoration: 'none' }}>business@banibs.com</a> to 
              get priority access when we launch.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/business-directory')}
            style={{
              backgroundColor: 'transparent',
              color: '#C8A857',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '2px solid #C8A857',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(200, 168, 87, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={20} />
            Back to Business Directory
          </button>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default BusinessRegistrationPlaceholder;
