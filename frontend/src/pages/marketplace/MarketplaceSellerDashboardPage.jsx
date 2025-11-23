// pages/marketplace/MarketplaceSellerDashboardPage.jsx - Phase 16.1.5 & 16.2
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import SellerPayoutRequestModal from "../../components/marketplace/SellerPayoutRequestModal";
import { 
  Wallet, 
  Package, 
  TrendingUp, 
  Clock, 
  DollarSign,
  ShoppingBag,
  AlertCircle,
  Download
} from "lucide-react";

export default function MarketplaceSellerDashboardPage() {
  const [sellerData, setSellerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [payoutOverview, setPayoutOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    fetchSellerData();
    fetchSellerOrders();
    fetchPayoutOverview();
    fetchPayouts();
  }, []);

  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/marketplace/seller/me`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.ok) {
        const data = await res.json();
        setSellerData(data);
      } else if (res.status === 404) {
        setError("not_registered");
      } else {
        setError("fetch_failed");
      }
    } catch (err) {
      console.error("Failed to fetch seller data:", err);
      setError("fetch_failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/marketplace/orders/seller/my`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch seller orders:", err);
    }
  };

  const calculateDaysUntilClearing = () => {
    // T+2 clearing logic
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // If today is Friday (5), Saturday (6), or Sunday (0)
    // Next clearing is Monday + 2 days = Wednesday
    if (dayOfWeek === 5) return 5; // Friday -> Wednesday
    if (dayOfWeek === 6) return 4; // Saturday -> Wednesday
    if (dayOfWeek === 0) return 3; // Sunday -> Wednesday
    
    return 2; // Default T+2
  };

  const getTotalSales = () => {
    return orders.reduce((sum, order) => {
      if (order.payment_status === "paid") {
        return sum + order.grand_total;
      }
      return sum;
    }, 0);
  };

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-sm text-slate-400">Loading seller dashboard...</div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (error === "not_registered") {
    return (
      <MarketplaceLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800">
            <ShoppingBag className="mx-auto text-slate-600 mb-4" size={64} />
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              Not Registered as a Seller
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              You need to register as a seller before accessing the seller dashboard. Contact support to set up your seller profile.
            </p>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (error === "fetch_failed") {
    return (
      <MarketplaceLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 rounded-2xl bg-rose-900/20 border border-rose-500/30">
            <AlertCircle className="mx-auto text-rose-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Please try again later or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const pendingPayout = sellerData?.pending_payout_balance || 0;
  const availablePayout = sellerData?.available_payout_balance || 0;
  const totalSales = getTotalSales();
  const totalOrders = orders.filter(o => o.payment_status === "paid").length;
  const daysUntilClearing = calculateDaysUntilClearing();

  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-amber-200 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Track your sales, manage payouts, and grow your business
          </p>
        </div>

        {/* Payout Balance Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pending Payout */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-400" size={20} />
                <h3 className="text-sm font-semibold text-amber-200">
                  Pending Payout
                </h3>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[0.65rem] font-semibold text-amber-300 border border-amber-500/30">
                T+{daysUntilClearing}
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-100 mb-2">
              ${pendingPayout.toFixed(2)}
            </div>
            <p className="text-xs text-amber-300/70">
              Funds clearing in {daysUntilClearing} business day{daysUntilClearing !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Available Payout */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="text-emerald-400" size={20} />
                <h3 className="text-sm font-semibold text-emerald-200">
                  Available for Payout
                </h3>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[0.65rem] font-semibold text-emerald-300 border border-emerald-500/30">
                READY
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-100 mb-2">
              ${availablePayout.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-300/70">
              Ready to transfer to your bank account
            </p>
          </div>
        </div>

        {/* Sales Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Total Sales */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-violet-400" size={18} />
              <h4 className="text-xs font-semibold text-slate-300">
                Total Sales
              </h4>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              ${totalSales.toFixed(2)}
            </div>
            <p className="text-[0.65rem] text-slate-500 mt-1">
              Lifetime revenue
            </p>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-blue-400" size={18} />
              <h4 className="text-xs font-semibold text-slate-300">
                Total Orders
              </h4>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {totalOrders}
            </div>
            <p className="text-[0.65rem] text-slate-500 mt-1">
              Completed sales
            </p>
          </div>

          {/* Average Order */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="text-green-400" size={18} />
              <h4 className="text-xs font-semibold text-slate-300">
                Avg. Order Value
              </h4>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              ${totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00'}
            </div>
            <p className="text-[0.65rem] text-slate-500 mt-1">
              Per transaction
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-blue-200/80">
              <strong className="text-blue-100">Payout Schedule:</strong> Funds from sales are held for T+2 business days before becoming available for payout. This ensures secure transaction processing and buyer protection. Once funds are available, you can request a payout to your connected bank account (coming in Phase 16.2).
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Link
              to="/portal/marketplace"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition group"
            >
              <div>
                <div className="text-sm font-semibold text-slate-100 group-hover:text-amber-200 transition">
                  View Marketplace
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Browse your store as a customer
                </div>
              </div>
              <ShoppingBag className="text-slate-500 group-hover:text-amber-400 transition" size={20} />
            </Link>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 opacity-60">
              <div>
                <div className="text-sm font-semibold text-slate-400">
                  Manage Products
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Coming in Phase 16.2+
                </div>
              </div>
              <Package className="text-slate-600" size={20} />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              Recent Orders ({orders.length})
            </h3>
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex-1">
                    <div className="text-xs font-mono font-semibold text-slate-100">
                      {order.order_number}
                    </div>
                    <div className="text-[0.65rem] text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-amber-300">
                      ${order.seller_net_amount?.toFixed(2) || order.grand_total.toFixed(2)}
                    </div>
                    <div className="text-[0.65rem] text-slate-500">
                      {order.payment_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
}
