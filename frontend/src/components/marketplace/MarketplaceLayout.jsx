// frontend/src/components/marketplace/MarketplaceLayout.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import BusinessLayout from "../business/BusinessLayout";

const navItems = [
  { to: "/portal/marketplace", label: "Home" },
  { to: "/portal/marketplace/region/global", label: "Global View" },
  { to: "/portal/marketplace/checkout", label: "Cart & Checkout" },
  { to: "/portal/marketplace/orders", label: "My Orders" },
  { to: "/portal/marketplace/seller/dashboard", label: "Seller Dashboard" },
];

export default function MarketplaceLayout({ children }) {
  return (
    <BusinessLayout>
      <div className="min-h-full bg-slate-950 text-slate-50 flex">
        {/* Left rail */}
        <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-800 bg-black/60">
          <div className="px-6 py-5 border-b border-slate-800">
            <Link to="/portal/marketplace" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                <span className="font-black text-black text-lg">16</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  BANIBS
                </div>
                <div className="font-semibold text-sm text-amber-300">
                  Global Marketplace
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                      : "text-slate-300 hover:text-amber-200 hover:bg-slate-800/70",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 text-xs text-slate-500 border-t border-slate-800">
            <div className="font-semibold text-amber-400 mb-1">
              From Local → Global
            </div>
            <p className="leading-snug">
              A Black-owned marketplace connecting Africa, the Caribbean, and the
              Diaspora with products, art, and digital goods.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </BusinessLayout>
  );
}