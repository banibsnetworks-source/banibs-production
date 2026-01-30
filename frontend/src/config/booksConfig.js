/**
 * BANIBS Books Configuration
 * Single source of truth for book titles and links
 * Used across: /circles, /foundation, ComingSoonPage
 */

export const BANIBS_BOOKS = [
  {
    id: 1,
    title: "The Devil's Dismissive Argument",
    subtitle: "How Society Blocks Truth, Accountability, and Growth",
    role: "The foundational text. It names the mechanism by which accountability is deflected and truth is suppressed in everyday discourse.",
    url: "https://www.amazon.com/Devils-Dismissive-ArgumentTM-Society-Accountability-ebook/dp/B0G6V3T227"
  },
  {
    id: 2,
    title: "Before You Call It Out",
    subtitle: "A Companion to The Devil's Dismissive Argument",
    role: "The bridge work. A practical guide for recognizing and responding to dismissive patterns before they take hold.",
    url: "https://www.amazon.com/dp/B0GC413RV6"
  },
  {
    id: 3,
    title: "The Devil's Deceitful Master Plan",
    subtitle: "How Deception Works, Hides, and Repeats Across All Human Thought",
    role: "The expansion. It traces the architecture of deception across systems — personal, institutional, and cultural.",
    url: "https://www.amazon.com/dp/B0GCC5MHMD"
  },
  {
    id: 4,
    title: "The Light God Wants You to See",
    subtitle: "A Spiritual Framework for Clarity",
    role: "The anchor. A spiritual grounding that positions clarity and truth as divine imperatives, not just intellectual exercises.",
    url: "https://www.amazon.com/dp/B0GCLBZ534"
  },
  {
    id: 5,
    title: "How Not To Be Dismissive",
    subtitle: "Practical Guide to Preserving Agency",
    role: "The application. A practical guide for avoiding dismissive patterns in everyday communication.",
    url: null // Link not yet available
  }
];

// Helper to get book by title (partial match)
export const getBookByTitle = (titleFragment) => {
  return BANIBS_BOOKS.find(book => 
    book.title.toLowerCase().includes(titleFragment.toLowerCase())
  );
};

// Books that appear on Foundation/Circles pages (canonical list)
export const FOUNDATION_BOOKS = [
  "The Devil's Dismissive Argument",
  "Before You Call It Out",
  "The Devil's Deceitful Master Plan",
  "The Light God Wants You to See",
  "How Not To Be Dismissive"
];
