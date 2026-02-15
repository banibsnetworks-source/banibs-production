import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * HDOS Glossary - Canonical Terms
 * Read-only reference of HDOS terminology (Exit-Safe Model v1.2.0)
 */

const HDOSGlossaryPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [glossary, setGlossary] = useState({ terms: [], hdos_version: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/hdos/glossary`)
      .then(res => res.json())
      .then(data => {
        setGlossary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  const filteredTerms = glossary.terms.filter(term =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                data-testid="hdos-glossary-back"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen size={28} className="text-amber-500" />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                    HDOS Glossary
                  </h1>
                  <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Canonical terms • v{glossary.hdos_version} • Exit-Safe Model
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Search */}
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <Search size={18} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: isDark ? '#fff' : '#111' }}
              data-testid="hdos-glossary-search"
            />
          </div>

          {/* Terms */}
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Loading glossary...</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="hdos-glossary-list">
              {filteredTerms.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                  }}
                >
                  <h3 className="text-lg font-bold mb-2 text-amber-500">
                    {item.term}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: isDark ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' }}>
                    {item.definition}
                  </p>
                  
                  {item.indicators && item.indicators.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Indicators
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.indicators.map((ind, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: '#F59E0B'
                            }}
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.types && item.types.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.types.map((type, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: '#3B82F6'
                            }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.formula && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Formula
                      </p>
                      <p className="text-xs font-mono px-2 py-1 rounded" style={{ 
                        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' 
                      }}>
                        {item.formula}
                      </p>
                    </div>
                  )}

                  {item.values && item.values.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Values
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.values.map((val, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-full font-mono"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                              color: '#8B5CF6'
                            }}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.format && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Format
                      </p>
                      <p className="text-xs font-mono" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {item.format}
                      </p>
                    </div>
                  )}

                  {item.states && item.states.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        States
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.states.map((state, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: '#10B981'
                            }}
                          >
                            {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.trigger && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Trigger
                      </p>
                      <p className="text-xs" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {item.trigger}
                      </p>
                    </div>
                  )}

                  {item.flag && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Flag
                      </p>
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                      >
                        {item.flag}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {filteredTerms.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                    No terms match your search.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default HDOSGlossaryPage;
