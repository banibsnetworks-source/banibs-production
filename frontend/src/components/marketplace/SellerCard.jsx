// components/marketplace/SellerCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SellerCard({ seller }) {
  if (!seller) return null;
  const { id, business_name, region, bio, logo_url } = seller;

  return (
    <Link
      to={`/portal/marketplace/store/${id}`}
      className="flex gap-3 items-center rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/60 px-3.5 py-3 transition-all"
    >
      <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
        {logo_url ? (
          <img
            src={logo_url}
            alt={business_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">{business_name?.[0]}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400">
          {region}
        </div>
        <div className="text-sm font-semibold text-slate-50">
          {business_name}
        </div>
        {bio && (
          <div className="text-xs text-slate-400 line-clamp-1">
            {bio}
          </div>
        )}
      </div>
    </Link>
  );
}