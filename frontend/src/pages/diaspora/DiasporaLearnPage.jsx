import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import DiasporaArticleCard from '../../components/diaspora/DiasporaArticleCard';
import { GraduationCap, Loader2, X } from 'lucide-react';
import axios from 'axios';

/**
 * DiasporaLearnPage - Phase 12.0
 * Page displaying educational content about the diaspora
 */
const DiasporaLearnPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/education`);
        setArticles(response.data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
  return (
    <DiasporaLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
            }}
          >
            <GraduationCap size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learn the Diaspora</h1>
            <p className="text-muted-foreground">Educational resources on Black global history</p>
          </div>
        </div>
        
        {/* Intro */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
            border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
          }}
        >
          <p className="text-muted-foreground">
            Explore the history, movements, and connections that define the global Black diaspora. 
            These articles provide context and understanding—not trauma, but triumph. Not just survival, 
            but resilience, creativity, and power.
          </p>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      )}
      
      {/* Articles grid */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <DiasporaArticleCard 
              key={article.id} 
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No articles found</p>
        </div>
      )}
      
      {/* Article detail modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
            style={{
              background: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-3">{selectedArticle.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
                        color: '#d97706'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="prose prose-lg max-w-none text-foreground">
              {selectedArticle.content.split('\n\n').map((para, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </DiasporaLayout>
  );
};

export default DiasporaLearnPage;
