import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * HDOS Amendments Page
 * Read-only list of ratified HDOS amendments
 */

const HDOSAmendmentsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [amendments, setAmendments] = useState({ amendments: [], hdos_version: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/hdos/amendments`)
      .then(res => res.json())
      .then(data => {
        setAmendments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'RATIFIED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'DRAFT': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RATIFIED': return <CheckCircle size={16} />;
      case 'PENDING': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link
                to="/hdos/engine"
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
                data-testid="hdos-amendments-back"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <FileText size={28} className="text-amber-500" />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                    HDOS Amendments
                  </h1>
                  <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Ratified amendments • v{amendments.hdos_version}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Info Banner */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{ 
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}
          >
            <p className="text-sm" style={{ color: '#F59E0B' }}>
              HDOS evolves through formal amendments. Each amendment addresses a specific gap or vulnerability 
              identified in the system. Amendments go through proposal, review, and ratification before becoming 
              part of the canonical spec.
            </p>
          </div>

          {/* Amendments List */}
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Loading amendments...</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="hdos-amendments-list">
              {amendments.amendments.map((amendment, idx) => (
                <div 
                  key={amendment.id}
                  className="p-5 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: '#F59E0B'
                          }}
                        >
                          {amendment.id}
                        </span>
                        <span 
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${getStatusColor(amendment.status)}20`,
                            color: getStatusColor(amendment.status)
                          }}
                        >
                          {getStatusIcon(amendment.status)}
                          {amendment.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                        {amendment.title}
                      </h3>
                    </div>
                    <span className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                      {amendment.date}
                    </span>
                  </div>
                  
                  <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    {amendment.summary}
                  </p>
                </div>
              ))}

              {amendments.amendments.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                    No amendments found.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Amendment Process */}
          <div 
            className="mt-8 p-5 rounded-xl"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
              Amendment Process
            </h3>
            <ol className="space-y-2 text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">1.</span>
                <span><strong>Proposal</strong> — Identify gap or vulnerability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">2.</span>
                <span><strong>Draft</strong> — Write amendment with problem statement, patch rule, and test criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">3.</span>
                <span><strong>Review</strong> — Founder review and stress testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">4.</span>
                <span><strong>Ratification</strong> — Add to canonical spec</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">5.</span>
                <span><strong>Implementation</strong> — Update platform code if needed</span>
              </li>
            </ol>
          </div>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default HDOSAmendmentsPage;
