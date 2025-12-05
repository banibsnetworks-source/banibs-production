// pages/marketplace/MarketplaceHomePage.jsx
import React, { useEffect, useState } from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ProductCard from "../../components/marketplace/ProductCard";
import SellerCard from "../../components/marketplace/SellerCard";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const REGIONS = [
  { id: "Africa", label: "Africa" },
  { id: "Caribbean", label: "Caribbean" },
  { id: "North America", label: "North America" },
  { id: "South America", label: "South America" },
  { id: "Europe", label: "Europe" },
  { id: "Asia", label: "Asia" },
];

export default function MarketplaceHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    async function load() {
      try {
        const featRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/products/featured?limit=8`);
        const sellersRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/sellers/region/Africa`);
        
        if (!abort) {
          if (featRes.ok) {
            const featJson = await featRes.json();
            setFeaturedProducts(featJson?.products || []);
          }
          if (sellersRes.ok) {
            const sellerJson = await sellersRes.json();
            setTopSellers((sellerJson?.sellers || []).slice(0, 3));
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load marketplace home", err);
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, []);

  return (
    <MarketplaceLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* Hero */}
        <section className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[0.7rem] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Global Marketplace · Phase 16.0
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-200">
              Buy Black. Across Continents.  
              <span className="block text-slate-100 text-base md:text-lg font-normal mt-1">
                A global marketplace for Black-owned products, art, fashion, and
                digital goods from Africa, the Caribbean, and the Diaspora.
              </span>
            </h1>
            <div className="flex flex-wrap gap-2 text-[0.7rem] text-slate-300">
              <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                Physical & Digital Products
              </span>
              <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                Diaspora Regions Connected
              </span>
              <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                Spend-Black Ready
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 px-4 py-4 text-xs text-slate-100 space-y-2">
            <h2 className="text-sm font-semibold text-amber-200">
              How the mock checkout works
            </h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Browse products and add to cart.</li>
              <li>Go to Checkout and place a mock order.</li>
              <li>
                The system saves your order with{" "}
                <span className="text-amber-300 font-semibold">
                  payment_status: "mock_paid"
                </span>
                .
              </li>
            </ol>
            <p className="text-[0.65rem] text-slate-400 pt-1 border-t border-slate-800 mt-2">
              Phase 16.1+ will connect this flow to BANIBS Wallet for real
              balances and seller payouts.
            </p>
          </div>
        </section>

        {/* Regions */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h2 className="text-sm font-semibold text-slate-100">
              Explore by Diaspora Region
            </h2>
            <Link
              to="/portal/diaspora"
              className="text-[0.7rem] text-amber-300 hover:text-amber-200"
            >
              View Diaspora stories →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[0.7rem]">
            {REGIONS.map((r) => (
              <Link
                key={r.id}
                to={`/portal/marketplace/region/${r.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/70 hover:border-amber-500/60 hover:bg-slate-900 px-3 py-2 flex items-center justify-between gap-2 transition-colors"
              >
                <span className="text-slate-100">{r.label}</span>
                <span className="text-[0.6rem] text-slate-500">Browse</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h2 className="text-sm font-semibold text-slate-100">
              Featured Marketplace Products
            </h2>
            <span className="text-[0.7rem] text-slate-500">
              Curated from BANIBS sellers across regions
            </span>
          </div>
          {loading ? (
            <div className="text-xs text-slate-500">Loading products…</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-xs text-slate-500">
              No featured products yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Sellers strip */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h2 className="text-sm font-semibold text-slate-100">
              Sellers Across the Diaspora
            </h2>
            <Link
              to="/portal/marketplace/region/Africa"
              className="text-[0.7rem] text-amber-300 hover:text-amber-200"
            >
              View all regions →
            </Link>
          </div>
          {topSellers.length === 0 ? (
            <div className="text-xs text-slate-500">
              Sellers will appear here as the marketplace grows.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {topSellers.map((s) => (
                <SellerCard key={s.id} seller={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MarketplaceLayout>
  );
}