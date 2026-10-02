'use server'

import { getCurrentUser } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'
import { createRecipe, updateRecipe, deleteRecipe } from '@/provider/queries'
import { isRecipeId, normalizeRecipeInput, RECIPE_REQUIRED_FIELDS_ERROR } from '@/utils/recipes'

export async function createRecipeAction(payload) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return { error: 'Sign in to add a recipe.' }
    }

    const input = normalizeRecipeInput(payload)
    if (!input) {
      return { error: RECIPE_REQUIRED_FIELDS_ERROR }
    }

    const recipe = await createRecipe({
      userId: user.id,
      ...input,
    })
    return { recipe }
  } catch (error) {
    return { error: error.message }
  }
}

export async function updateRecipeAction(id, payload) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return { error: 'Sign in to edit a recipe.' }
    if (!isRecipeId(id)) return { error: 'Recipe not found or you do not have permission to edit it.' }

    const input = normalizeRecipeInput(payload)
    if (!input) return { error: RECIPE_REQUIRED_FIELDS_ERROR }

    const recipe = await updateRecipe({ ...input, id, userId: user.id })
    if (!recipe) return { error: 'Recipe not found or you do not have permission to edit it.' }

    revalidatePath(`/recipes/${id}`)
    revalidatePath('/recipes')
    return { recipe }
  } catch {
    return { error: 'Unable to update the recipe. Please try again.' }
  }
}

export async function deleteRecipeAction(id) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return { error: 'Sign in to delete a recipe.' }
    if (!isRecipeId(id)) return { error: 'Recipe not found or you do not have permission to delete it.' }

    const recipe = await deleteRecipe({ id, userId: user.id })
    if (!recipe) return { error: 'Recipe not found or you do not have permission to delete it.' }

    revalidatePath('/recipes')
    return { success: true }
  } catch {
    return { error: 'Unable to delete the recipe. Please try again.' }
  }
}
