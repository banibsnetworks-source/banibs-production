import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft, Home } from 'lucide-react';
import GlobalNavBar from '../components/GlobalNavBar';

/**
 * Coming Soon Page for Hidden/Unreleased Modules
 * Shows a clean "Not available yet" message instead of stub UIs
 */
const ModuleComingSoon = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalNavBar />
      
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-md">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
            <Construction className="w-10 h-10 text-muted-foreground" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">
            Coming Soon
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            This section of BANIBS is currently under development. 
            We're working hard to bring you a great experience.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Go to News
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
          
          {/* Footer note */}
          <p className="text-sm text-muted-foreground mt-12">
            BANIBS is opening in phases. Stay tuned for updates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ModuleComingSoon;
