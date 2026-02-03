// pages/marketplace/MarketplaceRegionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ProductCard from "../../components/marketplace/ProductCard";
import SellerCard from "../../components/marketplace/SellerCard";

// Demo seed products by region - shown when no real products exist
// Uses dedicated marketplace product images (not news fallbacks)
const DEMO_PRODUCTS_BY_REGION = {
  Africa: [
    { id: "demo-af-1", title: "Handwoven Kente Cloth - Traditional Ghana Pattern", price: 89.99, images: ["/marketplace-images/kente-cloth.jpg"], region: "Africa", product_type: "physical" },
    { id: "demo-af-2", title: "Shea Butter Skincare Set - Natural & Organic", price: 45.00, images: ["/marketplace-images/skincare-jars.jpg"], region: "Africa", product_type: "physical" },
    { id: "demo-af-3", title: "Hand-Carved Wooden Sculpture - Yoruba Design", price: 275.00, images: ["/marketplace-images/wood-sculpture.jpg"], region: "Africa", product_type: "physical" },
    { id: "demo-af-4", title: "Djembe Drum - Handcrafted in Mali", price: 185.00, images: ["/marketplace-images/djembe-drum.jpg"], region: "Africa", product_type: "physical" },
    { id: "demo-af-5", title: "Handcrafted Gold Earrings - Afrocentric Design", price: 55.00, images: ["/marketplace-images/gold-earrings.jpg"], region: "Africa", product_type: "physical" },
    { id: "demo-af-6", title: "Handwoven Market Basket - Artisan Craft", price: 65.00, images: ["/marketplace-images/woven-baskets.jpg"], region: "Africa", product_type: "physical" },
  ],
  Caribbean: [
    { id: "demo-cb-1", title: "Caribbean Spice Collection - Jerk & Island Blends", price: 34.50, images: ["/marketplace-images/spice-jars.jpg"], region: "Caribbean", product_type: "physical" },
    { id: "demo-cb-2", title: "Jamaican Blue Mountain Coffee - Premium Roast", price: 42.00, images: ["/marketplace-images/coffee-bag.jpg"], region: "Caribbean", product_type: "physical" },
    { id: "demo-cb-3", title: "Steel Pan Music Lessons - Online Course", price: 79.00, images: ["/marketplace-images/digital-tablet.jpg"], region: "Caribbean", product_type: "digital" },
    { id: "demo-cb-4", title: "Organic Body Butter - Coconut & Shea", price: 28.00, images: ["/marketplace-images/body-butter.jpg"], region: "Caribbean", product_type: "physical" },
    { id: "demo-cb-5", title: "Reggae Riddim Sample Pack", price: 24.99, images: ["/marketplace-images/digital-tablet.jpg"], region: "Caribbean", product_type: "digital" },
    { id: "demo-cb-6", title: "Handwoven Basket - Island Craft", price: 45.00, images: ["/marketplace-images/woven-baskets.jpg"], region: "Caribbean", product_type: "physical" },
  ],
  "North America": [
    { id: "demo-na-1", title: "Digital Art Print: Diaspora Dreams Series", price: 25.00, images: ["/marketplace-images/digital-tablet.jpg"], region: "North America", product_type: "digital" },
    { id: "demo-na-2", title: "Natural Hair Care Bundle - Moisture & Growth", price: 58.00, images: ["/marketplace-images/haircare-products.jpg"], region: "North America", product_type: "physical" },
    { id: "demo-na-3", title: "Black Business Starter Guide - eBook", price: 19.99, images: ["/marketplace-images/digital-tablet.jpg"], region: "North America", product_type: "digital" },
    { id: "demo-na-4", title: "Leather Journal - Handcrafted & Embossed", price: 45.00, images: ["/marketplace-images/leather-journal.jpg"], region: "North America", product_type: "physical" },
    { id: "demo-na-5", title: "Organic Body Butter - Lavender Shea", price: 32.00, images: ["/marketplace-images/body-butter.jpg"], region: "North America", product_type: "physical" },
    { id: "demo-na-6", title: "Handcrafted Gold Earrings - Modern Design", price: 48.00, images: ["/marketplace-images/gold-earrings.jpg"], region: "North America", product_type: "physical" },
  ],
  "South America": [
    { id: "demo-sa-1", title: "Brazilian Capoeira Instructional Course", price: 59.00, images: ["/marketplace-images/digital-tablet.jpg"], region: "South America", product_type: "digital" },
    { id: "demo-sa-2", title: "Handwoven Basket - Indigenous Craft", price: 65.00, images: ["/marketplace-images/woven-baskets.jpg"], region: "South America", product_type: "physical" },
    { id: "demo-sa-3", title: "Organic Coffee - Brazilian Roast", price: 38.00, images: ["/marketplace-images/coffee-bag.jpg"], region: "South America", product_type: "physical" },
    { id: "demo-sa-4", title: "Artisan Leather Journal", price: 42.00, images: ["/marketplace-images/leather-journal.jpg"], region: "South America", product_type: "physical" },
  ],
  Europe: [
    { id: "demo-eu-1", title: "Afrobeats Producer Sample Pack Vol. 3", price: 19.99, images: ["/marketplace-images/digital-tablet.jpg"], region: "Europe", product_type: "digital" },
    { id: "demo-eu-2", title: "African Diaspora History eBook", price: 16.99, images: ["/marketplace-images/digital-tablet.jpg"], region: "Europe", product_type: "digital" },
    { id: "demo-eu-3", title: "Handmade Jewelry - Afrocentric Designs", price: 55.00, images: ["/marketplace-images/gold-earrings.jpg"], region: "Europe", product_type: "physical" },
    { id: "demo-eu-4", title: "Premium Skincare Set - Natural Ingredients", price: 62.00, images: ["/marketplace-images/skincare-jars.jpg"], region: "Europe", product_type: "physical" },
  ],
  Asia: [
    { id: "demo-as-1", title: "Afro-Asian Fusion Cookbook - Digital", price: 22.00, images: ["/marketplace-images/digital-tablet.jpg"], region: "Asia", product_type: "digital" },
    { id: "demo-as-2", title: "Premium Spice Collection - Global Flavors", price: 38.00, images: ["/marketplace-images/spice-jars.jpg"], region: "Asia", product_type: "physical" },
    { id: "demo-as-3", title: "Handcrafted Journal - Artisan Design", price: 35.00, images: ["/marketplace-images/leather-journal.jpg"], region: "Asia", product_type: "physical" },
    { id: "demo-as-4", title: "Global Diaspora Travel Guide - Asia", price: 18.00, images: ["/marketplace-images/digital-tablet.jpg"], region: "Asia", product_type: "digital" },
  ],
};

export default function MarketplaceRegionPage() {
  const { regionId } = useParams();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get demo products for this region (or empty array if none defined)
  const demoProducts = DEMO_PRODUCTS_BY_REGION[regionId] || DEMO_PRODUCTS_BY_REGION["Africa"] || [];

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
            <div className="text-xs text-slate-500 bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-800">
              Seller profiles coming soon. Be the first to open a store in {regionId}!
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {sellers.map((s) => (
                <SellerCard key={s.id} seller={s} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h2 className="text-sm font-semibold text-slate-100">
              Products from {regionId}
            </h2>
            {products.length === 0 && (
              <span className="text-[0.7rem] text-slate-500">
                Sample products • Real listings coming soon
              </span>
            )}
          </div>
          {loading ? (
            <div className="text-xs text-slate-500">Loading products...</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(products.length > 0 ? products : demoProducts).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MarketplaceLayout>
  );
}
