import React from 'react';
import { Wrench, TrendingUp, Users, DollarSign, FileText, Lightbulb, Award, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsBeat from '../common/NewsBeat';

/**
 * ConnectRightRail - BANIBS Connect Right Column
 * Business Owner Command Center
 * 
 * Raymond's Spec - Business Owner Focused (NOT job seeker):
 * 1. Business Tools Hub
 * 2. Your Company Pulse (metrics)
 * 3. Leads & Inquiries
 * 4. Funding & Capital Alerts
 * 5. Business Owner Opportunities
 * 6. Industry Insights / Trends
 * 7. Featured Businesses / Business Spotlight
 */

const ConnectRightRail = () => {
  return (
    <div className="space-y-4">
      {/* NewsBeat */}
      <NewsBeat variant="desktop" limit={5} />

      {/* Jobs & Hiring */}
      <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-border">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-foreground">Jobs & Hiring</h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Link to="/portal/connect/jobs" className="block text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            💼 Manage Job Postings
          </Link>
          <Link to="/portal/connect/jobs/new" className="block text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            ➕ Post a New Job
          </Link>
          <Link to="/portal/social/jobs" className="block text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            🔍 Browse Talent Pool
          </Link>
          <Link to="/portal/connect/jobs" className="block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-3">
            View applicants →
          </Link>
        </div>
      </div>

      {/* Business Tools Hub */}
      <div className="bg-card border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-border">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-bold text-sm text-foreground">Business Tools Hub</h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Link to="/portal/connect/tools/calculator" className="block text-sm text-foreground hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
            📊 ROI Calculator
          </Link>
          <Link to="/portal/connect/tools/checklist" className="block text-sm text-foreground hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
            ✅ Business Launch Checklist
          </Link>
          <Link to="/portal/connect/tools/resources" className="block text-sm text-foreground hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
            📚 Resource Library
          </Link>
          <Link to="/portal/connect/tools" className="block text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline mt-3">
            View all tools →
          </Link>
        </div>
      </div>

      {/* Your Company Pulse */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-sm text-foreground">Your Company Pulse</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profile Views</span>
              <span className="text-lg font-bold text-foreground">1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Followers</span>
              <span className="text-lg font-bold text-green-600">+42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inquiries</span>
              <span className="text-lg font-bold text-yellow-600">8</span>
            </div>
          </div>
          <Link to="/portal/connect/analytics" className="block text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline mt-3">
            View full analytics →
          </Link>
        </div>
      </div>

      {/* Leads & Inquiries */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-foreground">Leads & Inquiries</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Track who's interested in your business
          </p>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              View profile visitors & inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Funding & Capital Alerts */}
      <div className="bg-card border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border-b border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-sm text-foreground">Funding & Capital</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="pb-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">Small Business Grant - Atlanta</p>
            <p className="text-xs text-muted-foreground mt-1">Up to $50K • Closes Dec 15</p>
          </div>
          <div className="pb-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">Supplier Diversity Program</p>
            <p className="text-xs text-muted-foreground mt-1">Fortune 500 opportunity</p>
          </div>
          <Link to="/portal/connect/funding" className="block text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
            View all opportunities →
          </Link>
        </div>
      </div>

      {/* Business Owner Opportunities */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-foreground">Opportunities</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="pb-2">
            <p className="text-sm font-medium text-foreground">RFP: Municipal IT Services</p>
            <p className="text-xs text-muted-foreground mt-1">$2M contract • Tech sector</p>
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-foreground">Partnership: Real Estate Dev</p>
            <p className="text-xs text-muted-foreground mt-1">Joint venture opportunity</p>
          </div>
          <Link to="/portal/connect/opportunities" className="block text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline">
            Browse all opportunities →
          </Link>
        </div>
      </div>

      {/* Industry Insights */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-bold text-sm text-foreground">Industry Insights</h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            📈 Tech sector growth: +15% in Q4
          </p>
          <p className="text-xs text-muted-foreground">
            💼 Black business ownership hits record high
          </p>
          <p className="text-xs text-muted-foreground">
            🏗️ Commercial real estate trends shift
          </p>
        </div>
      </div>

      {/* Featured Businesses */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-bold text-sm text-foreground">Business Spotlight</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">TechStart Solutions</p>
              <p className="text-xs text-muted-foreground">Software • Atlanta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">BuildRight Properties</p>
              <p className="text-xs text-muted-foreground">Real Estate • Georgia</p>
            </div>
          </div>
          <Link to="/portal/connect/discover" className="block text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline">
            Discover more businesses →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectRightRail;
