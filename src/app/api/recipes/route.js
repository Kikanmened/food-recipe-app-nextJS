import { createRecipe, getAllRecipes } from '@/provider/queries'
import { normalizeRecipeInput, RECIPE_REQUIRED_FIELDS_ERROR } from '@/utils/recipes'

export const dynamic = 'force-dynamic'

export async function GET() {
  const recipes = await getAllRecipes()
  return Response.json(recipes)
}

export async function POST(request) {
  const { getCurrentUser } = await import('@/lib/auth/server')
  const user = await getCurrentUser()

  if (!user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const input = normalizeRecipeInput(body)
  if (!input) {
    return Response.json(
      { error: RECIPE_REQUIRED_FIELDS_ERROR },
      { status: 400 }
    )
  }

  const recipe = await createRecipe({
    userId: user.id,
    ...input,
  })

  return Response.json(recipe, { status: 201 })
}
