import React from 'react';
import { ArrowUpRight, Heart, Shield, Server } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalNavBar from '../../components/GlobalNavBar';

/**
 * BANIBS Support Page - Donations v1
 * Simple external link to Stripe Payment Link for operations support
 * No backend payment processing - just a clean donation entrypoint
 */

const STRIPE_DONATION_URL = 'https://buy.stripe.com/6oU00jaPqeMffyx0hk3sI00';

const SupportPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <GlobalNavBar />
      <div 
        className="min-h-screen"
        style={{
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)'
            : 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)'
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(197, 160, 89, 0.2) 0%, rgba(197, 160, 89, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(197, 160, 89, 0.3) 0%, rgba(197, 160, 89, 0.15) 100%)',
                border: '1px solid rgba(197, 160, 89, 0.3)'
              }}
            >
              <Heart 
                className="w-8 h-8" 
                style={{ color: '#C5A059' }}
              />
            </div>
            
            <h1 
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ 
                fontFamily: 'Playfair Display, serif',
                color: isDark ? '#ffffff' : '#1a1a1a'
              }}
            >
              Support BANIBS
            </h1>
            
            <p 
              className="text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              Your support helps us build and maintain the infrastructure that powers BANIBS.
            </p>
          </div>

          {/* What Your Support Covers */}
          <div 
            className="rounded-2xl p-8 mb-10"
            style={{
              background: isDark 
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              border: isDark 
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <h2 
              className="text-lg font-semibold mb-6"
              style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
            >
              What Your Support Covers
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(197, 160, 89, 0.15)' }}
                >
                  <Server className="w-5 h-5" style={{ color: '#C5A059' }} />
                </div>
                <div>
                  <h3 
                    className="font-medium mb-1"
                    style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
                  >
                    Infrastructure & Hosting
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    Servers, databases, and cloud services that keep BANIBS running 24/7.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(197, 160, 89, 0.15)' }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#C5A059' }} />
                </div>
                <div>
                  <h3 
                    className="font-medium mb-1"
                    style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
                  >
                    Security & Privacy
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    SSL certificates, security monitoring, and privacy-first architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donation CTA */}
          <div className="text-center">
            <a
              href={STRIPE_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="support-donate-btn"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #C5A059 0%, #A8864A 100%)',
                color: '#020408',
                boxShadow: '0 4px 24px rgba(197, 160, 89, 0.35)'
              }}
            >
              Support BANIBS
              <ArrowUpRight className="w-5 h-5" />
            </a>
            
            <p 
              className="text-sm mt-6"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            >
              Secure payment powered by Stripe
            </p>
          </div>

          {/* Footer Note */}
          <div 
            className="text-center mt-16 pt-8"
            style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
          >
            <p 
              className="text-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              Thank you for believing in what we&apos;re building.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;
