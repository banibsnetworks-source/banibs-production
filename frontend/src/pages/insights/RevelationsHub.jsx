import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { getAllBooks, getStatusConfig } from '../../data/dSeriesBooks';

/**
 * D-Series Revelation Hub
 * Main landing page for Raymond Al Zedeck's book series
 */
const RevelationsHub = () => {
  const books = getAllBooks();

  return (
    <>
      <SEO 
        title="D-Series Revelation Library - BANIBS"
        description="A multi-volume revelation by Raymond Al Zedeck exposing how deception, diversion, distortion, and division operate in human life."
      />
      <main className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <section className="relative py-16 px-4" style={{
          background: 'radial-gradient(circle at top, #0B1726 0%, #04060A 45%, #000000 100%)'
        }}>
          {/* Blue glow effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #42B5FF 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
              <span>›</span>
              <Link to="/insights/devils-dismissive-argument" className="hover:text-yellow-500 transition-colors">Insights</Link>
              <span>›</span>
              <span className="text-gray-300">D-Series</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The D-Series Revelation Library
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed max-w-4xl">
              A multi-volume revelation by <span className="text-yellow-500 font-semibold">Raymond Al Zedeck</span> exposing 
              how deception, diversion, distortion, and division operate in human life.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/insights/books/the-devils-dismissive-argument"
                className="px-6 py-3 rounded-lg font-semibold text-black transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #BF9B30 100%)',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
                }}
              >
                View Book 1: The Devil's Dismissive Argument
              </Link>
              <a
                href="#about-series"
                className="px-6 py-3 rounded-lg font-semibold text-white border-2 transition-all duration-200 hover:bg-white/5"
                style={{ borderColor: '#42B5FF' }}
              >
                About the D-Series
              </a>
            </div>
          </div>
        </section>

        {/* Book Grid */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span>Current & Upcoming Volumes</span>
              <span className="text-sm text-gray-500 font-normal">({books.length} titles)</span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {books.map((book) => {
                const statusConfig = getStatusConfig(book.status);
                
                return (
                  <div
                    key={book.id}
                    className="relative overflow-hidden rounded-2xl p-6"
                    style={{
                      background: '#000000',
                      border: `2px solid ${book.highlightColor || '#D4AF37'}`,
                      boxShadow: `0 0 40px rgba(66, 181, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.6)`
                    }}
                  >
                    {/* Blue corner glow */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at top right, #42B5FF 0%, transparent 70%)'
                      }}
                    />

                    {/* Code Badge */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <span
                        className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{
                          background: book.highlightColor || '#D4AF37',
                          color: '#000000'
                        }}
                      >
                        {book.code}
                      </span>
                      
                      {/* Status Pill */}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          color: statusConfig.color,
                          background: statusConfig.bgColor,
                          border: `1px solid ${statusConfig.borderColor}`
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 relative z-10">
                      {book.subtitle}
                    </p>

                    {/* Short Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 relative z-10">
                      {book.descriptionShort}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-3 relative z-10">
                      <Link
                        to={`/insights/books/${book.slug}`}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white border transition-colors hover:bg-white/5"
                        style={{ borderColor: book.highlightColor || '#D4AF37' }}
                      >
                        View Details
                      </Link>
                      
                      {book.kdpPaperbackLink && (
                        <a
                          href={book.kdpPaperbackLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-black"
                          style={{
                            background: book.highlightColor || '#D4AF37'
                          }}
                        >
                          Paperback on Amazon
                        </a>
                      )}
                      
                      {book.kdpEbookLink && (
                        <a
                          href={book.kdpEbookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
                          style={{
                            borderColor: book.highlightColor || '#D4AF37',
                            color: book.highlightColor || '#D4AF37'
                          }}
                        >
                          Kindle Edition
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About the Series */}
        <section id="about-series" className="py-16 px-4 bg-black/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">About the D-Series</h2>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                The <span className="text-yellow-500 font-semibold">D-Series</span> is a comprehensive revelation 
                project by Raymond Al Zedeck that names and exposes the core mechanisms of deception operating in 
                human society.
              </p>
              
              <p>
                Each volume reveals a specific pattern—how it works, where it shows up, why it damages communities, 
                and how to recognize and dismantle it. These are not theories. These are documented spiritual and 
                psychological patterns that Raymond has observed, named, and now teaches.
              </p>

              <p>
                The D-Series is designed for:
              </p>
              
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Pastors, imams, rabbis, and spiritual leaders</li>
                <li>Counselors, therapists, and mental health professionals</li>
                <li>Educators, school administrators, and youth workers</li>
                <li>Community organizers and conflict resolution specialists</li>
                <li>Parents seeking to protect and empower their children</li>
                <li>Anyone committed to truth, accountability, and healing</li>
              </ul>

              <p className="pt-4 text-sm text-gray-500 border-t border-gray-800">
                More volumes will be released as they are completed. Each book stands alone but contributes to a 
                unified framework for understanding deception at every level.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Attribution */}
        <section className="py-8 px-4 border-t border-gray-900">
          <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
            <p>
              The D-Series Revelation Library by{' '}
              <span className="font-semibold" style={{ color: '#D4AF37' }}>Raymond Al Zedeck</span>
            </p>
            <p className="mt-1">© 2025 Prime Nation Holdings LLC. All rights reserved.</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default RevelationsHub;
