import RecipeCard from './RecipeCard'

export default function RecipeList({ recipes = [] }) {
  if (!recipes.length) {
    return <p className="text-base-content/70">No recipes found.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
