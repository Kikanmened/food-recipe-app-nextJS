'use client'

import { RECIPE_CATEGORIES } from '@/utils/recipe-categories'
export { applyRecipeFilters } from '@/utils/recipe-filters'

export default function RecipeFilters({ filters, onChange }) {
  function handleChange(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="form-control w-full">
        <span className="label-text mb-1">Category</span>
        <select name="category" value={filters.category || ''} onChange={handleChange} className="select select-bordered w-full">
          <option value="">All categories</option>
          {RECIPE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </label>
      <label className="form-control w-full">
        <span className="label-text mb-1">Sort</span>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="newest">Newest</option>
          <option value="title">Title A–Z</option>
          <option value="ingredients">Fewest ingredients</option>
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text mb-1">Min ingredients</span>
        <select
          name="minIngredients"
          value={filters.minIngredients}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
          <option value="6">6+</option>
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text mb-1">Ingredient contains</span>
        <input
          name="ingredient"
          value={filters.ingredient}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="chicken, pasta..."
        />
      </label>
    </div>
  )
}
