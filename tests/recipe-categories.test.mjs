import assert from 'node:assert/strict'
import { test } from 'node:test'
import { RECIPE_CATEGORIES, isRecipeCategory } from '../src/utils/recipe-categories.js'
import { applyRecipeFilters } from '../src/utils/recipe-filters.js'
import { normalizeRecipeInput } from '../src/utils/recipes.js'

const input = {
  title: 'Family favorite', ingredients: [{ name: 'tomato', amount: '1' }],
  steps: ['Cook'], imageUrl: '/food.jpg',
}

for (const { value } of RECIPE_CATEGORIES) {
  test(`${value} can be selected and found without that word in the title`, () => {
    const recipe = normalizeRecipeInput({ ...input, category: value })
    assert.ok(recipe)
    assert.equal(recipe.category, value)
    const otherRecipe = { ...recipe, title: value, category: value === 'other' ? 'pasta' : 'other' }
    assert.deepEqual(applyRecipeFilters([recipe, otherRecipe], { category: value }), [recipe])
  })
}

test('missing and invalid categories are rejected', () => {
  for (const category of [undefined, null, '', ' ', 'Pasta', 'seafood', {}, ['pasta']]) {
    assert.equal(isRecipeCategory(category), false)
    assert.equal(normalizeRecipeInput({ ...input, category }), null)
  }
})

test('a category change moves a recipe between category results', () => {
  const recipe = { ...input, category: 'pasta' }
  assert.equal(applyRecipeFilters([recipe], { category: 'pasta' }).length, 1)
  const updated = { ...recipe, category: 'vegetarian' }
  assert.equal(applyRecipeFilters([updated], { category: 'pasta' }).length, 0)
  assert.equal(applyRecipeFilters([updated], { category: 'vegetarian' }).length, 1)
})

test('category combines with title, ingredients, and sorting', () => {
  const recipes = [
    { ...input, title: 'Z Tomato', category: 'vegetarian' },
    { ...input, title: 'A Tomato', category: 'vegetarian' },
    { ...input, title: 'Chicken Tomato', category: 'chicken' },
  ]
  const results = applyRecipeFilters(recipes, { category: 'vegetarian', query: 'tomato', ingredient: 'tomato', minIngredients: '1', sort: 'title' })
  assert.deepEqual(results.map((recipe) => recipe.title), ['A Tomato', 'Z Tomato'])
  assert.equal(applyRecipeFilters(recipes, { category: 'vegetarian', ingredient: 'beef' }).length, 0)
  assert.equal(applyRecipeFilters(recipes, { category: 'vegetarian', minIngredients: '4' }).length, 0)
})

test('legacy recipes remain visible in All and Other without guessing dietary categories', () => {
  const legacyRecipe = { ...input, title: 'Vegetable and chicken soup' }
  assert.equal(applyRecipeFilters([legacyRecipe]).length, 1)
  assert.equal(applyRecipeFilters([legacyRecipe], { category: 'other' }).length, 1)
  assert.equal(applyRecipeFilters([legacyRecipe], { category: 'vegetarian' }).length, 0)
})
