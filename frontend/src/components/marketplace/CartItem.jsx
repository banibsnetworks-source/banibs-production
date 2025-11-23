// components/marketplace/CartItem.jsx
import React from "react";

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const { product, quantity } = item;
  if (!product) return null;

  const thumbnail_url = product.images && product.images.length > 0 ? product.images[0] : null;
  const subtotal = Number(product.price || 0) * quantity;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800">
      <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[0.65rem] text-slate-500">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-50 line-clamp-1">
          {product.title}
        </div>
        <div className="text-xs text-slate-400">
          ${Number(product.price).toFixed(2)} each
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onUpdateQty(quantity - 1)}
            className="h-6 w-6 rounded-full border border-slate-700 flex items-center justify-center text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200"
          >
            −
          </button>
          <span className="text-xs text-slate-100 w-6 text-center">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQty(quantity + 1)}
            className="h-6 w-6 rounded-full border border-slate-700 flex items-center justify-center text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200"
          >
            +
          </button>
          <button
            onClick={onRemove}
            className="ml-3 text-[0.7rem] text-slate-500 hover:text-rose-400"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold text-amber-300">
        ${subtotal.toFixed(2)}
      </div>
    </div>
  );
}