import { createRecipe, getAllRecipes } from '@/provider/queries'

export async function GET() {
  const recipes = await getAllRecipes()
  return Response.json(recipes)
}

export async function POST(request) {
  const { auth } = await import('@/lib/auth/server')
  const session = await auth.getSession()

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const title = body.title?.trim()
  const ingredients = body.ingredients
  const steps = body.steps

  if (!title || !ingredients || !steps) {
    return Response.json(
      { error: 'title, ingredients, and steps are required' },
      { status: 400 }
    )
  }

  const recipe = await createRecipe({
    userId: session.user.id,
    title,
    ingredients,
    steps,
  })

  return Response.json(recipe, { status: 201 })
}
