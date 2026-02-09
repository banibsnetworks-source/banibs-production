import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { 
  Video, 
  Image, 
  FileText, 
  Users, 
  Radio, 
  MessageSquare, 
  Mic, 
  Sparkles, 
  ShoppingBag,
  Globe,
  ChevronDown,
  Check,
  Compass
} from 'lucide-react';
import '../../styles/socialworld.css';
import { setLastWorld, getLastWorld } from '../../hooks/useWorldPersistence';

// Default world when no preference exists
const DEFAULT_WORLD = 'commons';

/**
 * BANIBS Social World - Unified gateway to connection, creativity, and community
 * With "Last Used World" persistence
 * 
 * CANONICAL NAMING (LOCKED):
 * - Commons: PRIMARY social/news exchange
 * - Pulse: Short-form vertical video
 * - Frames: Image-forward posts
 * - Notes: Short written thoughts
 * - Circles: Community/group spaces
 */

// World definitions with routes - CANONICAL NAMING
const WORLDS = [
  {
    id: 'commons',
    title: 'Commons',
    description: 'Shared space for stories & exchange',
    icon: Compass,
    path: '/portal/social',
    gradient: 'from-amber-500 to-yellow-600',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1655028065229-d39b85cba6e2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxCbGFjayUyMGZyaWVuZHMlMjBjb25uZWN0aW5nJTIwc29jaWFsJTIwbWVkaWElMjBjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MHx8fHwxNzcwMzUxNjc4fDA&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'pulse',
    title: 'Pulse',
    description: 'Short-form vertical video',
    icon: Video,
    path: '/socialworld/pulse',
    gradient: 'from-pink-500 to-red-500',
    status: 'active',
    image: 'https://images.pexels.com/photos/7514816/pexels-photo-7514816.jpeg'
  },
  {
    id: 'frames',
    title: 'Frames',
    description: 'Visual storytelling',
    icon: Image,
    path: '/socialworld/frames',
    gradient: 'from-purple-500 to-pink-500',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1596768453698-863c3810414e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxCbGFjayUyMHBlb3BsZSUyMHRhbGtpbmclMjBjb252ZXJzYXRpb24lMjBmcmllbmRzJTIwaGFwcHl8ZW58MHx8fHwxNzcwMzUxNzE1fDA&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Reflections & thoughts',
    icon: FileText,
    path: '/socialworld/notes',
    gradient: 'from-blue-500 to-indigo-500',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1758525225988-d34bcbcc00a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxCbGFjayUyMHBlb3BsZSUyMHRhbGtpbmclMjBjb252ZXJzYXRpb24lMjBmcmllbmRzJTIwaGFwcHl8ZW58MHx8fHwxNzcwMzUxNzE1fDA&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'circles',
    title: 'Circles',
    description: 'Community spaces',
    icon: Users,
    path: '/portal/social/circles',
    gradient: 'from-green-500 to-emerald-500',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1758525225856-d837707cb13f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxCbGFjayUyMHBlb3BsZSUyMHRhbGtpbmclMjBjb252ZXJzYXRpb24lMjBmcmllbmRzJTIwaGFwcHl8ZW58MHx8fHwxNzcwMzUxNzE1fDA&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'live',
    title: 'Live Circle',
    description: 'Live streaming hub',
    icon: Radio,
    path: '/socialworld/live',
    gradient: 'from-red-500 to-orange-500',
    status: 'coming-soon',
    image: null
  },
  {
    id: 'voice',
    title: 'Voice Share',
    description: 'Audio clips & podcasts',
    icon: Mic,
    path: '/socialworld/voice',
    gradient: 'from-yellow-500 to-orange-500',
    status: 'coming-soon',
    image: null
  },
  {
    id: 'chat',
    title: 'ChatSphere',
    description: 'Private conversations',
    icon: MessageSquare,
    path: '/socialworld/chat',
    gradient: 'from-indigo-500 to-purple-500',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1739302750675-042ed497a429?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxCbGFjayUyMGZyaWVuZHMlMjB0YWxraW5nJTIwbGF1Z2hpbmclMjBjb25uZWN0aW9ufGVufDB8fHx8MTc3MDQ0MDk0NHww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'local',
    title: 'Local Exchange',
    description: 'Buy, sell & trade locally',
    icon: ShoppingBag,
    path: '/socialworld/local',
    gradient: 'from-orange-500 to-amber-500',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMG1hcmtldHBsYWNlfGVufDB8fHx8MTcwOTEyMzQ1Nnww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'talent',
    title: 'Talent World',
    description: 'Creator hub & tools',
    icon: Sparkles,
    path: '/socialworld/talent',
    gradient: 'from-amber-500 to-yellow-500',
    status: 'coming-soon',
    image: null
  },
  {
    id: 'marketplace',
    title: 'Social Shop',
    description: 'Creator marketplace',
    icon: ShoppingBag,
    path: '/socialworld/marketplace',
    gradient: 'from-emerald-500 to-green-500',
    status: 'coming-soon',
    image: null
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
  
  // Hero image - Black-centered community gathering
  const HERO_IMAGE = "https://images.unsplash.com/photo-1768244016470-271b210a8407?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxCbGFjayUyMGZyaWVuZHMlMjBjb25uZWN0aW5nJTIwc29jaWFsJTIwbWVkaWElMjBjb21tdW5pdHklMjBnYXRoZXJpbmd8ZW58MHx8fHwxNzcwMzUxNjc4fDA&ixlib=rb-4.1.0&q=85";
  
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
  // Using requestAnimationFrame to defer setState and avoid lint warning
  useEffect(() => {
    const urlWorld = searchParams.get('world');
    if (urlWorld && WORLDS.find(w => w.id === urlWorld) && urlWorld !== currentWorld) {
      requestAnimationFrame(() => {
        setCurrentWorld(urlWorld);
        setLastWorld(urlWorld);
      });
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

        {/* Hero Section with Image */}
        <div className="relative overflow-hidden rounded-2xl mx-4 my-4" style={{ minHeight: '300px' }}>
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${HERO_IMAGE})`,
              filter: 'brightness(0.45)'
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          
          {/* Subtle border */}
          <div className="absolute inset-0 rounded-2xl border border-white/5" />
          
          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6">
            {/* Section Label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/60" />
              <span className="text-xs font-medium text-amber-400/80 uppercase tracking-[0.3em]">BANIBS Platform</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Social World
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              Your unified gateway to connection, creativity, and community
            </p>
            
            {/* Feature Tags */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium backdrop-blur-sm">
                Video & Photo
              </span>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium backdrop-blur-sm">
                Circles & Communities
              </span>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium backdrop-blur-sm">
                Creator Tools
              </span>
            </div>
          </div>
        </div>

        {/* Active Worlds Section */}
        <div className="module-grid-container">
          <div className="px-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-400/80 uppercase tracking-[0.2em]">Active Worlds</h3>
            <div className="h-px w-16 bg-gradient-to-r from-amber-500/60 to-transparent mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {activeWorlds.map((module) => {
              const isCurrentWorld = module.id === currentWorld;
              return (
                <div
                  key={module.id}
                  className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${isCurrentWorld ? 'ring-2 ring-amber-500/60 ring-offset-2 ring-offset-gray-950' : ''}`}
                  onClick={() => handleModuleClick(module)}
                  role="button"
                  tabIndex={0}
                  data-testid={`world-card-${module.id}`}
                  style={{ minHeight: '180px' }}
                >
                  {/* Background Image */}
                  {module.image ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ 
                        backgroundImage: `url(${module.image})`,
                      }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-40`} />
                  )}
                  
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300" />
                  
                  {/* Subtle accent border on hover */}
                  <div className="absolute inset-0 rounded-xl border border-white/5 group-hover:border-amber-500/30 transition-colors duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-5">
                    {/* World Name - Primary */}
                    <h3 className="text-xl font-semibold text-white tracking-tight mb-1 group-hover:text-amber-100 transition-colors">
                      {module.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {module.description}
                    </p>
                    
                    {/* Last used indicator */}
                    {isCurrentWorld && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs text-amber-400/90 font-medium tracking-wide">Last used</span>
                      </div>
                    )}
                    
                    {/* Subtle accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${module.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="module-grid-container" style={{ marginTop: '2rem' }}>
          <div className="px-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-500/70 uppercase tracking-[0.2em]">Coming Soon</h3>
            <div className="h-px w-12 bg-gradient-to-r from-amber-500/40 to-transparent mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
            {comingSoonWorlds.map((module) => {
              return (
                <div
                  key={module.id}
                  className="group relative overflow-hidden rounded-xl cursor-default"
                  role="presentation"
                  title="This world is opening in a future phase"
                  style={{ minHeight: '140px' }}
                >
                  {/* Background - gradient with color */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-15 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/60" />
                  
                  {/* Border - subtle but visible */}
                  <div className={`absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/15 transition-colors duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-5">
                    {/* World Name */}
                    <h3 className="text-lg font-semibold text-white/90 tracking-tight mb-1">
                      {module.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400">
                      {module.description}
                    </p>
                    
                    {/* Coming Soon Badge - warm amber accent */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${module.gradient} bg-opacity-20 text-white/80`}
                        style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))`, opacity: 0.15 }}>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 font-medium tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${module.gradient}`} />
                        Opening Soon
                      </span>
                    </div>
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
