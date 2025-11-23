import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AcademyLayout from '../../components/academy/AcademyLayout';
import HistoryCard from '../../components/academy/HistoryCard';
import { BookMarked, Loader2, X } from 'lucide-react';
import axios from 'axios';

const AcademyHistoryPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/academy/history`);
        setLessons(response.data.lessons || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);
  
  return (
    <AcademyLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
            <BookMarked size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Black History Master Lessons</h1>
            <p className="text-muted-foreground">Learn the powerful story of our people</p>
          </div>
        </div>
        <div className="p-6 rounded-xl" style={{ background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}` }}>
          <p className="text-muted-foreground">From ancient African empires to modern movements, explore the history that shaped us. These lessons center triumph, resilience, and power—not just pain.</p>
        </div>
      </div>
      
      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}
      
      {!loading && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => <HistoryCard key={lesson.id} lesson={lesson} onClick={() => setSelectedLesson(lesson)} />)}
        </div>
      )}
      
      {!loading && lessons.length === 0 && <div className="text-center py-12"><BookMarked size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No lessons found</p></div>}
      
      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedLesson(null)}>
          <div className="w-full max-w-4xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: isDark ? '#1a1a1a' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><div className="inline-flex px-3 py-1 rounded-full text-sm font-medium mb-3" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>{selectedLesson.theme}</div><h2 className="text-3xl font-bold text-foreground">{selectedLesson.title}</h2></div>
              <button onClick={() => setSelectedLesson(null)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={20} /></button>
            </div>
            {selectedLesson.media_url && (
              <div className="mb-6 rounded-lg overflow-hidden"><img src={selectedLesson.media_url} alt={selectedLesson.title} className="w-full h-auto" onError={(e) => { e.target.style.display = 'none'; }} /></div>
            )}
            <div className="prose prose-lg max-w-none text-foreground">{selectedLesson.content.split('\n\n').map((para, idx) => <p key={idx} className="mb-4 leading-relaxed whitespace-pre-line">{para}</p>)}</div>
          </div>
        </div>
      )}
    </AcademyLayout>
  );
};

export default AcademyHistoryPage;
