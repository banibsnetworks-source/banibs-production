import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MessageCircle, Heart, Shield,
  ChevronDown, ChevronUp, BookOpen, HelpCircle
} from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BANIBS Social Landing Page (A6)
 * The front door to BANIBS Social - warm, welcoming, dignified
 * Now with theme-aware styling (respects global dark/light toggle)
 */
const SocialLandingPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: 'Is BANIBS free?',
      answer: 'Yes. BANIBS Social is free to join and use.'
    },
    {
      question: 'Who can join?',
      answer: 'Anyone who aligns with our values of peace, dignity, and community.'
    },
    {
      question: 'How is BANIBS different?',
      answer: 'No chaos, no harassment, no algorithmic pressure. Just calm, culture-centered connection.'
    },
    {
      question: 'Can I delete my account anytime?',
      answer: 'Yes. You always have control over your data.'
    },
    {
      question: 'How do I report problems?',
      answer: 'Use the in-app support tools or visit the BANIBS Support Center.'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Create Your Circle',
      description: 'Build your community through trust and real connections.'
    },
    {
      icon: MessageCircle,
      title: 'Share Your Voice',
      description: 'Post thoughts, images, moments - at your pace.'
    },
    {
      icon: Heart,
      title: 'Stay In The Loop',
      description: 'See updates from people you care about.'
    },
    {
      icon: Shield,
      title: 'Build Safely',
      description: 'BANIBS protects your experience with community-first design.'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Create your account',
      description: 'Just your name, email, and password - fast and simple.'
    },
    {
      step: '2',
      title: 'Build your profile',
      description: 'Add a photo, a short intro, or skip and come back later.'
    },
    {
      step: '3',
      title: 'Find your circles',
      description: 'Family, friends, communities, interests - start with what matters to you.'
    },
    {
      step: '4',
      title: 'Explore the calm home feed',
      description: 'Curated updates designed to keep you informed, not overwhelmed.'
    },
    {
      step: '5',
      title: 'Need help?',
      description: 'Visit Help Center, Safety Guide, or New User Tips.'
    }
  ];

  const helpLinks = [
    { icon: BookOpen, text: 'New User Guide' },
    { icon: Shield, text: 'Community Rules' },
    { icon: Shield, text: 'Safety & Privacy Center' },
    { icon: Shield, text: 'How BANIBS Protects You' },
    { icon: HelpCircle, text: 'Contact Support' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Global Navigation Bar */}
      <GlobalNavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-5 text-center overflow-hidden">
        {/* Background gradient - blue tones */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: theme === 'dark' 
              ? 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 40%)'
              : 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(99, 102, 241, 0.05) 0%, transparent 40%)'
          }}
        />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-7 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Welcome to BANIBS Social
          </h1>
          
          <p className="text-xl md:text-2xl font-medium mb-6 text-blue-400 dark:text-blue-400">
            A calm, beautiful space to connect, share, grow, and belong.
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your digital community home — built to uplift, empower, and center our people with dignity, peace, and purpose.
          </p>
        </div>
      </section>

      {/* What is BANIBS Social? */}
      <section className="py-16 md:py-20 px-5 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 text-blue-500 dark:text-blue-400">
            What is BANIBS Social?
          </h2>
          
          <div className="text-base md:text-lg text-muted-foreground text-left space-y-6 leading-relaxed">
            <p>
              BANIBS Social is a welcoming, dignified digital home for our community - built for safety, belonging, and honest connection.
            </p>
            <p>
              There is no pressure here. You can move at your own pace. Share your voice, uplift others, and enjoy a calmer alternative to mainstream social platforms.
            </p>
            <p>
              Our design puts peace first. No chaos. No noise. Just a beautiful space to grow.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Feature Cards */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center text-blue-500 dark:text-blue-400">
            How BANIBS Social Works
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-12 rounded-full" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-200"
              >
                <feature.icon className="w-10 h-10 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New User Welcome Steps */}
      <section className="py-16 md:py-20 px-5 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 text-center text-blue-500 dark:text-blue-400">
            First time here? Let's get you settled.
          </h2>
          
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
            {steps.map((item, i) => (
              <div 
                key={i} 
                className={`relative pl-14 ${i < steps.length - 1 ? 'mb-8' : ''}`}
              >
                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold mb-1 text-foreground">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
            
            <p className="text-sm mt-8 text-center text-blue-500 dark:text-blue-400 italic font-medium">
              You can take your time. BANIBS grows with you.
            </p>
          </div>
        </div>
      </section>

      {/* Sign In / Create Account CTA */}
      <section className="py-16 md:py-20 px-5 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-card border-2 border-blue-500/30 rounded-2xl p-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-8 text-foreground">
              Ready to join?
            </h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <button
                onClick={() => navigate('/auth/signin')}
                className="w-full py-4 px-8 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                Sign In
              </button>
              
              <button
                onClick={() => navigate('/auth/register')}
                className="w-full py-4 px-8 text-lg font-bold bg-transparent text-blue-500 border-2 border-blue-500 rounded-xl hover:bg-blue-500/10 hover:scale-[1.02] transition-all duration-200"
              >
                Create Account
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="text-lg">✨</span>
              Safe, private, and designed for our community's peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="py-16 md:py-20 px-5 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 text-center text-blue-500 dark:text-blue-400">
            Frequently Asked Questions
          </h2>
          
          <div className="flex flex-col gap-3">
            {faqItems.map((item, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.question}
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help & Support Links */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center text-blue-500 dark:text-blue-400">
            Need help or have questions? We're here.
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
            {helpLinks.map((link, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-xl p-5 text-center cursor-pointer hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-md transition-all duration-200"
              >
                <link.icon className="w-7 h-7 mx-auto mb-3 text-blue-500" />
                <p className="text-sm font-semibold text-foreground">
                  {link.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-5 bg-muted/30 text-center">
        <p className="text-sm tracking-widest font-medium text-muted-foreground">
          Peace • Beauty • Dignity • Community
        </p>
      </footer>
    </div>
  );
};

export default SocialLandingPage;
