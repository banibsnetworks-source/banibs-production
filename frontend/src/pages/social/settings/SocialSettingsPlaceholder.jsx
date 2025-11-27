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
      <div className="container-v2 section-v2 page-enter" data-mode="social">
        {/* Back Button */}
        <button
          onClick={() => navigate('/portal/social')}
          className="btn-v2 btn-v2-ghost btn-v2-sm icon-text-aligned breathing-room-md"
        >
          <ArrowLeft size={20} />
          <span>Back to Social</span>
        </button>

        {/* Header */}
        <div className="card-v2 clean-spacing-lg breathing-room-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-v2/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary-v2" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground-v2">{title}</h1>
              <p className="text-secondary-v2 breathing-room-xs">{description}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="empty-state-v2">
          <div className="empty-state-icon">
            <Construction className="w-12 h-12" />
          </div>
          
          <h2 className="empty-state-title">
            Coming Soon
          </h2>
          
          <p className="empty-state-description">
            We're working hard to bring you {title.toLowerCase()} features. 
            Check back soon for updates!
          </p>

          <button
            onClick={() => navigate('/portal/social')}
            className="btn-v2 btn-v2-primary btn-v2-md"
          >
            Return to Feed
          </button>
        </div>

        {/* Info Box */}
        <div className="card-v2 clean-spacing-md" style={{ background: 'rgba(var(--primary-rgb), 0.1)', borderColor: 'var(--primary-v2)' }}>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary-v2 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gray-900 text-sm font-bold">i</span>
            </div>
            <div className="text-sm text-secondary-v2">
              <strong className="text-foreground-v2">Note:</strong> This section is part of Phase 10+ development. 
              Your feedback helps us prioritize features.
            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialSettingsPlaceholder;
