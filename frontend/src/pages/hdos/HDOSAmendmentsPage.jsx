import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * HDOS Amendments - Versioned List
 * Read-only reference of ratified amendments
 */

const HDOSAmendmentsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState({ amendments: [], hdos_version: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/hdos/amendments`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  const getStatusIcon = (status) => {
    if (status === 'RATIFIED') return <CheckCircle size={16} className="text-green-500" />;
    return <Clock size={16} className="text-amber-500" />;
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
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
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
                    Ratified protections • v{data.hdos_version}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Stats */}
          <div 
            className="p-4 rounded-xl mb-6 flex items-center justify-between"
            style={{ 
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                {data.amendments.filter(a => a.status === 'RATIFIED').length} Amendments Ratified
              </span>
            </div>
            <span className="text-sm" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
              HDOS v{data.hdos_version}
            </span>
          </div>

          {/* Amendments List */}
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Loading amendments...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.amendments.map((amendment, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                          {amendment.id}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: amendment.status === 'RATIFIED' ? '#10B981' : '#F59E0B' }}>
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
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 p-4 rounded-xl text-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
            <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
              Amendments are ratified through the HDOS governance process.
              <br />
              Each amendment closes a specific vulnerability or gap in human defense.
            </p>
          </div>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default HDOSAmendmentsPage;
