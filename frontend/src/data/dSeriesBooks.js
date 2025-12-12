/**
 * D-Series Revelation Library
 * Book metadata for Raymond Al Zedeck's revelation series
 * 
 * Status values: 'available' | 'in_review' | 'coming_soon'
 * Type values: 'core' | 'manual' | 'volume'
 */

export const dSeriesBooks = [
  {
    id: 'd0',
    sequenceNumber: 0,
    code: 'D0',
    title: "The Devil's Deceitful Master Plan™",
    subtitle: "The Spiritual Architecture Behind All Human Deception",
    slug: "the-devils-deceitful-master-plan",
    status: 'coming_soon',
    type: 'manual',
    kdpPaperbackLink: null,
    kdpEbookLink: null,
    descriptionShort: "The foundational framework manual for the entire D-Series. Reveals the master spiritual architecture that underlies all forms of human deception, distortion, and division.",
    descriptionLong: `This is the architectural blueprint—the master framework that explains how deception operates at every level of human experience. Before understanding individual deceptive patterns, we must first see the complete system.

The Devil's Deceitful Master Plan reveals the spiritual infrastructure behind manipulation, gaslighting, institutional corruption, and cultural distortion. This is not theory—this is the operating system of deception itself, exposed in full detail.

This manual serves as the foundation for all other D-Series volumes, providing the complete map before exploring individual territories.`,
    primaryAudienceTags: ['pastors', 'imams', 'teachers', 'therapists', 'scholars', 'community_leaders'],
    highlightColor: '#42B5FF'
  },
  {
    id: 'd1',
    sequenceNumber: 1,
    code: 'D1',
    title: "The Devil's Dismissive Argument™",
    subtitle: "How Society Blocks Truth, Accountability, and Growth",
    slug: "the-devils-dismissive-argument",
    status: 'in_review',
    type: 'core',
    kdpPaperbackLink: null,
    kdpEbookLink: null,
    descriptionShort: "Exposes a powerful psychological mechanism that erases cause, destroys accountability, and silently damages children. Reveals how truth is dismissed in families, schools, media, and justice systems.",
    descriptionLong: `Across homes, workplaces, schools, relationships, and the justice system, a single phrase shows up again and again: "It doesn't matter what happened before—nobody should ever do that."

This statement feels morally righteous, but it creates a devastating effect: it erases the cause, destroys accountability, blocks conflict resolution, and prevents learning. When a society loses the cause, it loses the ability to heal, grow, and protect its children.

The Devil's Dismissive Argument names this mechanism in full detail and teaches how to recognize it, call it out, and break its influence. This book is for anyone who has ever been silenced, blamed without context, or watched truth get buried under moral absolutism.

This revelation empowers families, educators, counselors, leaders, and communities to restore cause-and-effect understanding—the foundation of all justice, healing, and accountability.`,
    primaryAudienceTags: ['general_readers', 'churches', 'counselors', 'community_leaders', 'educators', 'parents'],
    highlightColor: '#D4AF37'
  }
];

/**
 * Get all books sorted by sequence number
 */
export const getAllBooks = () => {
  return [...dSeriesBooks].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
};

/**
 * Get a specific book by slug
 */
export const getBookBySlug = (slug) => {
  return dSeriesBooks.find(book => book.slug === slug);
};

/**
 * Get status display config
 */
export const getStatusConfig = (status) => {
  const configs = {
    'available': {
      label: 'AVAILABLE',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    },
    'in_review': {
      label: 'IN REVIEW',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    'coming_soon': {
      label: 'COMING SOON',
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      borderColor: 'rgba(107, 114, 128, 0.3)'
    }
  };
  return configs[status] || configs['coming_soon'];
};

export default dSeriesBooks;
