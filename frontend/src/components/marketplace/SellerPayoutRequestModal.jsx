// components/marketplace/SellerPayoutRequestModal.jsx - Phase 16.2
import React, { useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

export default function SellerPayoutRequestModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [methodDetails, setMethodDetails] = useState({
    bank_name: "",
    account_last4: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const MIN_PAYOUT = 20.00;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum < MIN_PAYOUT) {
      setError(`Minimum payout amount is $${MIN_PAYOUT.toFixed(2)}`);
      return;
    }

    if (amountNum > availableBalance) {
      setError(`Amount exceeds available balance of $${availableBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/marketplace/payouts/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: amountNum,
            method: method,
            method_details: method === "manual" ? null : methodDetails
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create payout request");
      }

      const data = await response.json();
      
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setAmount("");
        setMethodDetails({ bank_name: "", account_last4: "" });
        setSuccess(false);
        onSuccess && onSuccess(data);
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-amber-200">
            Request Payout
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="text-slate-400" size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Available Balance Info */}
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4">
            <div className="text-xs text-emerald-300/80 mb-1">
              Available Balance
            </div>
            <div className="text-2xl font-bold text-emerald-100">
              ${availableBalance.toFixed(2)}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Payout Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min={MIN_PAYOUT}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-500">
                Min: ${MIN_PAYOUT.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Use Max
              </button>
            </div>
          </div>

          {/* Payout Method */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Payout Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="manual">Manual (Zelle, Cash App, etc.)</option>
              <option value="paypal">PayPal</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Method Details (only for bank_transfer) */}
          {method === "bank_transfer" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={methodDetails.bank_name}
                  onChange={(e) => setMethodDetails({
                    ...methodDetails,
                    bank_name: e.target.value
                  })}
                  placeholder="e.g., Chase Bank"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Account Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength="4"
                  value={methodDetails.account_last4}
                  onChange={(e) => setMethodDetails({
                    ...methodDetails,
                    account_last4: e.target.value.replace(/\D/g, '')
                  })}
                  placeholder="1234"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-emerald-300">
                Payout request submitted successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || success}
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-[0.65rem] text-slate-500 text-center">
            Your payout request will be reviewed by our team. Typical processing time is 1-3 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
