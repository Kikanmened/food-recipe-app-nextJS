'use server'

import { getCurrentUser } from '@/lib/auth/server'
import { createRecipe } from '@/provider/queries'

export async function createRecipeAction(payload) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return { error: 'Sign in to add a recipe.' }
  }

  const title = payload.title?.trim()
  const ingredients = payload.ingredients
  const steps = payload.steps
  const imageUrl = payload.imageUrl?.trim() || null

  if (!title || !ingredients?.length || !steps?.length) {
    return { error: 'title, ingredients, and steps are required' }
  }

  try {
    const recipe = await createRecipe({
      userId: user.id,
      title,
      ingredients,
      steps,
      imageUrl,
    })
    return { recipe }
  } catch (error) {
    return { error: error.message }
  }
}
