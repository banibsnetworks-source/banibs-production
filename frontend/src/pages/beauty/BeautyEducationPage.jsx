import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import BeautyLayout from '../../components/beauty/BeautyLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const BeautyEducationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  useEffect(() => {
    loadArticles();
  }, []);
  
  const loadArticles = async () => {
    try {
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/beauty/education`
      );
      if (response.ok) {
        setArticles(response.data);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (selectedArticle) {
    return (
      <BeautyLayout>
        <button
          onClick={() => setSelectedArticle(null)}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to articles
        </button>
        
        <article className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {selectedArticle.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>{selectedArticle.author}</span>
            <span>•</span>
            <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
          </div>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br/>') }}
          />
        </article>
      </BeautyLayout>
    );
  }
  
  return (
    <BeautyLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Beauty Education Center
        </h1>
        <p className="text-muted-foreground">
          Learn about healthy hair, skincare, self-love, and smart spending
        </p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="p-6 rounded-lg border text-left transition-all hover:shadow-lg"
              style={{
                background: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#EC4899';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <BookOpen size={24} className="text-pink-500 flex-shrink-0" />
                <h3 className="text-xl font-semibold text-foreground">
                  {article.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {article.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
                      color: '#EC4899'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </BeautyLayout>
  );
};

export default BeautyEducationPage;