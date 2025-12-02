// pages/marketplace/MarketplaceOrdersPage.jsx - Phase 16.1.5
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import { Package, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function MarketplaceOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/marketplace/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) return; // Already loaded

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/marketplace/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.ok) {
        const data = await res.json();
        setOrderItems(prev => ({
          ...prev,
          [orderId]: data.items || []
        }));
      }
    } catch (err) {
      console.error("Failed to fetch order items:", err);
    }
  };

  const handleToggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { icon: CheckCircle, text: "PAID", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
      mock_paid: { icon: AlertCircle, text: "TEST/SANDBOX", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
      pending: { icon: AlertCircle, text: "PENDING", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      failed: { icon: XCircle, text: "FAILED", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
      refunded: { icon: Package, text: "REFUNDED", color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const handleDownload = async (fileId, productTitle) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/marketplace/digital/download/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productTitle}.file`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Download failed. Please ensure you have purchased this item.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-sm text-slate-400">Loading orders...</div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <MarketplaceLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800">
            <Package className="mx-auto text-slate-600 mb-4" size={64} />
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              No Orders Yet
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              When you support diaspora sellers, your purchases will appear here.
            </p>
            <Link
              to="/portal/marketplace"
              className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-amber-200 mb-2">
            My Orders
          </h1>
          <p className="text-sm text-slate-400">
            View your purchase history and download digital products
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden hover:border-amber-500/30 transition"
            >
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => handleToggleExpand(order.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm font-mono font-semibold text-slate-100">
                        {order.order_number}
                      </div>
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-amber-300">
                      ${order.grand_total.toFixed(2)}
                    </div>
                    {order.platform_fee_amount > 0 && (
                      <div className="text-[0.65rem] text-slate-500">
                        Platform fee: ${order.platform_fee_amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items (Expanded) */}
              {expandedOrder === order.id && (
                <div className="border-t border-slate-800 bg-slate-950/50 p-4">
                  {orderItems[order.id] ? (
                    <div className="space-y-3">
                      {orderItems[order.id].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 py-2"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-100">
                              {item.product_title}
                            </div>
                            <div className="text-xs text-slate-400">
                              {item.product_type === "digital" ? (
                                <span className="text-violet-400">💾 Digital Product</span>
                              ) : (
                                <span>📦 Physical Product</span>
                              )}
                              {" • "}
                              Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-slate-100">
                              ${item.total_price.toFixed(2)}
                            </div>
                            {item.product_type === "digital" && 
                             (order.payment_status === "paid" || order.payment_status === "mock_paid") &&
                             item.digital_file_id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(item.digital_file_id, item.product_title);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold hover:bg-violet-500/30 transition"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Order Summary */}
                      <div className="pt-3 mt-3 border-t border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Items Total:</span>
                          <span>${order.total_amount.toFixed(2)}</span>
                        </div>
                        {order.shipping_cost > 0 && (
                          <div className="flex justify-between text-slate-400">
                            <span>Shipping:</span>
                            <span>${order.shipping_cost.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-amber-300 pt-1">
                          <span>Total Paid:</span>
                          <span>${order.grand_total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Loading items...</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MarketplaceLayout>
  );
}
