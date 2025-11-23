// pages/marketplace/MarketplaceProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import DigitalBadge from "../../components/marketplace/DigitalBadge";

const CART_KEY = "banibs_marketplace_cart_v1";

function addToCart(product) {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    
    const existingIdx = cart.findIndex(item => item.product.id === product.id);
    if (existingIdx >= 0) {
      cart[existingIdx].quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }
    
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

export default function MarketplaceProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const handleAddToCart = () => {
    if (addToCart(product)) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-sm text-slate-400">Loading product...</div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!product) {
    return (
      <MarketplaceLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-sm text-rose-400">Product not found</div>
        </div>
      </MarketplaceLayout>
    );
  }

  const isDigital = product.product_type === "digital";
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <Link
          to="/portal/marketplace"
          className="inline-flex items-center text-xs text-slate-400 hover:text-amber-300 mb-4"
        >
          ← Back to marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden aspect-square">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-600">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DigitalBadge isDigital={isDigital} />
                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {product.region}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">
                {product.title}
              </h1>
              <div className="text-3xl font-bold text-amber-300 mb-3">
                ${Number(product.price).toFixed(2)}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.stock_quantity !== null && product.stock_quantity !== undefined && (
              <div className="text-xs text-slate-400">
                {product.stock_quantity > 0 ? (
                  <span className="text-emerald-400">In stock ({product.stock_quantity} available)</span>
                ) : (
                  <span className="text-rose-400">Out of stock</span>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!isDigital && product.stock_quantity === 0}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm py-3 hover:shadow-[0_0_30px_rgba(205,127,50,0.4)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addedToCart ? "✓ Added to cart!" : "Add to cart"}
              </button>
              <Link
                to="/portal/marketplace/checkout"
                className="px-6 py-3 rounded-xl border border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/10 transition-colors"
              >
                View cart
              </Link>
            </div>

            {isDigital && (
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3 text-xs text-violet-100">
                <span className="font-semibold">Digital product:</span> Instant download after purchase (mock mode)
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
