import React from 'react';
import { useNavigate } from 'react-router-dom';
import SocialLayout from '../../components/social/SocialLayout';
import { Construction, ArrowLeft } from 'lucide-react';

/**
 * Generic Coming Soon page for Social features
 */
const SocialComingSoon = ({ title, description, phase }) => {
  const navigate = useNavigate();

  return (
    <SocialLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Construction className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {title}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-4">
            {description}
          </p>

          {/* Phase Badge */}
          {phase && (
            <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-900 dark:text-yellow-400 text-sm font-semibold rounded-full mb-6">
              {phase}
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => navigate('/portal/social')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Social Feed
          </button>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialComingSoon;
