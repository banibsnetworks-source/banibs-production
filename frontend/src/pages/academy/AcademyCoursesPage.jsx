import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AcademyLayout from '../../components/academy/AcademyLayout';
import CourseCard from '../../components/academy/CourseCard';
import { BookOpen, Loader2, Filter, X } from 'lucide-react';
import axios from 'axios';

const AcademyCoursesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({ category: '', level: '' });
  
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.level) params.append('level', filters.level);
        
        const response = await axios.get(`${BACKEND_URL}/api/academy/courses?${params.toString()}`);
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [filters]);
  
  return (
    <AcademyLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Tracks</h1>
            <p className="text-muted-foreground">Structured courses to advance your skills</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-4 rounded-xl flex flex-wrap gap-4" style={{ background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}` }}>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by:</span>
          </div>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground">
            <option value="">All Categories</option>
            <option value="finance">Finance & Wealth</option>
            <option value="tech">Technology</option>
            <option value="wellness">Wellness</option>
            <option value="history">History & Culture</option>
            <option value="professionalism">Professional Skills</option>
            <option value="entrepreneurship">Entrepreneurship</option>
            <option value="creative">Creative Arts</option>
          </select>
          <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })} className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {(filters.category || filters.level) && (
            <button onClick={() => setFilters({ category: '', level: '' })} className="text-sm text-blue-600 hover:text-blue-700 underline">Clear filters</button>
          )}
        </div>
      </div>
      
      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}
      
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => <CourseCard key={course.id} course={course} onClick={() => setSelectedCourse(course)} />)}
        </div>
      )}
      
      {!loading && courses.length === 0 && <div className="text-center py-12"><BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No courses found</p></div>}
      
      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedCourse(null)}>
          <div className="w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: isDark ? '#1a1a1a' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-3xl font-bold text-foreground mb-2">{selectedCourse.title}</h2><p className="text-sm text-muted-foreground">{selectedCourse.level} • {selectedCourse.category} • {selectedCourse.estimated_hours} hours</p></div>
              <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={20} /></button>
            </div>
            <p className="text-foreground mb-6">{selectedCourse.description}</p>
            {selectedCourse.modules && selectedCourse.modules.length > 0 && (
              <div><h3 className="text-xl font-semibold text-foreground mb-3">Course Modules</h3><ol className="space-y-2">{selectedCourse.modules.map((module, idx) => <li key={idx} className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{idx + 1}</span><span className="text-foreground">{module}</span></li>)}</ol></div>
            )}
          </div>
        </div>
      )}
    </AcademyLayout>
  );
};

export default AcademyCoursesPage;
