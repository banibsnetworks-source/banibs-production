// /app/frontend/src/components/business/DirectoryHeader.jsx
import React from "react";

const REGIONS = [
  { id: "all", label: "All regions" },
  { id: "na", label: "North America" },
  { id: "caribbean", label: "Caribbean" },
  { id: "africa", label: "Africa" },
  { id: "europe", label: "Europe" },
  { id: "latin", label: "Latin America" }
];

export function DirectoryHeader({
  searchQuery,
  onSearchChange,
  activeRegion,
  onRegionChange,
  totalCount,
  allCount
}) {
  return (
    <header className="bn-directory-hero">
      <div className="bn-directory-hero__content">
        <div>
          <p className="bn-kicker">BANIBS Business Network</p>
          <h1 className="bn-directory-hero__title">
            Find trusted Black-owned & allied businesses.
          </h1>
          <p className="bn-directory-hero__subtitle">
            Search the BANIBS directory by category, region, and
            community. Built for serious business, powered by
            our people.
          </p>
        </div>

        <div className="bn-directory-hero__right">
          <div className="bn-directory-hero__stats-card">
            <span className="bn-directory-hero__stats-label">
              Businesses listed
            </span>
            <div className="bn-directory-hero__stats-values">
              <span className="bn-directory-hero__stats-main">
                {totalCount}
              </span>
              {typeof allCount === "number" && allCount > totalCount && (
                <span className="bn-directory-hero__stats-sub">
                  of {allCount} total
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bn-directory-hero__controls">
        <div className="bn-directory-search">
          <div className="bn-directory-search__icon" aria-hidden="true">
            🔍
          </div>
          <input
            type="text"
            className="bn-directory-search__input"
            placeholder="Search by name, category, or location…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="bn-directory-filters">
          <div className="bn-directory-filter-group">
            <span className="bn-directory-filter-label">
              Region
            </span>
            <div className="bn-directory-filter-chips">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onRegionChange(region.id)}
                  className={
                    "bn-chip " +
                    (activeRegion === region.id
                      ? "bn-chip--active"
                      : "bn-chip--ghost")
                  }
                >
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
