import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * PortalPlaceholder - Phase 11+ Infrastructure
 * 
 * Reusable placeholder component for upcoming portal modules.
 * Shows "Coming Soon" state with module info and subscription option.
 * 
 * This allows routes to exist before features are built, preventing 404s
 * and allowing us to track interest in upcoming features.
 */
const PortalPlaceholder = ({
  moduleName = 'Module',
  description = 'This feature is coming soon.',
  icon: Icon = Sparkles,
  color = '#3B82F6',
  phase = 'TBD',
  subModules = [],
  launchDate = 'TBD',
  showBackButton = true,
  showNotifyMe = true
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleNotifyMe = () => {
    // TODO: Implement notification signup
    alert(`We'll notify you when ${moduleName} launches! (Feature coming soon)`);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: isDark 
          ? 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)'
          : 'linear-gradient(to bottom, #f9fafb, #ffffff)'
      }}
    >
      <div className="max-w-2xl w-full text-center">
        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {/* Icon */}
        <div 
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: isDark 
              ? `${color}20`
              : `${color}15`,
            border: `2px solid ${color}40`
          }}
        >
          <Icon size={48} style={{ color }} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4" style={{ color }}>
          {moduleName}
        </h1>

        {/* Phase Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6">
          <Lock size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Phase {phase} • Coming Soon
          </span>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
          {description}
        </p>

        {/* Features Preview */}
        {subModules && subModules.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Planned Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {subModules.map((feature, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 rounded-lg bg-card border border-border text-sm text-foreground"
                >
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch Timeline */}
        {launchDate !== 'TBD' && (
          <p className="text-sm text-muted-foreground mb-6">
            Expected Launch: <span className="font-medium">{launchDate}</span>
          </p>
        )}

        {/* Action Buttons */}
        {showNotifyMe && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleNotifyMe}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all shadow-lg hover:shadow-xl"
              style={{
                background: color,
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Notify Me When It Launches
            </button>
            
            <button
              onClick={() => navigate('/portal/social')}
              className="px-6 py-3 rounded-lg font-medium border border-border bg-transparent hover:bg-muted transition-colors"
            >
              Return to Social
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-12 text-xs text-muted-foreground">
          This module is part of the BANIBS ecosystem expansion.<br />
          We're building it with care to serve our community best.
        </p>
      </div>
    </div>
  );
};

/**
 * Specific placeholder components for each upcoming module
 * These can be imported and used directly in routing
 */

export const PrayerRoomsPlaceholder = () => (
  <PortalPlaceholder
    moduleName="Prayer Rooms"
    description="Multi-faith prayer circles, emergency prayer support, meditation rooms, and healing tracks. A sacred space for spiritual connection and community support."
    icon={Sparkles}
    color="#8B5CF6"
    phase="11.0"
    subModules={[
      'unified_prayer_circles',
      'emergency_prayer',
      'prayer_wall',
      'meditation_rooms',
      'healing_tracks'
    ]}
  />
);

export const BeautyMarketplacePlaceholder = () => (
  <PortalPlaceholder
    moduleName="Beauty & Wellness"
    description="Discover and support Black-owned beauty brands, join Sisters Wealth Circles, and access the Beauty Business Accelerator."
    icon={Sparkles}
    color="#EC4899"
    phase="11.0"
    subModules={[
      'beauty_directory',
      'sisters_wealth_circles',
      'beauty_accelerator',
      'product_marketplace'
    ]}
  />
);

export const SneakerFashionPlaceholder = () => (
  <PortalPlaceholder
    moduleName="Sneakers & Fashion"
    description="Black-owned sneaker marketplace, fashion accelerator, youth design programs, and authenticated resale platform."
    icon={Sparkles}
    color="#F59E0B"
    phase="11.0"
    subModules={[
      'sneaker_marketplace',
      'fashion_accelerator',
      'youth_design_program',
      'resale_platform'
    ]}
  />
);

export const DiasporaPlaceholder = () => (
  <PortalPlaceholder
    moduleName="Diaspora Connect"
    description="Connect with the global African diaspora. Share heritage stories, build cross-border businesses, and celebrate our collective culture."
    icon={Sparkles}
    color="#06B6D4"
    phase="12.0"
    subModules={[
      'country_circles',
      'cultural_exchange',
      'diaspora_business',
      'heritage_stories'
    ]}
  />
);

export const YouthAcademyPlaceholder = () => (
  <PortalPlaceholder
    moduleName="BANIBS Academy"
    description="Youth education, mentorship, and curriculum covering financial literacy, entrepreneurship, cultural history, and mental wellness."
    icon={Sparkles}
    color="#8B5CF6"
    phase="13.0"
    subModules={[
      'financial_literacy',
      'entrepreneurship',
      'cultural_history',
      'mental_wellness',
      'gambling_prevention'
    ]}
  />
);

export const WalletPlaceholder = () => (
  <PortalPlaceholder
    moduleName="BANIBS Wallet"
    description="Secure digital wallet for payments, transfers, savings, and investments within the BANIBS ecosystem."
    icon={Lock}
    color="#059669"
    phase="14.0"
    subModules={[
      'payments',
      'transfers',
      'savings',
      'investments'
    ]}
  />
);

export default PortalPlaceholder;
