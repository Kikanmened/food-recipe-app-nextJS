import CategoryCard from './CategoryCard'
import { RECIPE_CATEGORIES } from '@/utils/recipe-categories'

export default function CategoryList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {RECIPE_CATEGORIES.filter((category) => category.value !== 'other').map((category) => (
        <CategoryCard key={category.value} title={category.label} description={category.description} href={`/search?category=${category.value}`} />
      ))}
    </div>
  )
}
