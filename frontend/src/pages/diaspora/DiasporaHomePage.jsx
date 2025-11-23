import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, MapPin, BookHeart, Building2, GraduationCap, User } from 'lucide-react';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaHomePage - Phase 12.0
 * Main landing page for Diaspora Connect Portal
 */
const DiasporaHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sections = [
    {
      icon: MapPin,
      title: 'Regions & Hubs',
      description: 'Explore Black communities across the globe',
      path: '/portal/diaspora/regions',
      color: '#d97706'
    },
    {
      icon: BookHeart,
      title: 'Stories & Journeys',
      description: 'Read and share diaspora experiences',
      path: '/portal/diaspora/stories',
      color: '#b45c06'
    },
    {
      icon: Building2,
      title: 'Business Directory',
      description: 'Connect with diaspora businesses worldwide',
      path: '/portal/diaspora/businesses',
      color: '#92400e'
    },
    {
      icon: GraduationCap,
      title: 'Learn the Diaspora',
      description: 'Educational resources on Black global history',
      path: '/portal/diaspora/learn',
      color: '#78350f'
    },
    {
      icon: User,
      title: 'My Diaspora Snapshot',
      description: 'Share your personal diaspora context',
      path: '/portal/diaspora/snapshot',
      color: '#b8860b'
    }
  ];
  
  return (
    <DiasporaLayout>
      {/* Hero Section */}
      <div 
        className="py-16 px-4 rounded-2xl mb-8"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(180, 130, 50, 0.1) 0%, rgba(180, 130, 50, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(180, 130, 50, 0.08) 0%, rgba(180, 130, 50, 0.04) 100%)',
          border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.2)' : 'rgba(180, 130, 50, 0.15)'}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              background: isDark 
                ? 'rgba(180, 130, 50, 0.2)'
                : 'rgba(180, 130, 50, 0.15)',
              border: '2px solid rgba(180, 130, 50, 0.3)'
            }}
          >
            <Globe size={40} className="text-amber-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Diaspora Connect
          </h1>
          
          <p className="text-2xl md:text-3xl font-semibold mb-6 text-amber-600">
            One People. Many Homes. One Connection.
          </p>
          
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Connecting the global Black diaspora through stories, businesses, and shared heritage. 
            From the Caribbean to West Africa, from North America to Europe—we are one family, 
            spread across the world but forever linked.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20">
            <span className="text-sm font-medium text-amber-600">
              🌍 200+ million strong across every continent
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left"
              style={{
                background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
                border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
                }}
              >
                <Icon size={24} style={{ color: section.color }} />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {/* About Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
          border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
        }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          What is the Diaspora?
        </h2>
        
        <div className="space-y-3 text-muted-foreground">
          <p>
            The African diaspora represents over 200 million people of African descent living 
            outside the African continent. We are connected by heritage, shaped by migration, 
            and united by shared experiences across generations.
          </p>
          
          <p>
            From the forced migrations of the transatlantic slave trade to the Great Migration, 
            from Caribbean island nations to European cities, from return-to-Africa movements to 
            modern global networks—our story is one of resilience, creativity, and power.
          </p>
          
          <p className="font-medium text-foreground">
            Diaspora Connect is your hub to explore these connections, share your story, 
            support diaspora businesses, and learn our collective history.
          </p>
        </div>
      </div>
    </DiasporaLayout>
  );
};

export default DiasporaHomePage;
