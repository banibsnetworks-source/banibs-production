/**
 * BANIBS Identity Layer Navigation
 *
 * This nav bar is REQUIRED on all public BANIBS homepages.
 * Do not remove, hide, or collapse these links on desktop.
 *
 * Why:
 * BANIBS is not just news. BANIBS is Social, Business,
 * Information, Education, Youth, Opportunities, and Resources.
 * That system MUST be visible above the fold at all times.
 *
 * If you modify or restyle this component, you MUST still:
 *  - Keep all core links visible
 *  - Keep the dark glass / gold accent visual identity
 *  - Keep this rendered before core content on HomePage
 *
 * Enforcement:
 * `yarn verify:identity` will fail the build if HomePage
 * does not include <QuickLinks />.
 *
 * See: /docs/BANIBS_IDENTITY_CONTRACT.md for full requirements.
 */

import React from "react";

export default function QuickLinks() {
  const links = [
    { label: "Social", href: "/social" },
    { label: "Business", href: "/business" },
    { label: "Information", href: "/information" },
    { label: "Education", href: "/education" },
    { label: "Youth", href: "/youth" },
    { label: "Opportunities", href: "/opportunities" },
    { label: "Resources", href: "/resources" },
    { label: "World News", href: "/world-news" },
  ];

  return (
    <nav
      aria-label="BANIBS Core Navigation"
      data-testid="banibs-quick-links"
      className="
        w-full
        flex
        justify-center
        border-b border-yellow-400/20
        bg-[rgba(0,0,0,0.6)]
        backdrop-blur-md
        text-[0.8rem]
        md:text-sm
        text-gray-200
        py-3
        px-4
        mb-6
      "
    >
      <ul
        className="
          flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4
          max-w-[1100px] w-full
        "
      >
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="
                flex items-center
                px-3 py-1.5
                rounded-full
                border border-yellow-400/30
                bg-[rgba(17,17,17,0.6)]
                hover:border-yellow-400/80
                hover:text-yellow-300
                hover:bg-[rgba(30,30,30,0.6)]
                transition-colors
                whitespace-nowrap
                shadow-[0_0_10px_rgba(255,215,0,0.15)]
              "
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
