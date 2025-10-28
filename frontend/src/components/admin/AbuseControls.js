// src/components/admin/AbuseControls.js
import React, { useEffect, useState } from "react";
import {
  fetchBannedSources,
  banSource,
  unbanSource,
} from "../../api/adminApi";

export default function AbuseControls() {
  const [banned, setBanned] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error | unauthorized
  const [errorMsg, setErrorMsg] = useState("");

  const [ipHashInput, setIpHashInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadList() {
    try {
      const res = await fetchBannedSources();
      setBanned(res || []);
      setStatus("ready");
    } catch (err) {
      if (
        err.message === "Not authorized to view banned sources" ||
        err.message === "Not authorized"
      ) {
        setStatus("unauthorized");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Failed to load ban list");
      }
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBanSubmit(e) {
    e.preventDefault();
    if (!ipHashInput.trim()) return;

    setSubmitting(true);
    try {
      await banSource(ipHashInput.trim(), reasonInput.trim());
      setIpHashInput("");
      setReasonInput("");
      await loadList();
    } catch (err) {
      alert(err.message || "Failed to ban source");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnban(ip_hash) {
    const yes = window.confirm(
      `Unban source ${ip_hash}? They will regain access.`
    );
    if (!yes) return;
    try {
      await unbanSource(ip_hash);
      await loadList();
    } catch (err) {
      alert(err.message || "Failed to unban source");
    }
  }

  if (status === "loading") {
    return (
      <div className="p-4 border rounded bg-white text-gray-600">
        Loading abuse controls…
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="p-4 border rounded bg-white text-red-600 text-sm">
        You do not have permission to manage banned sources.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 border rounded bg-white text-red-600 text-sm">
        Error loading banned sources: {errorMsg}
      </div>
    );
  }

  // status === "ready"
  return (
    <div className="p-4 border rounded bg-white space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Abuse & Safety</h2>
        <p className="text-sm text-gray-600">
          Rate limiting + IP hash bans for spam / harassment / bot abuse.
        </p>
      </div>

      {/* Ban form */}
      <form
        onSubmit={handleBanSubmit}
        className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3"
      >
        <div className="text-sm font-semibold text-gray-900">
          Ban a source
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">
              IP Hash (exact match)
            </label>
            <input
              className="border rounded px-2 py-1 text-gray-900 text-sm"
              value={ipHashInput}
              onChange={(e) => setIpHashInput(e.target.value)}
              placeholder="e.g. 8f1a9c3e..."
              required
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-xs text-gray-600 mb-1">
              Reason / Notes (optional)
            </label>
            <input
              className="border rounded px-2 py-1 text-gray-900 text-sm"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="spam bot / threats / abuse"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded disabled:opacity-50"
          >
            {submitting ? "Banning…" : "Ban Source"}
          </button>
        </div>

        <div className="text-[11px] text-gray-500">
          This immediately blocks comment / like / newsletter subscribe
          actions for that IP hash.
        </div>
      </form>

      {/* Current banned list */}
      <div>
        <div className="text-sm font-semibold text-gray-900 mb-2">
          Currently Banned Sources
        </div>

        {banned.length === 0 && (
          <div className="text-sm text-gray-500 border rounded bg-gray-50 p-3">
            No banned sources.
          </div>
        )}

        {banned.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 border-b">IP Hash</th>
                  <th className="px-3 py-2 border-b">Reason</th>
                  <th className="px-3 py-2 border-b">Banned At</th>
                  <th className="px-3 py-2 border-b"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {banned.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-[11px] text-gray-800 break-all">
                      {row.ip_hash_display || row.ip_hash}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {row.reason || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleUnban(row.ip_hash)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-[11px] text-gray-500 mt-2">
          Unban restores the ability for that source to interact. Use
          carefully.
        </div>
      </div>
    </div>
  );
}
