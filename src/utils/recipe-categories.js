export const RECIPE_CATEGORIES = [
  { value: 'pasta', label: 'Pasta', description: 'Classic Italian dishes and sauces.' },
  { value: 'chicken', label: 'Chicken', description: 'Quick weeknight chicken recipes.' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'Meat-free meals and curries.' },
  { value: 'breakfast', label: 'Breakfast', description: 'Pancakes and morning favorites.' },
  { value: 'other', label: 'Other' },
]

export function isRecipeCategory(value) {
  return RECIPE_CATEGORIES.some((category) => category.value === value)
}

export function recipeCategoryLabel(value) {
  return RECIPE_CATEGORIES.find((category) => category.value === value)?.label || 'Other'
}
