// /app/frontend/src/components/business/BusinessCard.jsx
import React from "react";

export function BusinessCard({ business }) {
  if (!business) return null;

  const name =
    business.name ||
    business.title ||
    business.businessName ||
    "Untitled business";

  const category =
    (Array.isArray(business.categories) &&
      business.categories[0]) ||
    business.category ||
    business.primaryCategory ||
    "General";

  const location =
    business.location ||
    [business.city, business.state, business.country]
      .filter(Boolean)
      .join(", ") ||
    "Location not provided";

  const imageUrl =
    business.imageUrl ||
    business.logoUrl ||
    business.coverImage ||
    null;

  const isVerified =
    business.isVerified ||
    business.verified ||
    false;

  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <article className="bn-business-card">
      <div className="bn-business-card__media">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="bn-business-card__image"
          />
        ) : (
          <div className="bn-business-card__placeholder">
            <span className="bn-business-card__placeholder-letter">
              {firstLetter}
            </span>
          </div>
        )}
        {isVerified && (
          <div className="bn-business-card__badge">
            <span className="bn-business-card__badge-dot" />
            <span className="bn-business-card__badge-label">
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="bn-business-card__body">
        <h3 className="bn-business-card__name">
          {name}
        </h3>

        <div className="bn-business-card__meta">
          <span className="bn-business-card__category">
            {category}
          </span>
          <span className="bn-business-card__separator">
            •
          </span>
          <span className="bn-business-card__location">
            {location}
          </span>
        </div>

        {business.description && (
          <p className="bn-business-card__description">
            {business.description.length > 140
              ? business.description.slice(0, 137) + "..."
              : business.description}
          </p>
        )}
      </div>

      <footer className="bn-business-card__footer">
        <button
          type="button"
          className="bn-business-card__cta"
        >
          View profile
        </button>
      </footer>
    </article>
  );
}
