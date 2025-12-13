import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { getBookBySlug, getStatusConfig } from '../../data/dSeriesBooks';

/**
 * D-Series Book Detail Page
 * Dynamic template for individual book pages
 */
const BookDetailPage = () => {
  const { slug } = useParams();
  const book = getBookBySlug(slug);

  // If book not found, redirect to series hub
  if (!book) {
    return <Navigate to="/insights/revelations" replace />;
  }

  const statusConfig = getStatusConfig(book.status);

  return (
    <>
      <SEO 
        title={`${book.title} - D-Series - BANIBS`}
        description={book.descriptionShort}
      />
      <main className="min-h-screen bg-gray-950">
        {/* Hero Block */}
        <section className="relative py-12 px-4" style={{
          background: 'radial-gradient(circle at top, #0B1726 0%, #04060A 45%, #000000 100%)'
        }}>
          {/* Blue glow */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-15 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #42B5FF 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
              <span>›</span>
              <Link to="/insights/devils-dismissive-argument" className="hover:text-yellow-500 transition-colors">Insights</Link>
              <span>›</span>
              <Link to="/insights/revelations" className="hover:text-yellow-500 transition-colors">D-Series</Link>
              <span>›</span>
              <span className="text-gray-300">{book.title}</span>
            </div>

            {/* Code + Status */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="px-4 py-2 rounded-lg text-lg font-bold"
                style={{
                  background: book.highlightColor || '#D4AF37',
                  color: '#000000'
                }}
              >
                {book.code}
              </span>
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  color: statusConfig.color,
                  background: statusConfig.bgColor,
                  border: `1px solid ${statusConfig.borderColor}`
                }}
              >
                {statusConfig.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {book.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl text-gray-300 mb-4">
              {book.subtitle}
            </h2>

            {/* Author Line */}
            <p className="text-gray-400 mb-6">
              by <span className="font-semibold" style={{ color: '#D4AF37' }}>Raymond Al Zedeck</span>
            </p>

            {/* Type Tag */}
            <div className="inline-block px-4 py-2 rounded-lg text-sm font-semibold mb-6"
              style={{
                background: 'rgba(66, 181, 255, 0.1)',
                color: '#42B5FF',
                border: '1px solid rgba(66, 181, 255, 0.3)'
              }}
            >
              {book.code} — {book.type === 'manual' ? 'Framework Manual' : book.type === 'core' ? 'Core Revelation' : 'Volume'}: {book.title}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* What This Book Reveals */}
            <div className="bg-black rounded-2xl p-8 border-2" style={{
              borderColor: book.highlightColor || '#D4AF37',
              boxShadow: '0 0 40px rgba(66, 181, 255, 0.15)'
            }}>
              <h3 className="text-2xl font-bold text-white mb-6">What This Book Reveals</h3>
              
              <div className="space-y-4 text-gray-300 leading-relaxed whitespace-pre-line">
                {book.descriptionLong}
              </div>
            </div>

            {/* Who This Book Is For */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Who This Book Is For</h3>
              
              <div className="grid gap-3 md:grid-cols-2">
                {book.primaryAudienceTags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 rounded-lg border"
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderColor: 'rgba(66, 181, 255, 0.3)',
                      color: '#42B5FF'
                    }}
                  >
                    <span className="capitalize">{tag.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How This Book Can Be Taught */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">How This Book Can Be Taught</h3>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">For Churches / Mosques / Synagogues:</h4>
                  <p className="leading-relaxed">
                    Use this book as a teaching series on truth, accountability, and spiritual integrity. 
                    Each chapter can be broken down into sermon points or small group discussions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">For Schools / Universities:</h4>
                  <p className="leading-relaxed">
                    Integrate into conflict resolution, psychology, communication, or ethics curricula. 
                    Helps students recognize manipulative patterns and develop critical thinking.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">For Counselors / Therapists:</h4>
                  <p className="leading-relaxed">
                    Use as a diagnostic framework for understanding client confusion around accountability, 
                    guilt, and family dynamics. Especially valuable for trauma-informed care.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">For Family / Conflict Resolution Work:</h4>
                  <p className="leading-relaxed">
                    Teach families how to restore cause-and-effect understanding in their relationships. 
                    Helps parents raise emotionally intelligent children who can navigate complex situations.
                  </p>
                </div>
              </div>
            </div>

            {/* "Before You Call It Out" - Companion Bridge (only for Book 1) */}
            {book.slug === 'the-devils-dismissive-argument' && (
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Before You Call It Out
                </h3>
                <p className="text-sm text-gray-500 italic mb-4">
                  A forthcoming companion reflection
                </p>
                
                <div className="text-gray-400 text-sm leading-relaxed space-y-3">
                  <p>
                    This book focuses on <span className="text-amber-500">recognition</span> — 
                    helping name a pattern many have experienced but struggled to explain.
                  </p>
                  <p>
                    But recognition is not the same as response.
                  </p>
                  <p>
                    <span className="text-white">"Before You Call It Out"</span> is a companion work in development. 
                    It explores when speaking helps — and when it hardens everything.
                  </p>
                  <p className="text-gray-500 pt-2 border-t border-gray-800">
                    Some moments call for clarity. Others call for patience.<br />
                    <span className="text-white">Knowing the difference matters.</span>
                  </p>
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="bg-black rounded-2xl p-8 border-2 text-center" style={{
              borderColor: book.highlightColor || '#D4AF37',
              boxShadow: '0 0 40px rgba(66, 181, 255, 0.15)'
            }}>
              <h3 className="text-2xl font-bold text-white mb-4">Get This Book</h3>
              
              {book.status === 'available' && (book.kdpPaperbackLink || book.kdpEbookLink) ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {book.kdpPaperbackLink && (
                    <a
                      href={book.kdpPaperbackLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-lg font-bold text-black text-lg transition-transform hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${book.highlightColor || '#D4AF37'} 0%, #BF9B30 100%)`,
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      Order Paperback on Amazon
                    </a>
                  )}
                  
                  {book.kdpEbookLink && (
                    <a
                      href={book.kdpEbookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-colors hover:bg-white/5"
                      style={{
                        borderColor: book.highlightColor || '#D4AF37',
                        color: book.highlightColor || '#D4AF37'
                      }}
                    >
                      Read on Kindle
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300 text-lg">
                    {book.status === 'in_review' 
                      ? 'This title is currently in review with Amazon KDP and will be available soon.' 
                      : 'This title is coming soon. Stay tuned for release updates.'}
                  </p>
                  <Link
                    to="/insights/revelations"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-white border-2 transition-colors hover:bg-white/5"
                    style={{ borderColor: '#42B5FF' }}
                  >
                    View All D-Series Books
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="py-8 px-4 border-t border-gray-900">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4 text-sm text-gray-500">
            <div>
              <p>
                {book.title} by{' '}
                <span className="font-semibold" style={{ color: '#D4AF37' }}>Raymond Al Zedeck</span>
              </p>
              <p className="mt-1">© 2025 Prime Nation Holdings LLC</p>
            </div>
            <Link
              to="/insights/revelations"
              className="text-yellow-500 hover:text-yellow-400 transition-colors font-semibold"
            >
              ← Back to D-Series Library
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default BookDetailPage;
