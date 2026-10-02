import { getCurrentUser } from '@/lib/auth/server'
import {
  getFavoriteRecipesForUser,
  isFavoriteRecipe,
  saveFavoriteRecipe,
  removeFavoriteRecipe,
  updateFavoriteNote,
} from '@/provider/queries'

export const dynamic = 'force-dynamic'

function normalizeFavoriteEntry(row) {
  return {
    id: String(row.recipe_id ?? row.id),
    title: row.title ?? '',
    image_url: row.image_url ?? '',
    note: row.note ?? '',
    created_at: row.created_at ?? null,
  }
}

export async function GET() {
  const user = await getCurrentUser()

  if (!user?.id) {
    return Response.json([], { status: 200 })
  }

  const items = await getFavoriteRecipesForUser(user.id)
  return Response.json(items.map(normalizeFavoriteEntry))
}

export async function POST(request) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const recipeId = body.recipeId ?? body.id
  const title = (body.title ?? '').trim()
  const imageUrl = body.imageUrl ?? body.image_url ?? ''
  const note = body.note ?? ''

  if (!recipeId || !title) {
    return Response.json({ error: 'Recipe selection is required.' }, { status: 400 })
  }

  const existing = await isFavoriteRecipe({ userId: user.id, recipeId })

  if (existing) {
    const favorite = await updateFavoriteNote({ userId: user.id, recipeId, note })
    return Response.json(normalizeFavoriteEntry({ ...favorite, recipe_id: recipeId, title, image_url: imageUrl }))
  }

  const favorite = await saveFavoriteRecipe({
    userId: user.id,
    recipeId,
    title,
    imageUrl,
    note,
  })

  return Response.json(normalizeFavoriteEntry({ ...favorite, recipe_id: recipeId, title, image_url: imageUrl }))
}

export async function PUT(request) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const recipeId = body.recipeId ?? body.id
  const note = body.note ?? ''

  if (!recipeId) {
    return Response.json({ error: 'Recipe selection is required.' }, { status: 400 })
  }

  const favorite = await updateFavoriteNote({ userId: user.id, recipeId, note })

  if (!favorite) {
    return Response.json({ error: 'Favorite not found.' }, { status: 404 })
  }

  return Response.json(normalizeFavoriteEntry({ ...favorite, recipe_id: recipeId }))
}

export async function DELETE(request) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const recipeId = body.recipeId ?? body.id

  if (!recipeId) {
    return Response.json({ error: 'Recipe selection is required.' }, { status: 400 })
  }

  const favorite = await removeFavoriteRecipe({ userId: user.id, recipeId })

  if (!favorite) {
    return Response.json({ error: 'Favorite not found.' }, { status: 404 })
  }

  return Response.json({ success: true, recipeId })
}
