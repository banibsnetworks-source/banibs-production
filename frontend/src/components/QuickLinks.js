import React from 'react';

/**
 * QuickLinks Component
 * 
 * CRITICAL: This component is MANDATORY on the BANIBS homepage.
 * It communicates the full ecosystem (Social, Business, Information, Education, Youth, Opportunities, Resources).
 * 
 * DO NOT REMOVE from HomePage.js without team approval.
 * 
 * See: /docs/BANIBS_NARRATIVE_GUIDE.md for reasoning.
 */

const QuickLinks = () => {
  const links = [
    { label: 'Social', href: '#social', icon: '💬', coming: true },
    { label: 'Business', href: '#business', icon: '🏢', coming: true },
    { label: 'Information', href: '/opportunities', icon: '📰', coming: false },
    { label: 'Education', href: '#education', icon: '🎓', coming: true },
    { label: 'Youth', href: '#youth', icon: '👥', coming: true },
    { label: 'Opportunities', href: '/opportunities', icon: '💼', coming: false },
    { label: 'Resources', href: '#resources', icon: '📚', coming: true }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6" data-testid="banibs-quick-links">
      <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-lg">🌐</span>
        <span>Explore BANIBS</span>
      </h2>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-1.5"
            title={link.coming ? `${link.label} - Coming Soon` : link.label}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
            {link.coming && (
              <span className="text-xs text-gray-500">(Soon)</span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export default QuickLinks;
