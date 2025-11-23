// pages/community/RecipeDetailPage.jsx - Phase 11.6.3
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  ChefHat, 
  ArrowLeft, 
  Clock, 
  Users, 
  Heart,
  AlertCircle,
  Sparkles,
  Utensils
} from "lucide-react";

export default function RecipeDetailPage() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHealthierVersion, setShowHealthierVersion] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [slug]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/food/recipes/${slug}`
      );

      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      } else if (response.status === 404) {
        setError("Recipe not found");
      } else {
        setError("Failed to load recipe");
      }
    } catch (err) {
      console.error("Failed to fetch recipe:", err);
      setError("Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading recipe...</div>
      </CommunityLayout>
    );
  }

  if (error || !recipe) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/community/food"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Recipes
            </Link>
          </div>
        </div>
      </CommunityLayout>
    );
  }

  const currentInstructions = showHealthierVersion && recipe.healthier_version_md 
    ? recipe.healthier_version_md 
    : recipe.traditional_instructions_md;

  const currentIngredients = showHealthierVersion && recipe.ingredients_healthier
    ? recipe.ingredients_healthier
    : recipe.ingredients_traditional;

  return (
    <CommunityLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/portal/community/food"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Recipes
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <ChefHat className="text-amber-400" size={20} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-100">
                  {recipe.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {recipe.origin_region} cuisine
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
                {recipe.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                {recipe.difficulty}
              </span>
              {recipe.is_family_submitted && (
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                  Community Submitted
                </span>
              )}
            </div>
          </div>

          {/* Recipe Image Placeholder */}
          <div className="rounded-2xl aspect-video bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-slate-800">
            <ChefHat className="text-amber-400/30" size={80} />
          </div>

          {/* Version Toggle */}
          {recipe.healthier_version_md && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">
                    Choose Your Version
                  </h3>
                  <p className="text-xs text-slate-400">
                    Traditional recipe or healthier adaptation
                  </p>
                </div>
                <button
                  onClick={() => setShowHealthierVersion(!showHealthierVersion)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    showHealthierVersion
                      ? "bg-green-500/20 border-2 border-green-500 text-green-300"
                      : "bg-amber-500/20 border-2 border-amber-500 text-amber-300"
                  }`}
                >
                  {showHealthierVersion ? (
                    <span className="flex items-center gap-2">
                      <Heart size={14} />
                      Healthier
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} />
                      Traditional
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Utensils size={18} />
              Ingredients
            </h2>
            <ul className="space-y-2">
              {currentIngredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-4">Instructions</h2>
            <div className="prose prose-invert prose-amber max-w-none text-sm text-slate-300 whitespace-pre-line">
              {currentInstructions}
            </div>
          </div>

          {/* Dietary Notes */}
          {recipe.dietary_notes && recipe.dietary_notes.length > 0 && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Dietary Notes</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary_notes.map((note) => (
                  <span
                    key={note}
                    className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300"
                  >
                    {note.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recipe Info */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-5">
            <h3 className="text-sm font-bold text-amber-100 mb-4">Recipe Info</h3>
            <div className="space-y-3">
              {recipe.prep_time_minutes && (
                <div className="flex items-center gap-3 text-sm text-slate-100">
                  <Clock className="text-amber-400" size={16} />
                  <div>
                    <div className="text-xs text-slate-400">Prep Time</div>
                    <div>{recipe.prep_time_minutes} min</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-slate-100">
                <Clock className="text-amber-400" size={16} />
                <div>
                  <div className="text-xs text-slate-400">Cook Time</div>
                  <div>{recipe.cook_time_minutes} min</div>
                </div>
              </div>
              {recipe.servings && (
                <div className="flex items-center gap-3 text-sm text-slate-100">
                  <Users className="text-amber-400" size={16} />
                  <div>
                    <div className="text-xs text-slate-400">Servings</div>
                    <div>{recipe.servings} people</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submitted By */}
          {recipe.is_family_submitted && recipe.submitted_by_name && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-2">Submitted By</h3>
              <p className="text-sm text-slate-300">{recipe.submitted_by_name}</p>
              <p className="text-xs text-slate-400 mt-2">
                Thank you for sharing your family recipe!
              </p>
            </div>
          )}

          {/* Share Your Recipe CTA */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              Have a Family Recipe?
            </h3>
            <Link
              to="/portal/community/food/submit"
              className="block w-full px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold text-center hover:bg-amber-600 transition"
            >
              Share Your Recipe
            </Link>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
