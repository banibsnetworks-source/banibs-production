// components/marketplace/CheckoutSummary.jsx
import React from "react";

export default function CheckoutSummary({ items, onCheckout, loading }) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = items.some((i) => i.product?.product_type !== "digital") ? 5 : 0;
  const total = subtotal + shipping;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-50">
        Order Summary
      </h3>
      <div className="text-xs space-y-1 text-slate-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
        </div>
        <div className="flex justify-between font-semibold text-amber-300 pt-2 border-t border-slate-800 mt-1">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        disabled={loading || items.length === 0}
        className="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(205,127,50,0.4)] transition-shadow"
      >
        {loading ? "Placing order..." : "Place mock order"}
      </button>
      <p className="text-[0.65rem] text-slate-500">
        This is a <span className="text-amber-300 font-semibold">mock</span>{" "}
        payment flow for Phase 16.0. No real money moves yet. Phase 16.1+ will
        connect this to BANIBS Wallet.
      </p>
    </div>
  );
}