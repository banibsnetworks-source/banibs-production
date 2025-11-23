// components/marketplace/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import DigitalBadge from "./DigitalBadge";

export default function ProductCard({ product }) {
  if (!product) return null;

  const {
    id,
    title,
    price,
    images,
    region,
    product_type,
  } = product;

  const thumbnail_url = images && images.length > 0 ? images[0] : null;
  const is_digital = product_type === "digital";

  return (
    <div className="group rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/60 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(205,127,50,0.35)] transition-all overflow-hidden">
      <Link to={`/portal/marketplace/product/${id}`}>
        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-600 text-xs">
              No image
            </div>
          )}
          <div className="absolute top-2 left-2">
            <DigitalBadge isDigital={is_digital} />
          </div>
          <div className="absolute bottom-2 right-2 text-[0.65rem] px-2 py-1 rounded-full bg-black/70 text-amber-200 border border-amber-500/40">
            {region || "Global"}
          </div>
        </div>

        <div className="px-3.5 py-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-50 line-clamp-2">
              {title}
            </h3>
            <div className="text-right">
              <div className="text-xs text-slate-400">USD</div>
              <div className="text-amber-300 font-semibold">
                ${Number(price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}