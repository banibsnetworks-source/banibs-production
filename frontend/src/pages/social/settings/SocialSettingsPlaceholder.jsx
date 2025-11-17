import React from 'react';
import SocialLayout from '../../../components/social/SocialLayout';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Placeholder page for Social settings sections under development
 */
const SocialSettingsPlaceholder = ({ 
  title = "Settings", 
  description = "This feature is under development.",
  icon: Icon = Construction 
}) => {
  const navigate = useNavigate();

  return (
    <SocialLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/portal/social')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Social</span>
        </button>

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Coming Soon
          </h2>
          
          <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
            We're working hard to bring you {title.toLowerCase()} features. 
            Check back soon for updates!
          </p>

          <button
            onClick={() => navigate('/portal/social')}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
          >
            Return to Feed
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gray-900 text-sm font-bold">i</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This section is part of Phase 10+ development. 
              Your feedback helps us prioritize features.
            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialSettingsPlaceholder;
