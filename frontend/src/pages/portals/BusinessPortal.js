import React from 'react';
import GlobalNavBar from '../../components/GlobalNavBar';
import SEO from '../../components/SEO';
import { Briefcase, Users, TrendingUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * BusinessPortal - Phase 8.2
 * BANIBS Business Portal landing page
 */
const BusinessPortal = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <SEO
        title="BANIBS Business Portal - Directory, Marketplace, Jobs"
        description="Discover Black-owned businesses, find opportunities, and grow your network."
      />
      <GlobalNavBar />

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

      {/* Quick Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            to="/business"
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