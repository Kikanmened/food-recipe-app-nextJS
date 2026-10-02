import { createRecipe, getAllRecipes } from '@/provider/queries'

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
  const title = body.title?.trim()
  const ingredients = body.ingredients
  const steps = body.steps
  const imageUrl = body.imageUrl?.trim()

  if (!title || !ingredients?.length || !imageUrl || !steps?.length) {
    return Response.json(
      { error: 'title, ingredients, photo URL, and steps are required' },
      { status: 400 }
    )
  }

  const recipe = await createRecipe({
    userId: user.id,
    title,
    ingredients,
    steps,
    imageUrl,
  })

  return Response.json(recipe, { status: 201 })
}
