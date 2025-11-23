import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AcademyLayout from '../../components/academy/AcademyLayout';
import LifeSkillCard from '../../components/academy/LifeSkillCard';
import { Lightbulb, Loader2, X } from 'lucide-react';
import axios from 'axios';

const AcademyLifeSkillsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/academy/lifeskills`);
        setSkills(response.data.skills || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);
  
  return (
    <AcademyLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
            <Lightbulb size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Life Skills Library</h1>
            <p className="text-muted-foreground">Practical wisdom for everyday success</p>
          </div>
        </div>
      </div>
      
      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}
      
      {!loading && skills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => <LifeSkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
        </div>
      )}
      
      {!loading && skills.length === 0 && <div className="text-center py-12"><Lightbulb size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No life skills found</p></div>}
      
      {/* Skill Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedSkill(null)}>
          <div className="w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: isDark ? '#1a1a1a' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-3xl font-bold text-foreground mb-3">{selectedSkill.title}</h2>{selectedSkill.tags && selectedSkill.tags.length > 0 && <div className="flex gap-2 flex-wrap">{selectedSkill.tags.map((tag, idx) => <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>{tag}</span>)}</div>}</div>
              <button onClick={() => setSelectedSkill(null)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={20} /></button>
            </div>
            <div className="prose prose-lg max-w-none text-foreground">{selectedSkill.content.split('\n\n').map((para, idx) => <p key={idx} className="mb-4 leading-relaxed whitespace-pre-line">{para}</p>)}</div>
          </div>
        </div>
      )}
    </AcademyLayout>
  );
};

export default AcademyLifeSkillsPage;
