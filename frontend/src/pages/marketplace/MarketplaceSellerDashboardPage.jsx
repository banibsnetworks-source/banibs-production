// pages/marketplace/MarketplaceSellerDashboardPage.jsx
import React from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";

export default function MarketplaceSellerDashboardPage() {
  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-200 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Manage your products, orders, and storefront
          </p>
        </div>

        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 px-6 py-8 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-lg font-semibold text-amber-200 mb-2">
            Seller Dashboard Coming Soon
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            The full seller dashboard with product management, order tracking, and payout settings will be available in Phase 16.1+
          </p>
          <div className="mt-6 text-xs text-slate-400">
            For now, sellers can be registered via the backend API endpoints.
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-slate-400 mb-1">Feature preview:</div>
            <div className="font-semibold text-slate-100">Product uploads</div>
            <div className="text-slate-500 mt-1">Add physical & digital products with images</div>
          </div>
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-slate-400 mb-1">Feature preview:</div>
            <div className="font-semibold text-slate-100">Order management</div>
            <div className="text-slate-500 mt-1">Track and fulfill customer orders</div>
          </div>
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-slate-400 mb-1">Feature preview:</div>
            <div className="font-semibold text-slate-100">Payouts (16.1+)</div>
            <div className="text-slate-500 mt-1">Connect to BANIBS Wallet for earnings</div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
