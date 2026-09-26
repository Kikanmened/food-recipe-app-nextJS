import CategoryCard from './CategoryCard'

const categories = [
  {
    title: 'Pasta',
    description: 'Classic Italian dishes and sauces.',
    href: '/search?q=pasta',
  },
  {
    title: 'Chicken',
    description: 'Quick weeknight chicken recipes.',
    href: '/search?q=chicken',
  },
  {
    title: 'Vegetarian',
    description: 'Plant-based meals and curries.',
    href: '/search?q=vegetable',
  },
  {
    title: 'Breakfast',
    description: 'Pancakes and morning favorites.',
    href: '/search?q=pancake',
  },
]

export default function CategoryList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.title} {...category} />
      ))}
    </div>
  )
}
