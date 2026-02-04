import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { 
  Video, 
  Image, 
  BookOpen, 
  Users, 
  Radio, 
  MessageSquare, 
  Mic, 
  Sparkles, 
  ShoppingBag,
  Globe,
  ChevronDown,
  Check
} from 'lucide-react';
import '../../styles/socialworld.css';
import { setLastWorld, getLastWorld } from '../../hooks/useWorldPersistence';

// Default world when no preference exists
const DEFAULT_WORLD = 'community';

/**
 * BANIBS Social World - Unified hub for all social media systems
 * With "Last Used World" persistence
 */

// World definitions with routes
const WORLDS = [
  {
    id: 'community',
    title: 'Community',
    description: 'Main social feed',
    icon: Users,
    path: '/portal/social',
    gradient: 'from-amber-500 to-yellow-600',
    status: 'active'
  },
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
    id: 'circles',
    title: 'Circles',
    description: 'Groups & communities',
    icon: Users,
    path: '/portal/social/circles',
    gradient: 'from-green-500 to-emerald-500',
    status: 'active'
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
    path: '/messages',
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

// World Selector Dropdown Component
const WorldSelector = ({ currentWorld, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = WORLDS.find(w => w.id === currentWorld) || WORLDS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors"
      >
        <Globe size={16} className="text-amber-400" />
        <span className="text-sm font-medium text-white">World: {current.title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-white/10">
              <p className="text-xs text-gray-500 px-2">Switch World</p>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {WORLDS.filter(w => w.status === 'active').map((world) => {
                const Icon = world.icon;
                const isActive = world.id === currentWorld;
                return (
                  <button
                    key={world.id}
                    onClick={() => {
                      onSelect(world);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${
                      isActive ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${world.gradient} flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-amber-400' : 'text-white'}`}>
                        {world.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{world.description}</p>
                    </div>
                    {isActive && <Check size={16} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
            <div className="p-2 border-t border-white/10">
              <p className="text-xs text-gray-600 px-2">More worlds coming soon</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SocialWorldHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Lazy initialization - determine initial world synchronously
  const [currentWorld, setCurrentWorld] = useState(() => {
    // Priority 1: URL query param override (?world=shortform)
    const urlWorld = new URLSearchParams(window.location.search).get('world');
    if (urlWorld && WORLDS.find(w => w.id === urlWorld)) {
      setLastWorld(urlWorld);
      return urlWorld;
    }
    
    // Priority 2: localStorage last_world
    const lastWorld = getLastWorld();
    if (lastWorld && WORLDS.find(w => w.id === lastWorld)) {
      return lastWorld;
    }
    
    // Priority 3: default
    return DEFAULT_WORLD;
  });

  // Handle URL world param changes (for external navigation)
  useEffect(() => {
    const urlWorld = searchParams.get('world');
    if (urlWorld && WORLDS.find(w => w.id === urlWorld) && urlWorld !== currentWorld) {
      setCurrentWorld(urlWorld);
      setLastWorld(urlWorld);
    }
  }, [searchParams, currentWorld]);

  // Handle world switch
  const handleWorldSelect = (world) => {
    if (world.status !== 'active') return;
    
    setCurrentWorld(world.id);
    setLastWorld(world.id);
    navigate(world.path);
  };

  // Handle module card click (same as world select)
  const handleModuleClick = (module) => {
    if (module.status === 'active') {
      setLastWorld(module.id);
      navigate(module.path);
    }
  };

  // Get active worlds for display
  const activeWorlds = WORLDS.filter(w => w.status === 'active');
  const comingSoonWorlds = WORLDS.filter(w => w.status === 'coming-soon');

  return (
    <FullWidthLayout>
      <div className="socialworld-home" data-theme="dark">
        {/* Top Bar with World Indicator */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Social World</h2>
            <WorldSelector 
              currentWorld={currentWorld} 
              onSelect={handleWorldSelect} 
            />
          </div>
        </div>

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

        {/* Active Worlds Section */}
        <div className="module-grid-container">
          <div className="px-4 mb-4">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Active Worlds</h3>
          </div>
          <div className="module-grid">
            {activeWorlds.map((module) => {
              const IconComponent = module.icon;
              const isCurrentWorld = module.id === currentWorld;
              return (
                <div
                  key={module.id}
                  className={`module-card active ${isCurrentWorld ? 'ring-2 ring-amber-500/50' : ''}`}
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
                    {isCurrentWorld && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-1">
                        <Check size={12} /> Last used
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="module-grid-container" style={{ marginTop: '2rem' }}>
          <div className="px-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Coming Soon</h3>
          </div>
          <div className="module-grid">
            {comingSoonWorlds.map((module) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.id}
                  className="module-card coming-soon"
                  role="button"
                  tabIndex={0}
                >
                  <div className={`module-icon-wrapper bg-gradient-to-br ${module.gradient} opacity-50`}>
                    <IconComponent className="module-icon" size={32} />
                  </div>
                  <div className="module-info">
                    <h3 className="module-title">{module.title}</h3>
                    <p className="module-description">{module.description}</p>
                    <span className="module-status-badge">Coming Soon</span>
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

// Export the world utilities for use elsewhere
export { WORLDS, DEFAULT_WORLD };
export default SocialWorldHome;
