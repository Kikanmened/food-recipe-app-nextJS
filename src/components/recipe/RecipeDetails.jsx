'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRecipeAction } from '@/app/actions/recipes'
import { useFavorites } from '@/context'
import { authClient } from '@/lib/auth/client'
import { formatIngredients } from '@/utils'
import RecipeImage from './RecipeImage'
import RecipeForm from './RecipeForm'
import { recipeCategoryLabel } from '@/utils/recipe-categories'
import FavoriteButton from './FavoriteButton'

function ingredientLabel(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (Array.isArray(item)) {
    const [name, amount] = item
    return amount ? `${amount} ${name}` : String(name)
  }
  if (typeof item === 'object') {
    const name = item.name || item.ingredient || ''
    const amount = item.amount || item.quantity || ''
    return [amount, name].filter(Boolean).join(' ')
  }
  return String(item)
}

export default function RecipeDetails({ recipe }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const deleteDialog = useRef(null)
  const editButton = useRef(null)
  const { data: session } = authClient.useSession()
  const { onRecipeUpdated, onRecipeDeleted } = useFavorites()
  const isOwner = Boolean(session?.user?.id && String(session.user.id) === String(recipe.user_id))
  const ingredients = formatIngredients(recipe.ingredients)
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  const deletion = useMutation({
    async mutationFn() {
      const result = await deleteRecipeAction(recipe.id)
      if (result.error) throw new Error(result.error)
      return result
    },
    onSuccess() {
      onRecipeDeleted(recipe.id)
      queryClient.setQueryData(['recipes'], (current) => Array.isArray(current)
        ? current.filter((item) => item.id !== recipe.id)
        : current)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      deleteDialog.current?.close()
      router.replace('/recipes')
      router.refresh()
    },
  })

  function finishEditing(updatedRecipe) {
    setIsEditing(false)
    editButton.current?.focus()
    if (updatedRecipe) {
      onRecipeUpdated(updatedRecipe)
      setMessage('Recipe updated.')
      router.refresh()
    }
  }

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="min-w-0 break-words text-3xl font-bold">{recipe.title}</h1>
        <FavoriteButton key={recipe.id} recipe={recipe} />
      </div>

      <span className="badge badge-outline">{recipeCategoryLabel(recipe.category)}</span>

      {isOwner ? (
        <div className="flex flex-wrap gap-3">
          <button ref={editButton} type="button" className="btn btn-outline" aria-expanded={isEditing} disabled={deletion.isPending} onClick={() => { setMessage(''); setIsEditing(true) }}>
            Edit recipe
          </button>
          <button type="button" className="btn btn-outline btn-error" disabled={isEditing || deletion.isPending} onClick={() => { deletion.reset(); deleteDialog.current?.showModal() }}>
            Delete recipe
          </button>
        </div>
      ) : null}

      {message ? <p role="status" className="text-success">{message}</p> : null}

      {isOwner && isEditing ? (
        <RecipeForm key={recipe.id} recipe={recipe} onSaved={finishEditing} onCancel={() => finishEditing()} />
      ) : null}

      <RecipeImage key={recipe.image_url} recipe={recipe} className="h-72 w-full rounded-2xl object-cover" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5">
          {ingredients.map((item, index) => (
            <li key={index}>{ingredientLabel(item)}</li>
          ))}
        </ul>
      </section>

      {isOwner ? (
        <dialog ref={deleteDialog} className="modal" aria-labelledby="delete-recipe-title" onCancel={(event) => { if (deletion.isPending) event.preventDefault() }}>
          <div className="modal-box max-w-md rounded-lg">
            <h2 id="delete-recipe-title" className="text-xl font-semibold">Delete recipe?</h2>
            <p className="mt-3 break-words">Delete &quot;{recipe.title}&quot;? This cannot be undone and will remove it from favorites.</p>
            {deletion.isError ? <p role="alert" className="mt-3 text-error">{deletion.error.message}</p> : null}
            <div className="modal-action flex-wrap">
              <button type="button" className="btn btn-outline" autoFocus disabled={deletion.isPending} onClick={() => deleteDialog.current?.close()}>Cancel</button>
              <button type="button" className="btn btn-error min-w-36" disabled={deletion.isPending} onClick={() => deletion.mutate()}>
                {deletion.isPending ? 'Deleting...' : 'Delete recipe'}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>
    </article>
  )
}
