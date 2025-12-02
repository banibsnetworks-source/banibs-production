// /app/frontend/src/pages/business/BusinessDirectory.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import FullWidthLayout from "../../components/layouts/FullWidthLayout";
import { categoryOptions } from "../../data/businessCategories";
import { DirectoryHeader } from "../../components/business/DirectoryHeader";
import { CategoryGrid } from "../../components/business/CategoryGrid";
import { BusinessCard } from "../../components/business/BusinessCard";

const DEFAULT_REGION = "all";

const normalizeCategories = (flatCategories) => {
  if (!Array.isArray(flatCategories)) return [];

  const groups = [];
  let currentGroup = null;

  flatCategories.forEach((item) => {
    if (item.type === 'header') {
      // Create a new group when we hit a header
      const groupLabel = item.label.replace(/━/g, '').trim();
      currentGroup = {
        id: groupLabel.toLowerCase().replace(/\s+/g, '-'),
        label: groupLabel,
        categories: []
      };
      groups.push(currentGroup);
    } else if (item.type === 'category' && currentGroup && item.value) {
      // Add category to current group (trim leading spaces)
      currentGroup.categories.push(item.label.trim());
    }
  });

  return groups;
};

export default function BusinessDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeRegion, setActiveRegion] = useState(DEFAULT_REGION);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        
        // Add region filter if not "all"
        if (activeRegion && activeRegion !== DEFAULT_REGION) {
          params.append('region', activeRegion);
        }
        
        // Add category filter if selected
        if (activeCategory) {
          params.append('category', activeCategory);
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/business/search?${params.toString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setBusinesses(Array.isArray(data) ? data : []);
        } else {
          const errorData = await response.json();
          setError(errorData?.detail || 'Failed to load businesses');
        }
      } catch (err) {
        console.error('Failed to fetch businesses:', err);
        setError('Unable to load businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [activeRegion, activeCategory]);

  const categoryGroups = useMemo(
    () => normalizeCategories(categoryOptions),
    []
  );

  const filteredBusinesses = useMemo(() => {
    let results = Array.isArray(businesses) ? [...businesses] : [];

    // Client-side search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter((biz) => {
        const name =
          biz.name || biz.title || biz.businessName || "";
        const desc =
          biz.description || biz.about || "";
        const location =
          biz.location ||
          [biz.city, biz.state, biz.country].filter(Boolean).join(", ");
        return (
          name.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          location.toLowerCase().includes(q)
        );
      });
    }

    return results;
  }, [businesses, searchQuery]);

  const totalCount = filteredBusinesses.length;
  const allCount = businesses.length;

  return (
    <FullWidthLayout>
      <div className="bn-directory-page">
        {/* Breadcrumb Navigation - Inside Page Content, Below Global Header */}
        <div className="bn-directory-nav">
          <div className="bn-directory-nav__left">
            <button
              onClick={() => navigate(-1)}
              className="bn-directory-nav__back"
              title="Go back"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="bn-directory-nav__breadcrumbs">
              <button
                onClick={() => navigate('/')}
                className="bn-directory-nav__breadcrumb"
              >
                <Home size={16} />
                <span>Home</span>
              </button>
              <span className="bn-directory-nav__separator">/</span>
              <span className="bn-directory-nav__current">Business Directory</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/portal/business')}
            className="bn-directory-nav__portal"
          >
            Business Portal
          </button>
        </div>

      <DirectoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        totalCount={totalCount}
        allCount={allCount}
      />

      <section className="bn-directory-layout">
        <aside className="bn-directory-sidebar">
          <CategoryGrid
            groups={categoryGroups}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
          />
        </aside>

        <main className="bn-directory-results">
          <header className="bn-directory-results__header">
            <div>
              <h2 className="bn-directory-results__title">
                Discover businesses in BANIBS
              </h2>
              <p className="bn-directory-results__subtitle">
                Showing{" "}
                <strong>{totalCount}</strong>{" "}
                {totalCount === 1 ? "business" : "businesses"}
                {activeRegion !== DEFAULT_REGION && (
                  <>
                    {" "}
                    in <span className="bn-pill">{activeRegion}</span>
                  </>
                )}
                {activeCategory && (
                  <>
                    {" "}
                    under{" "}
                    <span className="bn-pill bn-pill--soft">
                      {activeCategory}
                    </span>
                  </>
                )}
              </p>
            </div>
          </header>

          {loading ? (
            <div className="bn-directory-empty">
              <h3>Loading businesses...</h3>
              <p>Please wait while we fetch the directory.</p>
            </div>
          ) : error ? (
            <div className="bn-directory-empty">
              <h3>Error loading businesses</h3>
              <p>{error}</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="bn-directory-empty">
              <h3>No results found</h3>
              <p>
                Try adjusting your search, switching regions, or
                choosing a different category.
              </p>
            </div>
          ) : (
            <div className="bn-business-grid">
              {filteredBusinesses.map((biz, idx) => (
                <BusinessCard
                  key={biz.id || biz.slug || idx}
                  business={biz}
                />
              ))}
            </div>
          )}
        </main>
      </section>
      </div>
    </FullWidthLayout>
  );
}
