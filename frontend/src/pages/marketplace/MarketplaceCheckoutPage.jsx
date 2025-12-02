// pages/marketplace/MarketplaceCheckoutPage.jsx - Phase 16.1.5 Real Payments
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import CartItem from "../../components/marketplace/CartItem";
import { AlertCircle, Wallet, CheckCircle } from "lucide-react";

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
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    setCartItems(loadCart());
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setWalletLoading(false);
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accounts && data.accounts.length > 0) {
          setWalletBalance(data.accounts[0].current_balance);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const hasPhysical = cartItems.some(item => item.product?.product_type !== "digital");
    const shipping = hasPhysical ? 5.0 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();
  const isInsufficientFunds = walletBalance !== null && walletBalance < total;
  const shortage = isInsufficientFunds ? (total - walletBalance).toFixed(2) : 0;

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

    if (walletBalance === null) {
      setMessage({ type: "error", text: "Please set up your BANIBS Wallet first." });
      return;
    }

    if (isInsufficientFunds) {
      setMessage({ 
        type: "error", 
        text: `Insufficient funds. You need $${shortage} more to complete this purchase.` 
      });
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
          street: "123 Main St",
          city: "Demo City",
          state: "CA",
          zip: "12345",
          country: "USA"
        }
      };

      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        
        // Handle 402 Payment Required
        if (res.status === 402) {
          throw new Error(errData.detail || "Insufficient funds in your wallet.");
        }
        
        throw new Error(errData.detail || `Payment failed: ${res.status}`);
      }

      const data = await res.json();

      // Success!
      setOrderSuccess({
        orderNumber: data.order_number,
        total: data.grand_total,
        paymentStatus: data.payment_status,
        platformFee: data.platform_fee_amount,
        hasDigital: cartItems.some(item => item.product?.product_type === "digital")
      });

      // Clear cart
      setCartItems([]);
      saveCart([]);
      
      // Refresh wallet balance
      await fetchWalletBalance();

    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Payment processing failed. Please try again.",
      });
    } finally {
      setPlacing(false);
    }
  };

  // Success screen
  if (orderSuccess) {
    return (
      <MarketplaceLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/40 p-8 text-center">
            <CheckCircle className="mx-auto text-emerald-400 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-emerald-200 mb-2">
              Payment Successful!
            </h1>
            <p className="text-slate-300 mb-6">
              Your order has been confirmed and payment processed.
            </p>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-slate-400">Order Number:</div>
                <div className="text-amber-300 font-mono font-semibold">{orderSuccess.orderNumber}</div>
                
                <div className="text-slate-400">Total Paid:</div>
                <div className="text-slate-100 font-semibold">${orderSuccess.total.toFixed(2)}</div>
                
                <div className="text-slate-400">Payment Status:</div>
                <div className="text-emerald-400 font-semibold uppercase">{orderSuccess.paymentStatus}</div>
                
                <div className="text-slate-400">Platform Fee:</div>
                <div className="text-slate-400">${orderSuccess.platformFee.toFixed(2)}</div>
              </div>

              {orderSuccess.hasDigital && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-violet-300">
                    💾 Your digital items are now available for download in My Orders.
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                to="/portal/marketplace/orders"
                className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
              >
                View My Orders
              </Link>
              <Link
                to="/portal/marketplace"
                className="px-6 py-3 rounded-xl border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl font-semibold text-amber-200 mb-1">
          Checkout
        </h1>
        <p className="text-xs text-slate-400 mb-5">
          Complete your purchase using your BANIBS Wallet
        </p>

        {/* Wallet Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/30 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="text-amber-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Payment Method</div>
                <div className="text-sm font-semibold text-slate-100">BANIBS Wallet</div>
              </div>
            </div>
            <div className="text-right">
              {walletLoading ? (
                <div className="text-xs text-slate-500">Loading balance...</div>
              ) : walletBalance === null ? (
                <Link 
                  to="/portal/wallet"
                  className="text-xs text-amber-300 hover:text-amber-200 underline"
                >
                  Set up wallet →
                </Link>
              ) : (
                <>
                  <div className="text-xs text-slate-400">Available Balance</div>
                  <div className="text-lg font-bold text-amber-300">
                    ${walletBalance.toFixed(2)}
                  </div>
                </>
              )}
            </div>
          </div>

          {walletBalance === null && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-200">
              ⚠️ You need a BANIBS Wallet to complete this purchase.{" "}
              <Link to="/portal/wallet" className="underline font-semibold">
                Open Wallet
              </Link>
            </div>
          )}
        </div>

        {/* Insufficient Funds Warning */}
        {isInsufficientFunds && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/40 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-rose-200 mb-1">
                Insufficient Funds
              </div>
              <div className="text-xs text-rose-300">
                You are short by <span className="font-bold">${shortage}</span>. 
                Please add funds to your BANIBS Wallet to complete this order.
              </div>
              <Link
                to="/portal/wallet"
                className="inline-block mt-2 text-xs text-rose-200 underline hover:text-rose-100"
              >
                View Wallet →
              </Link>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-start">
          {/* Cart Items */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Your Cart
            </h2>
            {cartItems.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">
                Your cart is empty.{" "}
                <Link to="/portal/marketplace" className="text-amber-300 underline">
                  Start shopping
                </Link>
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

          {/* Order Summary */}
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
              onClick={handleCheckout}
              disabled={placing || cartItems.length === 0 || walletBalance === null || isInsufficientFunds}
              className="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(205,127,50,0.4)] transition-shadow"
            >
              {placing ? "Processing Payment..." : "Pay Now"}
            </button>

            <p className="text-[0.65rem] text-slate-500">
              ✓ Real wallet payment - Funds will be deducted from your BANIBS Wallet
            </p>
          </div>
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