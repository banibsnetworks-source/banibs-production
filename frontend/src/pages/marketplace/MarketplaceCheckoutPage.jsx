// pages/marketplace/MarketplaceCheckoutPage.jsx
import React, { useEffect, useState } from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import CartItem from "../../components/marketplace/CartItem";
import CheckoutSummary from "../../components/marketplace/CheckoutSummary";

const CART_KEY = "banibs_marketplace_cart_v1";

function loadCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export default function MarketplaceCheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  const handleUpdateQty = (index, newQty) => {
    setCartItems((prev) => {
      const next = [...prev];
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...next[index], quantity: newQty };
      }
      saveCart(next);
      return next;
    });
  };

  const handleRemove = (index) => {
    setCartItems((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      saveCart(next);
      return next;
    });
  };

  const handleCheckout = async () => {
    setMessage(null);
    if (cartItems.length === 0) {
      setMessage({ type: "error", text: "Your cart is empty." });
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        buyer_region: "North America",
        shipping_address: {
          street: "123 Mock St",
          city: "Test City",
          state: "TS",
          zip: "12345",
          country: "USA"
        }
      };

      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/orders/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Order failed: ${res.status}`);
      }
      const data = await res.json();

      setMessage({
        type: "success",
        text:
          "Mock order created! payment_status is 'mock_paid'. Order #" +
          (data?.order_number || data?.id || "N/A"),
      });

      setCartItems([]);
      saveCart([]);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Could not place mock order. Please try again.",
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <MarketplaceLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl font-semibold text-amber-200 mb-1">
          Cart & Mock Checkout
        </h1>
        <p className="text-xs text-slate-400 mb-5">
          This is a{" "}
          <span className="text-amber-300 font-semibold">sandbox</span> flow.
          Orders are saved with{" "}
          <span className="text-amber-300">payment_status: "mock_paid"</span>.
          No real money moves yet.
        </p>

        <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-start">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Your Cart
            </h2>
            {cartItems.length === 0 ? (
              <div className="text-xs text-slate-500">
                Your cart is empty. Go back to the marketplace and add some
                products.
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  onUpdateQty={(qty) => handleUpdateQty(idx, qty)}
                  onRemove={() => handleRemove(idx)}
                />
              ))
            )}
          </div>

          <CheckoutSummary
            items={cartItems}
            onCheckout={handleCheckout}
            loading={placing}
          />
        </div>

        {message && (
          <div
            className={[
              "mt-4 rounded-xl px-3 py-2 text-xs border",
              message.type === "success"
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-100"
                : "border-rose-500/60 bg-rose-500/10 text-rose-100",
            ].join(" ")}
          >
            {message.text}
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
}