// pages/community/FoodHomePage.jsx - Phase 11.6
import React, { useEffect, useState } from "react";
import CommunityLayout from "../../components/community/CommunityLayout";
import { ChefHat, Heart, Clock, Users } from "lucide-react";

export default function FoodHomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/food/recipes?limit=6`
      );

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading recipes...</div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <ChefHat className="text-amber-400" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Culinary & Cultural Recipes
          </h1>
        </div>
        <p className="text-base text-slate-300 max-w-3xl">
          Preserve our food heritage while adapting for health. Traditional and healthier versions, side-by-side.
        </p>
      </div>

      {/* Regional Categories */}
      <div className="grid md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Deep South", count: recipes.filter(r => r.origin_region === 'Deep South').length },
          { label: "Caribbean", count: recipes.filter(r => r.origin_region === 'Caribbean').length },
          { label: "West Africa", count: 0 },
          { label: "Urban Soul", count: 0 },
          { label: "Diaspora Fusion", count: 0 }
        ].map((region) => (
          <button
            key={region.label}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/50 transition text-center"
          >
            <div className="text-xs font-semibold text-slate-100">{region.label}</div>
            <div className="text-[0.65rem] text-slate-400 mt-1">{region.count} recipes</div>
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">Featured Recipes</h2>
          <Link
            to="/portal/community/food/submit"
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition"
          >
            Share Your Recipe
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/portal/community/food/recipes/${recipe.slug}`}
              className="rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden hover:border-amber-500/50 transition block"
            >
              <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <ChefHat className="text-amber-400/50" size={48} />
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-slate-100 mb-2">
                  {recipe.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{recipe.cook_time_minutes} min</span>
                  </div>
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{recipe.servings}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {recipe.origin_region}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                    {recipe.category}
                  </span>
                  {recipe.healthier_version_md && (
                    <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-1">
                      <Heart size={10} />
                      Healthier version
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CommunityLayout>
  );
}