import React from 'react';
import { Radio, Users, Briefcase, Play, Sparkles } from 'lucide-react';

/**
 * ComingSoon Component - S-FINAL S4
 * Reusable placeholder for unimplemented features
 * 
 * Design: Clean, professional, BANIBS-branded
 * Purpose: Replace blank pages with clear communication
 */

const SECTION_ICONS = {
  groups: Users,
  marketplace: Briefcase,
  live: Broadcast,
  watch: Play,
  default: Sparkles
};

const SECTION_DESCRIPTIONS = {
  groups: "Connect with communities that share your interests and values. Groups will help you engage in meaningful conversations and build lasting connections.",
  marketplace: "Discover and support Black-owned businesses. The BANIBS Marketplace will connect you with products, services, and opportunities that matter.",
  live: "Go live and share your story in real-time. Live streaming will bring our community together for authentic, immediate connection.",
  watch: "Enjoy curated video content celebrating Black excellence. BANIBS Watch will showcase stories, culture, and creativity from our community.",
  default: "This feature is coming soon as part of BANIBS Connect's next phase. Stay tuned for updates."
};

const ComingSoon = ({ 
  section = "default",
  title,
  description,
  customIcon: CustomIcon,
  showBackButton = true
}) => {
  // Determine icon and description
  const Icon = CustomIcon || SECTION_ICONS[section] || SECTION_ICONS.default;
  const defaultTitle = `${section.charAt(0).toUpperCase() + section.slice(1)} Coming Soon`;
  const displayTitle = title || defaultTitle;
  const displayDescription = description || SECTION_DESCRIPTIONS[section] || SECTION_DESCRIPTIONS.default;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon Container */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30">
          <Icon className="w-12 h-12 text-yellow-500" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {displayTitle}
        </h1>

        {/* "Coming Soon to BANIBS" Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Coming Soon to BANIBS
          </span>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
          {displayDescription}
        </p>

        {/* Note about current focus */}
        <div className="p-4 bg-muted border border-border rounded-lg max-w-md mx-auto mb-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Current Focus:</span> We're building core social and messaging features to ensure the best foundation for BANIBS Connect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-card hover:bg-muted border border-border rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          )}
          <a
            href="/portal/social"
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Explore Social Feed
          </a>
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-xs text-muted-foreground">
          Have feedback or suggestions? We'd love to hear from you as we build BANIBS.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
