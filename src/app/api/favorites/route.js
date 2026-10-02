import { getCurrentUser } from '@/lib/auth/server'
import {
  getRecipeById,
  getFavoriteRecipesForUser,
  saveFavoriteRecipe,
  removeFavoriteRecipe,
  updateFavoriteNote,
} from '@/provider/queries'
import { isRecipeId } from '@/utils/recipes'
import { DUPLICATE_FAVORITE_ERROR, normalizeFavorite } from '@/utils/favorites'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return Response.json({ error: 'Sign in to view your favorites.' }, { status: 401 })

    const items = await getFavoriteRecipesForUser(user.id)
    return Response.json(items.map(normalizeFavorite))
  } catch {
    return Response.json({ error: 'Unable to load your favorites. Please try again.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return Response.json({ error: 'Sign in to save favorites.' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const recipeId = body?.recipeId ?? body?.id
    if (!isRecipeId(recipeId) || (body?.note !== undefined && typeof body.note !== 'string')) {
      return Response.json({ error: 'A valid recipe and note are required.' }, { status: 400 })
    }

    const recipe = await getRecipeById(recipeId)
    if (!recipe) return Response.json({ error: 'Recipe not found.' }, { status: 404 })

    const favorite = await saveFavoriteRecipe({
      userId: user.id,
      recipeId,
      title: recipe.title,
      imageUrl: recipe.image_url,
      note: body.note ?? '',
    })
    if (!favorite) return Response.json({ error: DUPLICATE_FAVORITE_ERROR }, { status: 409 })

    return Response.json(normalizeFavorite(favorite), { status: 201 })
  } catch (error) {
    if (error.code === '23503') return Response.json({ error: 'Recipe not found.' }, { status: 404 })
    return Response.json({ error: 'Unable to save this favorite. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return Response.json({ error: 'Sign in to update favorites.' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const recipeId = body?.recipeId ?? body?.id
    if (!isRecipeId(recipeId) || typeof body?.note !== 'string') {
      return Response.json({ error: 'A valid recipe and note are required.' }, { status: 400 })
    }

    const favorite = await updateFavoriteNote({ userId: user.id, recipeId, note: body.note })
    if (!favorite) return Response.json({ error: 'Favorite not found.' }, { status: 404 })
    return Response.json(normalizeFavorite(favorite))
  } catch {
    return Response.json({ error: 'Unable to save your note. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return Response.json({ error: 'Sign in to remove favorites.' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const recipeId = body?.recipeId ?? body?.id
    if (!isRecipeId(recipeId)) return Response.json({ error: 'A valid recipe is required.' }, { status: 400 })

    const favorite = await removeFavoriteRecipe({ userId: user.id, recipeId })
    if (!favorite) return Response.json({ error: 'Favorite not found.' }, { status: 404 })
    return Response.json({ success: true, recipeId })
  } catch {
    return Response.json({ error: 'Unable to remove this favorite. Please try again.' }, { status: 500 })
  }
}
