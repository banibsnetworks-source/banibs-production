import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { 
  Video, 
  Image, 
  BookOpen, 
  Users, 
  Radio, 
  MessageCircle, 
  Mic, 
  MessageSquare, 
  Sparkles, 
  ShoppingBag 
} from 'lucide-react';
import '../../styles/socialworld.css';

/**
 * BANIBS Social World - Unified hub for all social media systems
 * The gateway to all social features within BANIBS
 */
const SocialWorldHome = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'shortform',
      title: 'ShortForm',
      description: 'Vertical video feed',
      icon: Video,
      path: '/socialworld/shortform',
      gradient: 'from-pink-500 to-red-500',
      status: 'active'
    },
    {
      id: 'moments',
      title: 'Moments',
      description: 'Photo feed & stories',
      icon: Image,
      path: '/socialworld/moments',
      gradient: 'from-purple-500 to-pink-500',
      status: 'coming-soon'
    },
    {
      id: 'stories',
      title: 'Stories',
      description: 'Daily highlights',
      icon: BookOpen,
      path: '/socialworld/stories',
      gradient: 'from-blue-500 to-purple-500',
      status: 'coming-soon'
    },
    {
      id: 'connections',
      title: 'Connections',
      description: 'Your social feed',
      icon: Users,
      path: '/socialworld/connections',
      gradient: 'from-cyan-500 to-blue-500',
      status: 'coming-soon'
    },
    {
      id: 'live',
      title: 'LiveCircle',
      description: 'Live streaming hub',
      icon: Radio,
      path: '/socialworld/live',
      gradient: 'from-red-500 to-orange-500',
      status: 'coming-soon'
    },
    {
      id: 'circles',
      title: 'Circles',
      description: 'Groups & communities',
      icon: Users,
      path: '/socialworld/circles',
      gradient: 'from-green-500 to-emerald-500',
      status: 'active'
    },
    {
      id: 'voice',
      title: 'VoiceShare',
      description: 'Audio clips & podcasts',
      icon: Mic,
      path: '/socialworld/voice',
      gradient: 'from-yellow-500 to-orange-500',
      status: 'coming-soon'
    },
    {
      id: 'chat',
      title: 'ChatSphere',
      description: 'Direct messaging',
      icon: MessageSquare,
      path: '/socialworld/chat',
      gradient: 'from-indigo-500 to-purple-500',
      status: 'active'
    },
    {
      id: 'talent',
      title: 'TalentWorld',
      description: 'Creator hub & tools',
      icon: Sparkles,
      path: '/socialworld/talent',
      gradient: 'from-amber-500 to-yellow-500',
      status: 'coming-soon'
    },
    {
      id: 'marketplace',
      title: 'Social Shop',
      description: 'Creator marketplace',
      icon: ShoppingBag,
      path: '/socialworld/marketplace',
      gradient: 'from-emerald-500 to-green-500',
      status: 'coming-soon'
    }
  ];

  const handleModuleClick = (module) => {
    if (module.status === 'active') {
      navigate(module.path);
    }
  };

  return (
    <FullWidthLayout>
      <div className="socialworld-home" data-theme="dark">
        {/* Hero Section */}
        <div className="socialworld-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-text">BANIBS Social World</span>
              <span className="title-badge">✨</span>
            </h1>
            <p className="hero-subtitle">
              Your unified gateway to connection, creativity, and community
            </p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="module-grid-container">
          <div className="module-grid">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.id}
                  className={`module-card ${
                    module.status === 'active' ? 'active' : 'coming-soon'
                  }`}
                  onClick={() => handleModuleClick(module)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`module-icon-wrapper bg-gradient-to-br ${module.gradient}`}>
                    <IconComponent className="module-icon" size={32} />
                  </div>
                  <div className="module-info">
                    <h3 className="module-title">{module.title}</h3>
                    <p className="module-description">{module.description}</p>
                    {module.status === 'coming-soon' && (
                      <span className="module-status-badge">Coming Soon</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Section */}
        <div className="socialworld-footer">
          <p className="footer-text">
            Peace • Love • Honor • Respect
          </p>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default SocialWorldHome;