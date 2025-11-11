import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * News Section Navigation Bar
 * Secondary navigation for news categories
 * Sticky below global bar, horizontal scroll on mobile
 */
const NewsNavigationBar = ({ activeSection, onSectionChange }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const sections = [
    { id: 'all', label: 'Top Stories', icon: '⭐' },
    { id: 'us', label: 'U.S.', icon: '🇺🇸' },
    { id: 'world', label: 'World', icon: '🌍' },
    { id: 'politics', label: 'Politics', icon: '⚖️' },
    { id: 'health', label: 'HealthWatch', icon: '🏥' },
    { id: 'money', label: 'MoneyWatch', icon: '💰' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'crime', label: 'Crime', icon: '🚨' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'culture', label: 'Culture', icon: '🎨' },
    { id: 'tech', label: 'Science & Tech', icon: '🔬' },
    { id: 'civil-rights', label: 'Civil Rights', icon: '✊' },
    { id: 'business', label: 'Business', icon: '📈' },
    { id: 'education', label: 'Education', icon: '🎓' },
  ];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 sticky top-14 z-40 shadow-md">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left Scroll Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-gray-900 to-transparent px-2 flex items-center justify-center hover:opacity-80"
              aria-label="Scroll left"
            >
              <ChevronLeft className="text-yellow-400" size={24} />
            </button>
          )}

          {/* Scrollable Sections */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`
                  flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-medium
                  whitespace-nowrap transition-all duration-200
                  ${
                    activeSection === section.id
                      ? 'bg-yellow-500 text-gray-900 font-bold'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                  }
                `}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          {/* Right Scroll Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-gray-900 to-transparent px-2 flex items-center justify-center hover:opacity-80"
              aria-label="Scroll right"
            >
              <ChevronRight className="text-yellow-400" size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsNavigationBar;
