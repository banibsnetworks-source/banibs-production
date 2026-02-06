// pages/community/SchoolHomePage.jsx - Alternative School Hub Phase-0
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  GraduationCap, Book, Users, Globe, Shield, Mail,
  MapPin, Sparkles, ExternalLink, AlertCircle
} from "lucide-react";

/**
 * Alternative School Hub - Phase-0 Scaffold
 * 
 * READ-ONLY display of:
 * - Founding Tutors & Learning Guides
 * - Alternative Learning Programs
 * - Learning Resources
 * 
 * Data managed via admin endpoints only.
 */

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    founding: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Active' },
    developing: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Coming Soon' },
    future: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', label: 'Planned' }
  };
  const style = styles[status] || styles.developing;
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.border} ${style.text} border`}>
      {style.label}
    </span>
  );
};

// Tutor card component with image support
const TutorCard = ({ tutor }) => (
  <div className="rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all overflow-hidden">
    {/* Tutor Image */}
    {tutor.image_url ? (
      <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-blue-600/10 relative overflow-hidden">
        <img 
          src={tutor.image_url}
          alt={tutor.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : null}
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {tutor.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">{tutor.name}</h3>
            <p className="text-sm text-blue-400">{tutor.focus_subject}</p>
          </div>
        </div>
        <StatusBadge status={tutor.status} />
      </div>
      
      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{tutor.description}</p>
      
      <div className="space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-slate-500" />
          <span>{tutor.age_or_grade_range}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-500" />
          <span>{tutor.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-500" />
          <span>{tutor.contact_info}</span>
        </div>
      </div>
    </div>
  </div>
);

// Program card component with image support
const ProgramCard = ({ program }) => (
  <div className="rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all overflow-hidden">
    {/* Program Image */}
    {program.image_url ? (
      <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-amber-600/10 relative overflow-hidden">
        <img 
          src={program.image_url}
          alt={program.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : null}
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-100">{program.title}</h3>
        <StatusBadge status={program.status} />
      </div>
      <p className="text-sm text-slate-300 line-clamp-3">{program.description}</p>
    </div>
  </div>
);

// Resource card component with image support
const ResourceCard = ({ resource }) => (
  <div className="rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all overflow-hidden">
    {/* Resource Image */}
    {resource.image_url ? (
      <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 relative overflow-hidden">
        <img 
          src={resource.image_url}
          alt={resource.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : null}
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Book size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-100">{resource.title}</h3>
      </div>
      <StatusBadge status={resource.status} />
    </div>
    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{resource.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 px-2 py-1 rounded bg-slate-800/50">
        {resource.category}
      </span>
      {resource.link_url && (
        <a 
          href={resource.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <ExternalLink size={12} />
          View
        </a>
      )}
    </div>
  </div>
);

export default function SchoolHomePage() {
  const [hubData, setHubData] = useState({
    tutors: [],
    programs: [],
    resources: [],
    tutor_count: 0,
    program_count: 0,
    resource_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/alt-school/hub`
      );

      if (response.ok) {
        const data = await response.json();
        setHubData(data);
      } else {
        throw new Error('Failed to load hub data');
      }
    } catch (err) {
      console.error("Failed to fetch Alternative School Hub data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-slate-400">Loading Alternative School Hub...</div>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Hero Banner - Black Students Learning */}
      <div className="mb-8 rounded-2xl overflow-hidden relative h-48 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <img 
          src="https://images.unsplash.com/photo-1610500796385-3ffc1ae2f046?w=1200&q=80"
          alt="Black children reading and learning"
          className="w-full h-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 flex items-center px-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                <GraduationCap className="text-blue-400" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                  Alternative Schooling Hub
                </h1>
                <p className="text-sm text-slate-400">Phase-0 · Founding Resources</p>
              </div>
            </div>
            <p className="text-base text-slate-300 max-w-2xl">
              Take control of your children's education. Find tutors, curriculums, co-ops, and support for homeschooling families.
            </p>
          </div>
        </div>
      </div>
        
      {/* Orientation Notice */}
      <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <strong>This hub is opening in phases.</strong> Some listings are active, some are still developing. 
          More tutors, programs, and resources will be added as we grow.
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Tutors & Guides', count: hubData.tutor_count, icon: Users, color: 'blue' },
          { label: 'Programs', count: hubData.program_count, icon: Book, color: 'amber' },
          { label: 'Resources', count: hubData.resource_count, icon: Globe, color: 'emerald' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colors = {
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
            amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
            emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400'
          };
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl bg-gradient-to-br ${colors[stat.color]} border text-center`}
            >
              <Icon size={20} className={`mx-auto mb-2 ${colors[stat.color].split(' ').pop()}`} />
              <div className="text-2xl font-bold text-slate-100">{stat.count}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Section: Founding Tutors & Learning Guides */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Founding Tutors & Learning Guides</h2>
        </div>
        
        {hubData.tutors.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
            <GraduationCap size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tutors listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubData.tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </section>

      {/* Section: Alternative Learning Programs */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Book className="text-amber-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Alternative Learning Programs</h2>
        </div>
        
        {hubData.programs.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
            <Book size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No programs listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubData.programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </section>

      {/* Section: Learning Resources */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Learning Resources</h2>
        </div>
        
        {hubData.resources.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
            <Globe size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No resources listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {hubData.resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Become a Tutor CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 text-center">
        <GraduationCap className="mx-auto mb-3 text-blue-400" size={28} />
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Are you an educator?
        </h3>
        <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
          Apply to be listed as a tutor in the Alternative School Hub. 
          We review applications in phases.
        </p>
        <Link
          to="/portal/community/school/become-a-tutor"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/30 transition-colors"
          data-testid="become-tutor-cta"
        >
          Apply to Be Listed
        </Link>
      </div>
    </CommunityLayout>
  );
}
