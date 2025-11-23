// pages/marketplace/MarketplaceStorePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ProductCard from "../../components/marketplace/ProductCard";

export default function MarketplaceStorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, prodRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/store/${storeId}`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/products/store/${storeId}`)
        ]);
        
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStore(storeData);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData?.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storeId]);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-sm text-slate-400">Loading store...</div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!store) {
    return (
      <MarketplaceLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-sm text-rose-400">Store not found</div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <Link
          to="/portal/marketplace"
          className="inline-flex items-center text-xs text-slate-400 hover:text-amber-300"
        >
          ← Back to marketplace
        </Link>

        {/* Store header */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 p-6">
          <div className="flex items-start gap-4">
            {store.logo_url && (
              <div className="h-16 w-16 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-xs text-amber-300 mb-1">{store.region}</div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-sm text-slate-300">{store.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                <span>{store.followers_count || 0} followers</span>
                <span>{store.products_count || 0} products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store products */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Products from this store
          </h2>
          {products.length === 0 ? (
            <div className="text-xs text-slate-500">No products available yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MarketplaceLayout>
  );
}
