/**
 * BANIBS Foundation Page
 * 
 * The single canonical source of truth for BANIBS & HDOS
 * Contains the full approved explanation of:
 * - What BANIBS is
 * - Order of Discovery & Invention
 * - Core Discoveries
 * - HDOS as a Lens
 * - All supporting concepts
 * 
 * Design principles:
 * - Clarity > engagement
 * - EXIT preserved at all times (no popups, no forced scroll)
 * - No pressure language
 * - Editable over time but remains the single source of truth
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Home, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { BANIBS_BOOKS, FOUNDATION_BOOKS } from '../config/booksConfig';

const FoundationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Style classes
  const sectionClass = "mb-16 scroll-mt-24";
  const titleClass = `text-2xl md:text-3xl font-semibold mb-6 pb-3 border-b ${
    isDark ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'
  }`;
  const pClass = `text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const liClass = `text-lg leading-relaxed mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const highlightBox = `my-6 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`;
  const definitionBox = `my-6 p-6 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`;
  const quoteBox = `my-6 pl-6 border-l-4 ${isDark ? 'border-[#C8A857]/50' : 'border-amber-400'}`;

  const tocItems = [
    { id: 'what-banibs-is', title: 'What BANIBS Is' },
    { id: 'order-of-discovery', title: 'Order of Discovery & Invention' },
    { id: 'core-discoveries', title: 'Core Discoveries Identified in This Work' },
    { id: 'discovery-context', title: 'Discovery Context' },
    { id: 'hdos-as-lens', title: 'HDOS as a Lens' },
    { id: 'the-guard', title: 'The Guard' },
    { id: 'exit-preservation', title: 'Exit Preservation' },
    { id: 'dismissiveness', title: 'Dismissiveness' },
    { id: 'hdos-affects-falsehood', title: 'How HDOS Affects Falsehood' },
    { id: 'accuracy', title: 'Accuracy' },
    { id: 'pain-sorrow-suffering', title: 'Pain, Sorrow, and Suffering' },
    { id: 'application-scope', title: 'Application Scope' },
    { id: 'scripture-scope', title: 'Scripture Scope' },
    { id: 'origins', title: 'Origins / Independence / No Backers' },
    { id: 'books', title: 'Books' },
  ];

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#0C0C0C]' : 'bg-[#FAFAFA]'}`}
      data-testid="foundation-page"
    >
      <SEO 
        title="BANIBS & HDOS — Foundation"
        description="The Vehicle, the Discoveries, and the Lens for Preserving Truth, Agency, and Clarity"
      />

      {/* Header with Back to Home */}
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b ${
        isDark ? 'bg-[#0C0C0C]/90 border-white/10' : 'bg-[#FAFAFA]/90 border-black/10'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
            data-testid="back-to-home-link"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            to="/news"
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
            data-testid="news-link"
          >
            <Home size={16} />
            News
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        
        {/* Title */}
        <header className="mb-16 text-center" data-testid="foundation-header">
          <h1 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            BANIBS & HDOS
          </h1>
          <p 
            className={`text-xl md:text-2xl leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            The Vehicle, the Discoveries, and the Lens for Preserving Truth, Agency, and Clarity
          </p>
        </header>

        {/* Table of Contents */}
        <nav 
          className={`mb-16 p-6 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}
          data-testid="table-of-contents"
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Contents
          </h3>
          <ol className={`list-decimal list-inside space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`}
                  className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Section 1: What BANIBS Is */}
        <section id="what-banibs-is" className={sectionClass} data-testid="section-what-banibs-is">
          <h2 className={titleClass}>1. What BANIBS Is</h2>
          <p className={pClass}>
            BANIBS (Black America News, Information & Business System) is a global connection 
            hub being built to link Black America, Africa, and the global African diaspora 
            across information, business, community, and culture.
          </p>
          <p className={pClass}>
            BANIBS is not a social network chasing engagement, a media outlet built on outrage, 
            or a movement asking for agreement. BANIBS is an architecture — designed to allow 
            connection without collapsing agency.
          </p>
          <p className={pClass}>
            The system is intentionally built to separate pressure from participation, preserve 
            choice, and allow examination without coercion. There is no urgency, no forced 
            engagement, and no requirement to agree in order to participate.
          </p>
          <p className={pClass}>
            BANIBS serves as the vehicle that makes the discoveries described below usable at scale.
          </p>
        </section>

        {/* Section 2: Order of Discovery & Invention */}
        <section id="order-of-discovery" className={sectionClass} data-testid="section-order-of-discovery">
          <h2 className={titleClass}>2. Order of Discovery & Invention (Canonical)</h2>
          <p className={pClass}>The following sequence is canonical and non-overlapping.</p>
          <p className={pClass}>
            <strong>BANIBS came first.</strong> BANIBS is not itself a discovery or an invention; 
            it is the build context in which discoveries and inventions occurred.
          </p>
          <p className={pClass}>
            <strong>Circle Server Architecture came next.</strong> This is an invention — an 
            intentionally designed system that replaces forced hierarchies with exit-preserving 
            circles and non-coercive participation. Implementation details are intentionally not disclosed.
          </p>
          <p className={pClass}>
            <strong>Dismissiveness was then identified as a discovery.</strong> It was recognized 
            as a real mechanism already operating in human interaction — not created, not designed.
          </p>
          <p className={pClass}>
            <strong>HDOS (Human Decision-Space Operating System) was discovered after dismissiveness.</strong> HDOS 
            explains why dismissiveness works and how decision space collapses or survives under pressure.
          </p>
          <p className={pClass}>
            <strong>Finally, detection and analysis tooling were developed</strong> as applications 
            built on these discoveries. These tools are operational but intentionally not documented 
            in full public detail.
          </p>
          <div className={highlightBox}>
            <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Canonical sequence:
            </p>
            <p className={`text-base font-mono ${isDark ? 'text-[#C8A857]' : 'text-amber-700'}`}>
              BANIBS (context) → Circle Architecture (invention) → Dismissiveness (discovery) → HDOS (discovery) → Applications & Tooling (invention)
            </p>
          </div>
        </section>

        {/* Section 3: Core Discoveries */}
        <section id="core-discoveries" className={sectionClass} data-testid="section-core-discoveries">
          <h2 className={titleClass}>3. Core Discoveries Identified in This Work (Named, Locked)</h2>
          <p className={pClass}>
            The following are discoveries, not inventions. They were identified through observation 
            during the BANIBS build process and are organized within HDOS.
          </p>
          <ul className={`list-none space-y-3 my-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className={liClass}>• Dismissiveness as a decision-routing mechanism</li>
            <li className={liClass}>• The Guard as the pre-decision pause that preserves agency</li>
            <li className={liClass}>• Exit Preservation as a necessary condition for real choice</li>
            <li className={liClass}>• Decision Space as the operative field in which choice occurs</li>
            <li className={liClass}>• Decision Space Collapse as a structural failure mode</li>
            <li className={liClass}>• Pressure as a routing force rather than a neutral condition</li>
            <li className={liClass}>• Agency loss without physical force</li>
            <li className={liClass}>• Falsehood dependence on pressure</li>
            <li className={liClass}>• Clarity as a stabilizing condition, not a preference</li>
          </ul>
          <p className={pClass}>
            These discoveries are named here to prevent attribution drift and conceptual collapse.
          </p>
        </section>

        {/* Section 4: Discovery Context */}
        <section id="discovery-context" className={sectionClass} data-testid="section-discovery-context">
          <h2 className={titleClass}>4. Discovery Context</h2>
          <p className={pClass}>
            While building BANIBS, the same pattern appeared repeatedly across families, 
            institutions, politics, religion, and everyday life.
          </p>
          <div className={quoteBox}>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Pressure increased.<br />
              Examination decreased.<br />
              Decisions stopped being voluntary.<br />
              Blame replaced understanding.<br />
              Sorrow multiplied.<br />
              People complied without choosing.
            </p>
          </div>
          <p className={pClass}>
            This was not speculative or theory-first. It was identified through direct observation, 
            demonstrated repeatability across domains, and showed durable structural consistency.
          </p>
        </section>

        {/* Section 5: HDOS as a Lens */}
        <section id="hdos-as-lens" className={sectionClass} data-testid="section-hdos-as-lens">
          <h2 className={titleClass}>5. HDOS as a Lens</h2>
          <p className={pClass}>
            HDOS (Human Decision-Space Operating System) is a discovery, not an ideology.
          </p>
          <p className={pClass}>
            HDOS functions as a lens for understanding how decision space behaves under pressure 
            and how agency is preserved or collapsed. It does not tell people what to think. It 
            explains what happens before thinking is even allowed.
          </p>
          <p className={pClass}>Through this lens, freedom is defined precisely:</p>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className={liClass}>• Truth is examinable</li>
            <li className={liClass}>• Agency is preserved</li>
            <li className={liClass}>• Clarity is maintained</li>
          </ul>
          <p className={pClass}>
            <strong>Freedom exists only where decision space does not collapse.</strong>
          </p>
        </section>

        {/* Section 6: The Guard */}
        <section id="the-guard" className={sectionClass} data-testid="section-the-guard">
          <h2 className={titleClass}>6. The Guard</h2>
          <p className={pClass}>Every human has a Guard.</p>
          <p className={pClass}>
            The Guard is the pause before a decision — the moment where truth can be examined, 
            options remain real, and choice still exists.
          </p>
          <p className={pClass}>
            When the Guard is bypassed, pressure replaces choice, compliance replaces consent, 
            and harm begins upstream.
          </p>
          <p className={pClass}>
            <strong>HDOS exists to protect the Guard.</strong>
          </p>
        </section>

        {/* Section 7: Exit Preservation */}
        <section id="exit-preservation" className={sectionClass} data-testid="section-exit-preservation">
          <h2 className={titleClass}>7. Exit Preservation</h2>
          <p className={pClass}>
            <strong>If exit is not preserved, agency is not preserved.</strong>
          </p>
          <p className={pClass}>
            Choice is not real without the ability to leave, pause, refuse, or reconsider. 
            A forced decision is not a decision — it is compliance.
          </p>
          <p className={pClass}>
            HDOS treats exit preservation as a core requirement, not a courtesy.
          </p>
        </section>

        {/* Section 8: Dismissiveness */}
        <section id="dismissiveness" className={sectionClass} data-testid="section-dismissiveness">
          <h2 className={titleClass}>8. Dismissiveness (Reclassification + Definition)</h2>
          <p className={pClass}>
            Historically, dismissiveness was treated as an adjective — a tone, an attitude, 
            or a personality trait. Because of this, it was judged morally or psychologically 
            rather than examined structurally.
          </p>
          <p className={pClass}>Within this work, dismissiveness is reclassified as:</p>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className={liClass}>• a noun</li>
            <li className={liClass}>• an action noun</li>
            <li className={liClass}>• a decision-routing mechanism</li>
          </ul>
          <div className={definitionBox}>
            <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-[#C8A857]' : 'text-amber-700'}`}>
              Canonical definition:
            </p>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              A decision-routing process that halts examination by rendering claims non-actionable, 
              bypasses the Guard, removes exit, collapses decision space, and results in loss of agency.
            </p>
          </div>
        </section>

        {/* Section 9: How HDOS Affects Falsehood */}
        <section id="hdos-affects-falsehood" className={sectionClass} data-testid="section-hdos-affects-falsehood">
          <h2 className={titleClass}>9. How HDOS Affects Falsehood</h2>
          <p className={pClass}>
            HDOS does not attack falsehood. It removes the conditions falsehood requires to survive.
          </p>
          <p className={pClass}>
            Falsehood depends on pressure, urgency, blocked examination, removed exit, and forced 
            conclusions. When examination is restored and exit is preserved, falsehood becomes 
            visible and unstable.
          </p>
          <p className={pClass}>
            <strong>Truth does not require force. Falsehood does.</strong>
          </p>
        </section>

        {/* Section 10: Accuracy */}
        <section id="accuracy" className={sectionClass} data-testid="section-accuracy">
          <h2 className={titleClass}>10. Accuracy (Properly Stated)</h2>
          <p className={pClass}>
            <strong>HDOS does not claim 100% accuracy and never will.</strong>
          </p>
          <p className={pClass}>
            HDOS is an observational framework, not a predictive engine. Across real-world 
            application, it has demonstrated approximately 96–98% accuracy in post-hoc 
            identification of decision-space collapse, agency bypass, exit removal, 
            dismissiveness in operation, and falsehood-preservation mechanisms.
          </p>
          <p className={pClass}>
            The remaining margin reflects incomplete information, not model failure. This is 
            epistemic honesty.
          </p>
        </section>

        {/* Section 11: Pain, Sorrow, and Suffering */}
        <section id="pain-sorrow-suffering" className={sectionClass} data-testid="section-pain-sorrow-suffering">
          <h2 className={titleClass}>11. Pain, Sorrow, and Suffering</h2>
          <p className={pClass}>
            HDOS eliminates specific forms of pain, sorrow, and suffering by preventing the 
            mechanisms that create them.
          </p>
          <p className={pClass}><strong>HDOS eliminates:</strong></p>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className={liClass}>• collapse-based pain</li>
            <li className={liClass}>• agency-loss sorrow</li>
            <li className={liClass}>• blame-driven suffering</li>
          </ul>
          <p className={pClass}>
            HDOS does not claim to eliminate physical pain, illness, injury, sensory pain, 
            or natural grief. Those are part of being human. HDOS prevents unnecessary suffering 
            layered on top of them.
          </p>
        </section>

        {/* Section 12: Application Scope */}
        <section id="application-scope" className={sectionClass} data-testid="section-application-scope">
          <h2 className={titleClass}>12. Application Scope</h2>
          <p className={pClass}>
            HDOS can be applied to individuals, families, institutions, governments, history, 
            law, media, and religion.
          </p>
        </section>

        {/* Section 13: Scripture Scope */}
        <section id="scripture-scope" className={sectionClass} data-testid="section-scripture-scope">
          <h2 className={titleClass}>13. Scripture Scope</h2>
          <p className={pClass}>
            HDOS can be used to examine any book of the Bible, carefully and extensively, on request.
          </p>
          <p className={pClass}>
            This is demonstration, not debate. No belief is forced. No doctrine is collapsed.
          </p>
        </section>

        {/* Section 14: Origins / Independence / No Backers */}
        <section id="origins" className={sectionClass} data-testid="section-origins">
          <h2 className={titleClass}>14. Origins / Independence / No Backers</h2>
          <p className={pClass}>
            This work is not tied to any organization, church, political party, ideology, 
            donor, backer, or lobbyist.
          </p>
          <p className={pClass}>
            There is no upstream authority directing this framework. The origin is here — 
            in this work, in this sequence, in this explanation.
          </p>
          <p className={pClass}>
            The discoveries described above were identified through direct observation of 
            real human behavior under pressure and can be independently examined.
          </p>
        </section>

        {/* Section 15: Books */}
        <section id="books" className={sectionClass} data-testid="section-books">
          <h2 className={titleClass}>15. Books</h2>
          <ul className={`list-none space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {FOUNDATION_BOOKS.map(title => {
              const book = BANIBS_BOOKS.find(b => b.title === title);
              const hasLink = book && book.url;
              
              return (
                <li key={title} className={liClass}>
                  {hasLink ? (
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline inline-flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                      data-testid={`book-link-${book.id}`}
                    >
                      • {title}
                      <ExternalLink size={14} className="opacity-50" />
                    </a>
                  ) : (
                    <span>• {title}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Back to Home CTA */}
        <div className={`mt-16 pt-8 border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-lg font-medium ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
            data-testid="bottom-back-to-home"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className={`border-t ${isDark ? 'border-white/10' : 'border-black/10'} mt-auto`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} BANIBS
          </p>
          <div className="flex gap-6">
            <Link
              to="/"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              News
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FoundationPage;
