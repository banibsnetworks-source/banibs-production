import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import SEO from '../../components/SEO';
import { Briefcase, Users, TrendingUp, Search, Building2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BusinessPortal - Phase 8.4
 * BANIBS Business Portal landing page with business owner tools
 * Now wrapped in BusinessLayout for consistent navigation
 */
const BusinessPortal = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <BusinessLayout>
      <SEO
        title="BANIBS Business Portal - Directory, Marketplace, Jobs"
        description="Discover Black-owned businesses, find opportunities, and grow your network."
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            BANIBS Business Portal
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Directory • Marketplace • Jobs • Resources
          </p>
        </div>
      </div>

      {/* Business Owner Tools - Show if user is logged in */}
      {user && (
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Business Owner Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/portal/business/me"
                className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-xl p-6 text-center hover:bg-yellow-900/30 hover:border-yellow-500 transition-all"
              >
                <Building2 className="mx-auto mb-3 text-yellow-400" size={40} />
                <h3 className="text-lg font-bold text-white mb-2">Manage My Business</h3>
                <p className="text-gray-300 text-sm">View and customize your business profile, branding, and services</p>
              </Link>

              <Link
                to="/portal/business/board"
                className="bg-green-900/20 border-2 border-green-500/50 rounded-xl p-6 text-center hover:bg-green-900/30 hover:border-green-500 transition-all"
              >
                <MessageSquare className="mx-auto mb-3 text-green-400" size={40} />
                <h3 className="text-lg font-bold text-white mb-2">Business Board</h3>
                <p className="text-gray-300 text-sm">Post opportunities and connect with other businesses</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-6 max-w-5xl mx-auto">Explore</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            to="/business-directory"
            className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <Briefcase className="mx-auto mb-4 text-yellow-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Business Directory</h3>
            <p className="text-gray-400">Find Black-owned businesses near you</p>
          </Link>

          <Link
            to="/opportunities"
            className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <TrendingUp className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Job Opportunities</h3>
            <p className="text-gray-400">Explore careers and grants</p>
          </Link>

          <Link
            to="/resources"
            className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <Users className="mx-auto mb-4 text-blue-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Resources</h3>
            <p className="text-gray-400">Tools and guides for growth</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessPortal;