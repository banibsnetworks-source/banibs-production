import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Check, X, Eye, Code } from 'lucide-react';
import BanibsNavV2 from '../../components/navigation/BanibsNavV2';
import SEO from '../../components/SEO';

/**
 * Navigation V2 Preview Page
 * 
 * Allows Founder to review new navigation before approval
 * Side-by-side comparison with current nav
 */
const NavV2Preview = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showComparison, setShowComparison] = useState(false);
  
  return (
    <>
      <SEO
        title="Navigation V2 Preview - Founder Control"
        description="Preview and approve BANIBS Navigation V2.0"
      />
      
      {/* Show Navigation V2 */}
      <BanibsNavV2 />
      
      {/* Preview Control Panel */}
      <div style={{
        minHeight: 'calc(100vh - 68px)',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        padding: '32px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(200,168,87,0.2)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#111217',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Eye size={28} style={{ color: '#C8A857' }} />
                  Navigation V2.0 Preview
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? '#B3B3C2' : '#6B7280'
                }}>
                  Review the new black-glass navigation design before deployment
                </p>
              </div>
              
              <button
                onClick={() => navigate('/founder/command')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#1F2937',
                  backgroundColor: 'transparent',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C8A857';
                  e.currentTarget.style.color = '#C8A857';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = isDark ? '#F7F7F7' : '#1F2937';
                }}
              >
                <ArrowLeft size={16} />
                Return to Control Center
              </button>
            </div>
            
            {/* Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#F59E0B'
            }}>
              <Code size={14} />
              PREVIEW MODE - Not Live
            </div>
          </div>
          
          {/* Features Checklist */}
          <div style={{
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDark ? '#F7F7F7' : '#111217',
              marginBottom: '20px'
            }}>
              ✨ V2.0 Features Implemented
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {[
                { label: 'Black-glass aesthetic with blur', status: true },
                { label: 'Gold active indicators', status: true },
                { label: 'Segmented icon + text items', status: true },
                { label: 'Perfect theme switching', status: true },
                { label: 'Improved profile dropdown', status: true },
                { label: 'Smooth hover transitions', status: true },
                { label: 'Proper spacing & alignment', status: true },
                { label: 'Mobile responsive (partial)', status: 'partial' }
              ].map((feature, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px'
                }}>
                  {feature.status === true ? (
                    <Check size={18} style={{ color: '#10B981' }} />
                  ) : feature.status === 'partial' ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#FFF',
                      fontWeight: '700'
                    }}>!</div>
                  ) : (
                    <X size={18} style={{ color: '#EF4444' }} />
                  )}
                  <span style={{
                    fontSize: '14px',
                    color: isDark ? '#E5E7EB' : '#374151'
                  }}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Design Specs */}
          <div style={{
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDark ? '#F7F7F7' : '#111217',
              marginBottom: '20px'
            }}>
              📐 Technical Specifications
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: '4px'
                }}>
                  Height
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#111217'
                }}>
                  68px
                </p>
              </div>
              
              <div>
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: '4px'
                }}>
                  Background (Dark)
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#111217',
                  fontFamily: 'monospace'
                }}>
                  rgba(0,0,0,0.85)
                </p>
              </div>
              
              <div>
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: '4px'
                }}>
                  Backdrop Blur
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#111217'
                }}>
                  12px
                </p>
              </div>
              
              <div>
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: '4px'
                }}>
                  Gold Accent
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#C8A857',
                  fontFamily: 'monospace'
                }}>
                  #C8A857
                </p>
              </div>
            </div>
          </div>
          
          {/* Approval Actions */}
          <div style={{
            padding: '32px',
            backgroundColor: isDark ? '#161616' : '#FFFFFF',
            border: `2px solid ${isDark ? 'rgba(200,168,87,0.3)' : 'rgba(200,168,87,0.2)'}`,
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: isDark ? '#F7F7F7' : '#111217',
              marginBottom: '12px'
            }}>
              Ready to Deploy?
            </h2>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#B3B3C2' : '#6B7280',
              marginBottom: '24px',
              maxWidth: '600px',
              margin: '0 auto 24px'
            }}>
              Once approved, this navigation will replace the current GlobalNavBar across the entire BANIBS app. 
              This action requires manual deployment by the development team.
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => alert('Approval noted! Manual deployment required by development team to replace GlobalNavBar with BanibsNavV2.')}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#000000',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <Check size={20} />
                Approve & Request Deployment
              </button>
              
              <button
                onClick={() => navigate('/founder/command')}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? '#F7F7F7' : '#1F2937',
                  backgroundColor: 'transparent',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = isDark ? '#F7F7F7' : '#1F2937';
                }}
              >
                <X size={20} />
                Cancel / Keep Current Nav
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavV2Preview;
