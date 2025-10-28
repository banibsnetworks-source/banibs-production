// src/pages/OpportunityDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFullOpportunity } from "../api/opportunitiesApi";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | notfound
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchFullOpportunity(id);
        if (!isMounted) return;
        setOpportunity(data);
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        if (err.message === "Not found") {
          setStatus("notfound");
        } else {
          setErrorMsg(err.message || "Failed to load");
          setStatus("error");
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (status === "loading") {
    return <div className="p-4 text-gray-600">Loading opportunity…</div>;
  }

  if (status === "notfound") {
    return (
      <div className="p-4 text-red-600">
        This opportunity is not available or has not been approved.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 text-red-600">
        Error loading opportunity: {errorMsg}
      </div>
    );
  }

  // status === "ready"
  const {
    title,
    description,
    type,
    location,
    createdAt,
    contributor_display_name,
    contributor_verified,
    like_count,
    comment_count,
    is_sponsored,
    sponsor_label,
    imageUrl,
  } = opportunity || {};

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Sponsored badge */}
      {is_sponsored && (
        <div className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
          {sponsor_label || "Sponsored"}
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      {/* Meta row */}
      <div className="text-sm text-gray-600 space-y-1">
        <div>
          <span className="font-semibold">Type:</span> {type || "—"}
        </div>
        <div>
          <span className="font-semibold">Location:</span>{" "}
          {location || "Not specified"}
        </div>
        <div>
          <span className="font-semibold">Posted:</span>{" "}
          {createdAt
            ? new Date(createdAt).toLocaleString()
            : "Unknown date"}
        </div>
      </div>

      {/* Contributor info */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700">
        <div className="font-semibold text-gray-900">Submitted by</div>
        <div>
          {contributor_display_name || "Unknown contributor"}
          {contributor_verified && (
            <span className="ml-2 text-xs text-blue-600">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Image (if provided) */}
      {imageUrl && (
        <div className="w-full">
          <img
            src={imageUrl}
            alt={title || "opportunity image"}
            className="w-full h-auto rounded border border-gray-200 object-cover"
          />
        </div>
      )}

      {/* Description */}
      <div className="prose max-w-none text-gray-800 whitespace-pre-line">
        {description || "No description provided."}
      </div>

      {/* Engagement metrics */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold">{like_count ?? 0}</span> Likes
        </div>
        <div>
          <span className="font-semibold">{comment_count ?? 0}</span>{" "}
          Comments
        </div>
      </div>

      {/* TODO later: Like / Comment UI (actions, rate-limited) */}
      <div className="text-xs text-gray-500 border-t pt-4">
        Interactions are rate-limited and abuse-protected.
      </div>
    </div>
  );
}
