import React from 'react';
import { Link } from 'react-router-dom';

function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">💼</div>
        <h1 className="text-4xl font-bold text-white mb-4">BANIBS Opportunities</h1>
        <p className="text-xl text-gray-300 mb-8">
          Internships, funding, and jobs coming soon.
        </p>
        <p className="text-gray-400 mb-8">
          Discover career opportunities, internship programs, funding sources, grants, and scholarships tailored for Black and Indigenous professionals and students.
        </p>
        <Link
          to="/hub"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          ← Back to Hub
        </Link>
      </div>
    </div>
  );
}

export default OpportunitiesPage;
