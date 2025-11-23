// pages/community/RecipeSubmitPage.jsx - Phase 11.6.3
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { ChefHat, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function RecipeSubmitPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    origin_region: "",
    category: "main",
    difficulty: "moderate",
    traditional_instructions_md: "",
    healthier_version_md: "",
    ingredients_traditional: "",
    ingredients_healthier: "",
    cook_time_minutes: "",
    prep_time_minutes: "",
    servings: "",
    tags: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Please log in to submit recipes");
        setSubmitting(false);
        return;
      }

      // Parse ingredients from text area (one per line)
      const ingredientsTraditional = formData.ingredients_traditional
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const ingredientsHealthier = formData.ingredients_healthier
        ? formData.ingredients_healthier.split('\n').map(i => i.trim()).filter(i => i.length > 0)
        : null;

      const tags = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      const submissionData = {
        title: formData.title,
        origin_region: formData.origin_region,
        category: formData.category,
        difficulty: formData.difficulty,
        traditional_instructions_md: formData.traditional_instructions_md,
        healthier_version_md: formData.healthier_version_md || null,
        ingredients_traditional: ingredientsTraditional,
        ingredients_healthier: ingredientsHealthier,
        cook_time_minutes: parseInt(formData.cook_time_minutes),
        prep_time_minutes: formData.prep_time_minutes ? parseInt(formData.prep_time_minutes) : null,
        servings: formData.servings ? parseInt(formData.servings) : null,
        tags: tags
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/food/recipes/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        }
      );

      if (response.ok) {
        setSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/portal/community/food');
        }, 2000);
      } else if (response.status === 401) {
        setError("Please log in to submit recipes");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to submit recipe. Please try again.");
      }
    } catch (err) {
      console.error("Recipe submission error:", err);
      setError("Failed to submit recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-8 text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Recipe Submitted Successfully!
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Thank you for sharing your family recipe. Our team will review it and it will appear in the recipe collection once approved.
            </p>
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

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <ChefHat className="text-amber-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Share Your Family Recipe
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Help preserve our culinary heritage for future generations
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Grandma's Sweet Potato Pie"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Origin Region *
                  </label>
                  <input
                    type="text"
                    name="origin_region"
                    value={formData.origin_region}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Deep South, Caribbean"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="main">Main Dish</option>
                    <option value="side">Side Dish</option>
                    <option value="dessert">Dessert</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="snack">Snack</option>
                    <option value="drink">Drink</option>
                    <option value="sauce">Sauce/Condiment</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Cook Time (min) *
                  </label>
                  <input
                    type="number"
                    name="cook_time_minutes"
                    value={formData.cook_time_minutes}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="45"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    min="1"
                    placeholder="6"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Recipe */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Traditional Recipe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Ingredients (one per line) *
                </label>
                <textarea
                  name="ingredients_traditional"
                  value={formData.ingredients_traditional}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="2 cups all-purpose flour&#10;1 cup sugar&#10;3 large eggs&#10;..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Instructions *
                </label>
                <textarea
                  name="traditional_instructions_md"
                  value={formData.traditional_instructions_md}
                  onChange={handleChange}
                  required
                  rows="8"
                  placeholder="1. Preheat oven to 350°F&#10;2. Mix flour and sugar...&#10;3. Add eggs one at a time..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Healthier Version (Optional) */}
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-2">
              Healthier Version (Optional)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Share a healthier adaptation if you have one
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Healthier Ingredients (one per line)
                </label>
                <textarea
                  name="ingredients_healthier"
                  value={formData.ingredients_healthier}
                  onChange={handleChange}
                  rows="6"
                  placeholder="2 cups whole wheat flour&#10;3/4 cup coconut sugar&#10;3 large eggs..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Healthier Instructions
                </label>
                <textarea
                  name="healthier_version_md"
                  value={formData.healthier_version_md}
                  onChange={handleChange}
                  rows="8"
                  placeholder="1. Preheat oven to 325°F (lower temp)&#10;2. Mix whole wheat flour and coconut sugar..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3">
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              to="/portal/community/food"
              className="px-6 py-3 rounded-lg bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Recipe for Review"}
            </button>
          </div>
        </form>
      </div>
    </CommunityLayout>
  );
}
