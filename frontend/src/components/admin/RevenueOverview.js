// src/components/admin/RevenueOverview.js
import React, { useEffect, useState } from "react";
import { fetchRevenueOverview } from "../../api/adminApi";

export default function RevenueOverview() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | unauthorized
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetchRevenueOverview();
        if (!isMounted) return;
        setData(res);
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        if (
          err.message === "Not authorized to view revenue overview" ||
          err.message === "Not authorized"
        ) {
          setStatus("unauthorized");
        } else {
          setStatus("error");
          setErrorMsg(err.message || "Failed to load revenue");
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="p-4 border rounded bg-white text-gray-600">
        Loading revenue overview…
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="p-4 border rounded bg-white text-red-600 text-sm">
        You do not have permission to view revenue data.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 border rounded bg-white text-red-600 text-sm">
        Error loading revenue: {errorMsg}
      </div>
    );
  }

  // status === "ready"
  const {
    totalSponsoredOrders,
    totalSponsoredRevenueUSD,
    recentSponsorOrders,
    newsletterSubscribersCount,
    lastNewsletterSend,
  } = data || {};

  return (
    <div className="p-4 border rounded bg-white space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Revenue Overview
        </h2>
        <p className="text-sm text-gray-600">
          Stripe sponsored placements + newsletter stats
        </p>
      </div>

      {/* High-level stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Sponsored Orders
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {totalSponsoredOrders ?? 0}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Sponsored Revenue (USD)
          </div>
          <div className="text-xl font-semibold text-gray-900">
            ${Number(totalSponsoredRevenueUSD || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Newsletter Subs
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {newsletterSubscribersCount ?? 0}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Last Digest Send
          </div>
          <div className="text-sm font-medium text-gray-900">
            {lastNewsletterSend
              ? new Date(lastNewsletterSend.timestamp).toLocaleString()
              : "No sends yet"}
          </div>
          <div className="text-[11px] text-gray-500">
            {lastNewsletterSend
              ? `${lastNewsletterSend.recipientsCount} recipients`
              : ""}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-md font-semibold text-gray-900">
          Recent Sponsored Orders
        </h3>
        <div className="text-xs text-gray-500 mb-2">
          Latest 10 paid orders
        </div>

        {(!recentSponsorOrders || recentSponsorOrders.length === 0) && (
          <div className="text-sm text-gray-500 border rounded bg-gray-50 p-3">
            No paid sponsored orders yet.
          </div>
        )}

        {recentSponsorOrders && recentSponsorOrders.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 border-b">Opportunity ID</th>
                  <th className="px-3 py-2 border-b">Amount (USD)</th>
                  <th className="px-3 py-2 border-b">Contributor ID</th>
                  <th className="px-3 py-2 border-b">Paid At</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {recentSponsorOrders.map((order, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-[11px] text-gray-800">
                      {order.opportunityId?.substring(0, 8) || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-900 font-semibold">
                      ${Number(order.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-mono text-[11px]">
                      {order.contributorId?.substring(0, 8) || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {order.paidAt
                        ? new Date(order.paidAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digest section note */}
      <div className="text-[11px] text-gray-500 border-t pt-2">
        Newsletter digest metrics come from backend Phase 5.2.
      </div>
    </div>
  );
}
