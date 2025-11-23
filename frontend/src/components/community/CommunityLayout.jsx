// components/community/CommunityLayout.jsx - Phase 11.6
import React from "react";
import { NavLink } from "react-router-dom";
import { Heart, Dumbbell, ChefHat, GraduationCap, Home } from "lucide-react";

export default function CommunityLayout({ children }) {
  const navItems = [
    { 
      to: "/portal/community", 
      label: "Overview", 
      icon: Home,
      exact: true 
    },
    { 
      to: "/portal/community/health", 
      label: "Health & Insurance",
      icon: Heart,
      color: "teal"
    },
    { 
      to: "/portal/community/fitness", 
      label: "Fitness & Movement",
      icon: Dumbbell,
      color: "green"
    },
    { 
      to: "/portal/community/food", 
      label: "Food & Culture",
      icon: ChefHat,
      color: "amber"
    },
    { 
      to: "/portal/community/school", 
      label: "Alternative Schooling",
      icon: GraduationCap,
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                BANIBS Community Life Hub
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Health • Fitness • Food • Education
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                Phase 11.6
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const colorClasses = {
                teal: "data-[active=true]:text-teal-400 data-[active=true]:border-teal-500",
                green: "data-[active=true]:text-green-400 data-[active=true]:border-green-500",
                amber: "data-[active=true]:text-amber-400 data-[active=true]:border-amber-500",
                blue: "data-[active=true]:text-blue-400 data-[active=true]:border-blue-500"
              };

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? `${item.color ? colorClasses[item.color] : 'text-slate-100 border-slate-500'} border-b-2`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 min-w-0">
        {children}
      </main>
    </div>
  );
}
