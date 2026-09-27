export default function RecipeImage({ recipe, className = 'h-48 w-full object-cover' }) {
  const src = recipe.image_url || recipe.imageUrl

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-base-300 text-base-content/50 ${className}`}>
        No photo
      </div>
    )
  }

  return <img src={src} alt={recipe.title} className={className} />
}
