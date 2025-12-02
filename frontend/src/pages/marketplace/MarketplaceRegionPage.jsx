// pages/marketplace/MarketplaceRegionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ProductCard from "../../components/marketplace/ProductCard";
import SellerCard from "../../components/marketplace/SellerCard";

export default function MarketplaceRegionPage() {
  const { regionId } = useParams();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, sellRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/products/region/${regionId}`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/sellers/region/${regionId}`)
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData?.products || []);
        }
        if (sellRes.ok) {
          const sellData = await sellRes.json();
          setSellers(sellData?.sellers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [regionId]);

  return (
    <MarketplaceLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div>
          <Link
            to="/portal/marketplace"
            className="inline-flex items-center text-xs text-slate-400 hover:text-amber-300 mb-3"
          >
            ← Back to marketplace
          </Link>
          <h1 className="text-2xl font-bold text-amber-200 mb-2">
            {regionId} Marketplace
          </h1>
          <p className="text-sm text-slate-400">
            Products and sellers from the {regionId} region
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Sellers in {regionId}
          </h2>
          {loading ? (
            <div className="text-xs text-slate-500">Loading sellers...</div>
          ) : sellers.length === 0 ? (
            <div className="text-xs text-slate-500">No sellers found in this region yet.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {sellers.map((s) => (
                <SellerCard key={s.id} seller={s} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Products from {regionId}
          </h2>
          {loading ? (
            <div className="text-xs text-slate-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-xs text-slate-500">No products found in this region yet.</div>
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
