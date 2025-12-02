// /app/frontend/src/components/business/CategoryGrid.jsx
import React from "react";

export function CategoryGrid({
  groups,
  activeCategory,
  onCategorySelect
}) {
  const handleSelect = (categoryLabel) => {
    if (!onCategorySelect) return;
    if (activeCategory === categoryLabel) {
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryLabel);
    }
  };

  return (
    <div className="bn-category-panel">
      <div className="bn-category-panel__header">
        <h3>Browse by category</h3>
        <p>Tap a category to filter directory results.</p>
      </div>

      <div className="bn-category-panel__body">
        {groups.map((group) => (
          <section
            key={group.id}
            className="bn-category-section"
          >
            <h4 className="bn-category-section__title">
              {group.label}
            </h4>
            <div className="bn-category-section__grid">
              {(group.categories || []).map((cat, idx) => {
                const label =
                  (typeof cat === "string"
                    ? cat
                    : cat.label || cat.name || cat.title) || "Category";

                return (
                  <button
                    key={`${group.id}-${idx}-${label}`}
                    type="button"
                    className={
                      "bn-category-pill " +
                      (activeCategory === label
                        ? "bn-category-pill--active"
                        : "")
                    }
                    onClick={() => handleSelect(label)}
                  >
                    <span className="bn-category-pill__dot" />
                    <span className="bn-category-pill__label">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
