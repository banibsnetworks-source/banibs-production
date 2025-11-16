import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SocialLayout from '../../components/social/SocialLayout';
import { Search, MapPin, Briefcase, DollarSign, Star } from 'lucide-react';

/**
 * JobsBrowser - Public Job Board (Social Mode)
 * Phase 7.1: BANIBS Jobs & Opportunities
 */

const JobsBrowser = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location_type: searchParams.get('location_type') || '',
    employment_type: searchParams.get('employment_type') || '',
    page: parseInt(searchParams.get('page') || '1')
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Full-Time',
      part_time: 'Part-Time',
      contract: 'Contract',
      internship: 'Internship',
      apprenticeship: 'Apprenticeship',
      gig: 'Gig'
    };
    return labels[type] || type;
  };

  const formatSalary = (min, max, visible) => {
    if (!visible) return 'Salary not disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Competitive salary';
  };

  return (
    <SocialLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">BANIBS Jobs & Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Discover career opportunities within the Black business community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search by title, category, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Search
            </button>
          </form>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filters.location_type}
              onChange={(e) => updateFilter('location_type', e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              value={filters.employment_type}
              onChange={(e) => updateFilter('employment_type', e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Types</option>
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="apprenticeship">Apprenticeship</option>
              <option value="gig">Gig</option>
            </select>

            <input
              type="text"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              onBlur={() => updateFilter('category', filters.category)}
              placeholder="Filter by category"
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="text-sm text-muted-foreground">
            Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No jobs found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                to={`/portal/social/jobs/${job.id}`}
                className="block bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={job.company_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-yellow-600" />
                    </div>
                  )}

                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground hover:text-blue-600">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-medium text-foreground">{job.company_name}</p>
                          {job.company_rating > 0 && (
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span>{job.company_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                        {getEmploymentTypeLabel(job.employment_type)}
                      </span>
                    </div>

                    {/* Job Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {job.location_type === 'remote'
                            ? 'Remote'
                            : `${job.location_city}, ${job.location_state}`}
                        </span>
                      </div>
                      {(job.salary_min || job.salary_max) && job.salary_visible && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(job.salary_min, job.salary_max, job.salary_visible)}</span>
                        </div>
                      )}
                      <span className="px-2 py-1 bg-muted rounded text-xs">{job.category}</span>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page >= totalPages}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </SocialLayout>
  );
};

export default JobsBrowser;
