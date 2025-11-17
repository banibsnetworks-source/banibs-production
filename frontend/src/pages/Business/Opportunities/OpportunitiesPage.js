import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Handshake, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import BusinessLayout from '../../../components/business/BusinessLayout';
import JobsFilters from './JobsFilters';
import SEO from '../../../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function OpportunitiesPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    remote_type: '',
    job_type: '',
    experience_level: '',
    industry: '',
    posted_within: '',
    verified_employer: false,
    has_dei_statement: false
  });

  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 20);
      
      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          // Handle posted_within conversion to posted_since ISO date
          if (key === 'posted_within') {
            const now = new Date();
            let daysAgo;
            if (filters[key] === '1d') daysAgo = 1;
            else if (filters[key] === '7d') daysAgo = 7;
            else if (filters[key] === '30d') daysAgo = 30;
            
            if (daysAgo) {
              const sinceDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
              params.append('posted_since', sinceDate.toISOString());
            }
          } else {
            params.append(key, filters[key]);
          }
        }
      });
      
      const response = await fetch(`${BACKEND_URL}/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      q: '',
      location: '',
      remote_type: '',
      job_type: '',
      experience_level: '',
      industry: '',
      posted_within: '',
      verified_employer: false,
      has_dei_statement: false
    });
    setCurrentPage(1);
  };

  const scrollToJobs = () => {
    const jobsSection = document.getElementById('jobs-list');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatSalary = (min, max, type) => {
    if (!min && !max) return null;
    
    const format = (val) => {
      if (type === 'hourly') return `$${val}/hr`;
      return `$${(val / 1000).toFixed(0)}k`;
    };
    
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    if (max) return `Up to ${format(max)}`;
  };

  const getRemoteTypeLabel = (type) => {
    const labels = {
      remote: 'Remote',
      hybrid: 'Hybrid',
      on_site: 'On-site'
    };
    return labels[type] || type;
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      full_time: 'Full-time',
      part_time: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
      temporary: 'Temporary'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SEO 
        title="BANIBS Opportunities - Jobs, Grants & Scholarships"
        description="Browse curated opportunities for Black and Indigenous communities including jobs, grants, scholarships, training programs, and events."
      />
      {/* Hero Section - Option A: Empowerment & Inclusion */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 via-slate-100/50 to-transparent dark:from-emerald-600/30 dark:via-slate-800/40 dark:to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)] animate-pulse" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl p-8 md:p-12">
            {/* Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 dark:bg-emerald-600/30 rounded-2xl">
                <Briefcase className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="p-3 bg-emerald-500/20 dark:bg-emerald-600/30 rounded-2xl">
                <Handshake className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            
            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Connecting Talent and Opportunity — <br className="hidden md:block" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Open to All, Rooted in Black Excellence.
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-3xl leading-relaxed">
              The BANIBS Opportunities Exchange brings employers, recruiters, and job seekers together with one goal: 
              <strong className="text-slate-900 dark:text-white"> economic empowerment</strong> through 
              visibility, trust, and community-driven advancement.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={scrollToJobs}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Briefcase className="w-5 h-5" />
                Browse Opportunities
              </button>
              <button
                onClick={() => navigate('/recruiters/verify')}
                className="px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-2xl border-2 border-slate-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Handshake className="w-5 h-5" />
                Post a Job
              </button>
            </div>
            
            {/* Footer tagline */}
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic">
              Powered by <strong className="text-slate-700 dark:text-slate-300">BANIBS</strong> — 
              Black American News, Information & Business Sources.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="jobs-list">
        {/* Filters */}
        <JobsFilters 
          filters={filters} 
          onChange={handleFilterChange} 
          onReset={handleResetFilters} 
        />
        
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? 'Loading...' : `${total} Opportunities`}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No opportunities found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try adjusting your filters to see more results.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/opportunities/${job.id}`)}
              >
                {/* Job Card Header */}
                <div className="p-6">
                  {/* Employer Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {job.employer_name}
                      </p>
                    </div>
                    {job.employer_logo_url && (
                      <img
                        src={job.employer_logo_url}
                        alt={job.employer_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Location */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    
                    {/* Remote Type */}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      job.remote_type === 'remote' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : job.remote_type === 'hybrid'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {getRemoteTypeLabel(job.remote_type)}
                    </span>
                    
                    {/* Job Type */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3 h-3" />
                      {getJobTypeLabel(job.job_type)}
                    </span>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 4 && (
                        <span className="px-2 py-1 text-slate-500 dark:text-slate-400 text-xs">
                          +{job.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    {/* Salary */}
                    <div>
                      {formatSalary(job.pay_range_min, job.pay_range_max, job.pay_type) && (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.pay_range_min, job.pay_range_max, job.pay_type)}
                        </span>
                      )}
                    </div>
                    
                    {/* View Details */}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunitiesPage;
