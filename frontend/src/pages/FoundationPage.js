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
import { ArrowLeft, Home } from 'lucide-react';
import SEO from '../components/SEO';

const FoundationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Section component for consistent styling
  const Section = ({ id, title, children }) => (
    <section 
      id={id} 
      className="mb-16 scroll-mt-24"
      data-testid={`section-${id}`}
    >
      <h2 
        className={`text-2xl md:text-3xl font-semibold mb-6 pb-3 border-b ${
          isDark ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'
        }`}
      >
        {title}
      </h2>
      <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
        {children}
      </div>
    </section>
  );

  // Paragraph component
  const P = ({ children }) => (
    <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
      {children}
    </p>
  );

  // List item component
  const Li = ({ children }) => (
    <li className={`text-lg leading-relaxed mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
      {children}
    </li>
  );

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
            to="/about"
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
            data-testid="back-to-home-link"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            to="/"
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
            {[
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
            ].map((item, index) => (
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
        <Section id="what-banibs-is" title="1. What BANIBS Is">
          <P>
            BANIBS (Black America News, Information & Business System) is a global connection 
            hub being built to link Black America, Africa, and the global African diaspora 
            across information, business, community, and culture.
          </P>
          <P>
            BANIBS is not a social network chasing engagement, a media outlet built on outrage, 
            or a movement asking for agreement. BANIBS is an architecture — designed to allow 
            connection without collapsing agency.
          </P>
          <P>
            The system is intentionally built to separate pressure from participation, preserve 
            choice, and allow examination without coercion. There is no urgency, no forced 
            engagement, and no requirement to agree in order to participate.
          </P>
          <P>
            BANIBS serves as the vehicle that makes the discoveries described below usable at scale.
          </P>
        </Section>

        {/* Section 2: Order of Discovery & Invention */}
        <Section id="order-of-discovery" title="2. Order of Discovery & Invention (Canonical)">
          <P>The following sequence is canonical and non-overlapping.</P>
          <P>
            <strong>BANIBS came first.</strong> BANIBS is not itself a discovery or an invention; 
            it is the build context in which discoveries and inventions occurred.
          </P>
          <P>
            <strong>Circle Server Architecture came next.</strong> This is an invention — an 
            intentionally designed system that replaces forced hierarchies with exit-preserving 
            circles and non-coercive participation. Implementation details are intentionally not disclosed.
          </P>
          <P>
            <strong>Dismissiveness was then identified as a discovery.</strong> It was recognized 
            as a real mechanism already operating in human interaction — not created, not designed.
          </P>
          <P>
            <strong>HDOS (Human Decision-Space Operating System) was discovered after dismissiveness.</strong> HDOS 
            explains why dismissiveness works and how decision space collapses or survives under pressure.
          </P>
          <P>
            <strong>Finally, detection and analysis tooling were developed</strong> as applications 
            built on these discoveries. These tools are operational but intentionally not documented 
            in full public detail.
          </P>
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Canonical sequence:
            </p>
            <p className={`text-base font-mono ${isDark ? 'text-[#C8A857]' : 'text-amber-700'}`}>
              BANIBS (context) → Circle Architecture (invention) → Dismissiveness (discovery) → HDOS (discovery) → Applications & Tooling (invention)
            </p>
          </div>
        </Section>

        {/* Section 3: Core Discoveries */}
        <Section id="core-discoveries" title="3. Core Discoveries Identified in This Work (Named, Locked)">
          <P>
            The following are discoveries, not inventions. They were identified through observation 
            during the BANIBS build process and are organized within HDOS.
          </P>
          <ul className={`list-none space-y-3 my-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Li>• Dismissiveness as a decision-routing mechanism</Li>
            <Li>• The Guard as the pre-decision pause that preserves agency</Li>
            <Li>• Exit Preservation as a necessary condition for real choice</Li>
            <Li>• Decision Space as the operative field in which choice occurs</Li>
            <Li>• Decision Space Collapse as a structural failure mode</Li>
            <Li>• Pressure as a routing force rather than a neutral condition</Li>
            <Li>• Agency loss without physical force</Li>
            <Li>• Falsehood dependence on pressure</Li>
            <Li>• Clarity as a stabilizing condition, not a preference</Li>
          </ul>
          <P>
            These discoveries are named here to prevent attribution drift and conceptual collapse.
          </P>
        </Section>

        {/* Section 4: Discovery Context */}
        <Section id="discovery-context" title="4. Discovery Context">
          <P>
            While building BANIBS, the same pattern appeared repeatedly across families, 
            institutions, politics, religion, and everyday life.
          </P>
          <div className={`my-6 pl-6 border-l-4 ${isDark ? 'border-[#C8A857]/50' : 'border-amber-400'}`}>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Pressure increased.<br />
              Examination decreased.<br />
              Decisions stopped being voluntary.<br />
              Blame replaced understanding.<br />
              Sorrow multiplied.<br />
              People complied without choosing.
            </p>
          </div>
          <P>
            This was not speculative or theory-first. It was identified through direct observation, 
            demonstrated repeatability across domains, and showed durable structural consistency.
          </P>
        </Section>

        {/* Section 5: HDOS as a Lens */}
        <Section id="hdos-as-lens" title="5. HDOS as a Lens">
          <P>
            HDOS (Human Decision-Space Operating System) is a discovery, not an ideology.
          </P>
          <P>
            HDOS functions as a lens for understanding how decision space behaves under pressure 
            and how agency is preserved or collapsed. It does not tell people what to think. It 
            explains what happens before thinking is even allowed.
          </P>
          <P>Through this lens, freedom is defined precisely:</P>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Li>• Truth is examinable</Li>
            <Li>• Agency is preserved</Li>
            <Li>• Clarity is maintained</Li>
          </ul>
          <P>
            <strong>Freedom exists only where decision space does not collapse.</strong>
          </P>
        </Section>

        {/* Section 6: The Guard */}
        <Section id="the-guard" title="6. The Guard">
          <P>Every human has a Guard.</P>
          <P>
            The Guard is the pause before a decision — the moment where truth can be examined, 
            options remain real, and choice still exists.
          </P>
          <P>
            When the Guard is bypassed, pressure replaces choice, compliance replaces consent, 
            and harm begins upstream.
          </P>
          <P>
            <strong>HDOS exists to protect the Guard.</strong>
          </P>
        </Section>

        {/* Section 7: Exit Preservation */}
        <Section id="exit-preservation" title="7. Exit Preservation">
          <P>
            <strong>If exit is not preserved, agency is not preserved.</strong>
          </P>
          <P>
            Choice is not real without the ability to leave, pause, refuse, or reconsider. 
            A forced decision is not a decision — it is compliance.
          </P>
          <P>
            HDOS treats exit preservation as a core requirement, not a courtesy.
          </P>
        </Section>

        {/* Section 8: Dismissiveness */}
        <Section id="dismissiveness" title="8. Dismissiveness (Reclassification + Definition)">
          <P>
            Historically, dismissiveness was treated as an adjective — a tone, an attitude, 
            or a personality trait. Because of this, it was judged morally or psychologically 
            rather than examined structurally.
          </P>
          <P>Within this work, dismissiveness is reclassified as:</P>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Li>• a noun</Li>
            <Li>• an action noun</Li>
            <Li>• a decision-routing mechanism</Li>
          </ul>
          <div className={`my-6 p-6 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-[#C8A857]' : 'text-amber-700'}`}>
              Canonical definition:
            </p>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              A decision-routing process that halts examination by rendering claims non-actionable, 
              bypasses the Guard, removes exit, collapses decision space, and results in loss of agency.
            </p>
          </div>
        </Section>

        {/* Section 9: How HDOS Affects Falsehood */}
        <Section id="hdos-affects-falsehood" title="9. How HDOS Affects Falsehood">
          <P>
            HDOS does not attack falsehood. It removes the conditions falsehood requires to survive.
          </P>
          <P>
            Falsehood depends on pressure, urgency, blocked examination, removed exit, and forced 
            conclusions. When examination is restored and exit is preserved, falsehood becomes 
            visible and unstable.
          </P>
          <P>
            <strong>Truth does not require force. Falsehood does.</strong>
          </P>
        </Section>

        {/* Section 10: Accuracy */}
        <Section id="accuracy" title="10. Accuracy (Properly Stated)">
          <P>
            <strong>HDOS does not claim 100% accuracy and never will.</strong>
          </P>
          <P>
            HDOS is an observational framework, not a predictive engine. Across real-world 
            application, it has demonstrated approximately 96–98% accuracy in post-hoc 
            identification of decision-space collapse, agency bypass, exit removal, 
            dismissiveness in operation, and falsehood-preservation mechanisms.
          </P>
          <P>
            The remaining margin reflects incomplete information, not model failure. This is 
            epistemic honesty.
          </P>
        </Section>

        {/* Section 11: Pain, Sorrow, and Suffering */}
        <Section id="pain-sorrow-suffering" title="11. Pain, Sorrow, and Suffering">
          <P>
            HDOS eliminates specific forms of pain, sorrow, and suffering by preventing the 
            mechanisms that create them.
          </P>
          <P><strong>HDOS eliminates:</strong></P>
          <ul className={`list-none space-y-2 my-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Li>• collapse-based pain</Li>
            <Li>• agency-loss sorrow</Li>
            <Li>• blame-driven suffering</Li>
          </ul>
          <P>
            HDOS does not claim to eliminate physical pain, illness, injury, sensory pain, 
            or natural grief. Those are part of being human. HDOS prevents unnecessary suffering 
            layered on top of them.
          </P>
        </Section>

        {/* Section 12: Application Scope */}
        <Section id="application-scope" title="12. Application Scope">
          <P>
            HDOS can be applied to individuals, families, institutions, governments, history, 
            law, media, and religion.
          </P>
        </Section>

        {/* Section 13: Scripture Scope */}
        <Section id="scripture-scope" title="13. Scripture Scope">
          <P>
            HDOS can be used to examine any book of the Bible, carefully and extensively, on request.
          </P>
          <P>
            This is demonstration, not debate. No belief is forced. No doctrine is collapsed.
          </P>
        </Section>

        {/* Section 14: Origins / Independence / No Backers */}
        <Section id="origins" title="14. Origins / Independence / No Backers">
          <P>
            This work is not tied to any organization, church, political party, ideology, 
            donor, backer, or lobbyist.
          </P>
          <P>
            There is no upstream authority directing this framework. The origin is here — 
            in this work, in this sequence, in this explanation.
          </P>
          <P>
            The discoveries described above were identified through direct observation of 
            real human behavior under pressure and can be independently examined.
          </P>
        </Section>

        {/* Section 15: Books */}
        <Section id="books" title="15. Books">
          <ul className={`list-none space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Li>• The Devil's Dismissive Argument</Li>
            <Li>• Before You Call It Out</Li>
            <Li>• The Devil's Deceitful Master Plan</Li>
            <Li>• The Light God Wants You to See</Li>
            <Li>• How Not To Be Dismissive</Li>
          </ul>
        </Section>

        {/* Back to Home CTA */}
        <div className="mt-16 pt-8 border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}">
          <Link
            to="/about"
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
              to="/about"
              className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/"
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
