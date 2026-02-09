import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShareButton from '../../components/social/ShareButton';

/**
 * SevenSpiritsPage - Foundation Document
 * "The Seven Spirits of God — An Operational Reading from Revelation"
 * 
 * CANONICAL CONTENT - Do not paraphrase, summarize, or reorder.
 * This is an archival/explanatory document, not a social post.
 */
const SevenSpiritsPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0C0C0C]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/guest"
            className="inline-flex items-center gap-2 text-[#B3B3C2] hover:text-[#C8A857] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to BANIBS</span>
          </Link>
          {/* Share Button - Platform Neutral */}
          <ShareButton
            contentType="foundation"
            contentId="seven-spirits-of-god"
            contentTitle="The Seven Spirits of God — An Operational Reading from Revelation"
            compact={true}
            showLabel={false}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <article className="foundation-document">
          
          {/* Document Header */}
          <header className="mb-12 text-center">
            <p className="text-[#C8A857] text-sm font-medium tracking-widest uppercase mb-4">
              Foundation Document
            </p>
            <h1 className="text-3xl md:text-4xl font-serif text-[#F7F7F7] leading-tight mb-4">
              The Seven Spirits of God
            </h1>
            <p className="text-xl md:text-2xl text-[#B3B3C2] font-light">
              An Operational Reading from Revelation
            </p>
            <p className="text-base text-[#6B7280] mt-4 italic">
              How authority, agency, and power operate in Scripture
            </p>
          </header>

          {/* Divider */}
          <div className="w-16 h-px bg-[#C8A857]/30 mx-auto mb-12" />

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F7F7F7] mb-6">Introduction</h2>
            
            <div className="space-y-4 text-[#D1D1D6] leading-relaxed">
              <p>
                The Book of Revelation repeatedly refers to "the seven Spirits of God."
                Historically, these references have often been interpreted through Isaiah 11:2, which lists wisdom, understanding, counsel, might, knowledge, and the fear of the Lord as qualities resting upon the Messiah.
              </p>
              
              <p>
                That connection is understandable — but it is not complete.
              </p>
              
              <p>
                Isaiah 11 is prophetic and descriptive, focused on the character and empowerment of the Messiah.
                Revelation, by contrast, is apocalyptic and operational, focused on how authority is exercised under pressure, especially in the contrast between the Lamb and the Beast.
              </p>
              
              <p>
                Because of this difference in purpose, Revelation is not merely repeating Isaiah's list.
                It is reframing the fullness of God's Spirit in terms of governing principles, not abstract attributes.
              </p>
            </div>
          </section>

          {/* An Operational Reading */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F7F7F7] mb-6">
              An Operational Reading of the Seven Spirits of God
            </h2>
            
            <p className="text-[#D1D1D6] leading-relaxed mb-8">
              When read in context, the "seven Spirits of God" in Revelation are best understood as the complete, non-coercive operational authority of God — how God rules, reveals, and preserves agency in the world.
            </p>
            
            <p className="text-[#D1D1D6] leading-relaxed mb-6">
              These seven are:
            </p>
            
            <div className="space-y-6 pl-4 border-l-2 border-[#C8A857]/20">
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Light</h3>
                <p className="text-[#B3B3C2] mt-1">God reveals reality without force or manipulation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Truth</h3>
                <p className="text-[#B3B3C2] mt-1">God remains faithful to reality, even when truth is rejected.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Peace</h3>
                <p className="text-[#B3B3C2] mt-1">God establishes order without coercion or domination.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Patience</h3>
                <p className="text-[#B3B3C2] mt-1">God restrains power rather than rushing judgment.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Wisdom</h3>
                <p className="text-[#B3B3C2] mt-1">God discerns rightly under pressure and complexity.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Love (with boundaries)</h3>
                <p className="text-[#B3B3C2] mt-1">God loves without collapsing truth, holiness, or responsibility.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#C8A857]">Authority (without coercion)</h3>
                <p className="text-[#B3B3C2] mt-1">God rules by worthiness and consent, not by force.</p>
              </div>
            </div>
            
            <p className="text-[#D1D1D6] leading-relaxed mt-8">
              These are not seven beings, nor fragments of God, but the complete fullness of God's Spirit in operation — symbolized by seven to indicate wholeness, rest, and completion.
            </p>
          </section>

          {/* The Necessary Contrast */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F7F7F7] mb-6">
              The Necessary Contrast in Revelation
            </h2>
            
            <p className="text-[#D1D1D6] leading-relaxed mb-6">
              Revelation clarifies meaning through contrast.
            </p>
            
            <p className="text-[#D1D1D6] leading-relaxed mb-6">
              Opposed to God's sevenfold fullness is a system of six recurring mechanisms — the operational weapons of the Devil:
            </p>
            
            <ul className="space-y-3 pl-6 text-[#B3B3C2]">
              <li className="list-disc">Temptation</li>
              <li className="list-disc">Division</li>
              <li className="list-disc">Distortion</li>
              <li className="list-disc">Urgency / Pressure</li>
              <li className="list-disc">Dismissal</li>
              <li className="list-disc">Deception (diversion operates here)</li>
            </ul>
            
            <p className="text-[#D1D1D6] leading-relaxed mt-6">
              There is no seventh.
            </p>
            
            <p className="text-[#D1D1D6] leading-relaxed mt-4">
              This is not an omission, but a statement.
              Six represents incompletion, endless striving, and pressure without rest.
            </p>
            
            <p className="text-[#D1D1D6] leading-relaxed mt-4">
              Coercion can imitate power, but it can never produce true authority.
            </p>
          </section>

          {/* Why This Matters */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F7F7F7] mb-6">
              Why This Matters
            </h2>
            
            <div className="space-y-4 text-[#D1D1D6] leading-relaxed">
              <p>
                Revelation is not a timeline puzzle.
                It is a disclosure of how power operates.
              </p>
              
              <p>
                The Lamb governs through light, truth, patience, and authority freely given.
                The Beast governs through pressure, fear, urgency, and deception.
              </p>
              
              <p>
                Understanding the "seven Spirits of God" as operational principles clarifies why:
              </p>
              
              <ul className="space-y-2 pl-6 text-[#B3B3C2]">
                <li className="list-disc">the Lamb conquers without force</li>
                <li className="list-disc">the saints are called to patience</li>
                <li className="list-disc">coercion is always exposed as counterfeit authority</li>
              </ul>
              
              <p className="mt-4">
                This framework does not replace Scripture.
                It makes visible what Scripture already shows.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F7F7F7] mb-6">Closing</h2>
            
            <p className="text-[#D1D1D6] leading-relaxed">
              This reading is offered for examination, not enforcement.
              Truth does not require coercion.
            </p>
          </section>

          {/* Footer Divider */}
          <div className="w-16 h-px bg-[#C8A857]/30 mx-auto mt-16" />
          
          {/* Document Footer */}
          <footer className="mt-8 text-center">
            <p className="text-sm text-[#6B7280]">
              BANIBS Foundation Document
            </p>
          </footer>

        </article>
      </main>
    </div>
  );
};

export default SevenSpiritsPage;
