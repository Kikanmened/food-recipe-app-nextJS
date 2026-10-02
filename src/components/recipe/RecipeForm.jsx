'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipes'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui'
import { formatIngredients } from '@/utils'
import { RECIPE_CATEGORIES, isRecipeCategory } from '@/utils/recipe-categories'

function parseLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseIngredients(text) {
  return parseLines(text).map((line) => {
    const [name, ...rest] = line.split(',')
    return {
      name: name.trim(),
      amount: rest.join(',').trim() || 'to taste',
    }
  })
}

const emptyForm = {
  title: '',
  ingredients: '',
  steps: '',
  imageUrl: '',
  category: '',
}

function initialForm(recipe) {
  if (!recipe) return emptyForm
  return {
    title: recipe.title || '',
    imageUrl: recipe.image_url || '',
    category: recipe.category || 'other',
    steps: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
    ingredients: formatIngredients(recipe.ingredients).map((item) => {
      if (typeof item === 'string') return item
      if (Array.isArray(item)) return item.join(', ')
      return [item?.name || item?.ingredient, item?.amount || item?.quantity].filter(Boolean).join(', ')
    }).join('\n'),
  }
}

export default function RecipeForm({ recipe, onSaved, onCancel }) {
  const isEditing = Boolean(recipe)
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => initialForm(recipe))
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const { data: session } = authClient.useSession()
  const user = session?.user

  const mutation = useMutation({
    async mutationFn(payload) {
      const result = isEditing
        ? await updateRecipeAction(recipe.id, payload)
        : await createRecipeAction(payload)
      if (result.error) throw new Error(result.error)
      return result.recipe
    },
    onSuccess(savedRecipe) {
      queryClient.setQueryData(['recipes'], (current) => Array.isArray(current)
        ? isEditing
          ? current.map((item) => item.id === savedRecipe.id ? savedRecipe : item)
          : [savedRecipe, ...current]
        : current)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      if (!isEditing) setForm(emptyForm)
      setTouched({})
      setSubmitted(false)
      onSaved?.(savedRecipe)
    },
  })

  const fieldErrors = {
    title: !form.title.trim(),
    category: !isRecipeCategory(form.category),
    ingredients: !parseIngredients(form.ingredients).length || parseIngredients(form.ingredients).some((item) => !item.name),
    imageUrl: !form.imageUrl.trim(),
    steps: !parseLines(form.steps).length,
  }

  function shouldShowError(name) {
    return Boolean(fieldErrors[name] && (submitted || touched[name]))
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleBlur(event) {
    const { name } = event.target
    setTouched((current) => ({ ...current, [name]: true }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    const title = form.title.trim()
    const ingredients = parseIngredients(form.ingredients)
    const steps = parseLines(form.steps)
    const imageUrl = form.imageUrl.trim()

    if (Object.values(fieldErrors).some(Boolean)) {
      return
    }

    mutation.mutate({
      title,
      ingredients,
      steps,
      imageUrl,
      category: form.category,
    })
  }

  if (!user) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Add a recipe</h2>
          <p className="text-base-content/70">
            Sign in to add a recipe to the cookbook.
          </p>
          <div className="card-actions">
            <Link href="/sign-in" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isEditing && String(recipe.user_id) !== String(user.id)) return null

  return (
    <form onSubmit={handleSubmit} className={isEditing ? 'border-y border-base-300 py-6' : 'card bg-base-200 shadow-md'} noValidate>
      <fieldset disabled={mutation.isPending} className={isEditing ? 'space-y-4' : 'card-body space-y-4'}>
        <h2 className="text-xl font-semibold">{isEditing ? 'Edit recipe' : 'Add a recipe'}</h2>

        <label className="form-control w-full">
          <span className="label-text mb-1">Title</span>
          <input
            name="title"
            autoFocus={isEditing}
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input input-bordered w-full ${shouldShowError('title') ? 'input-error' : ''}`}
            aria-invalid={shouldShowError('title')}
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`select select-bordered w-full ${shouldShowError('category') ? 'select-error' : ''}`}
            aria-invalid={shouldShowError('category')}
            required
          >
            <option value="" disabled>Select a category</option>
            {RECIPE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Ingredients</span>
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`textarea textarea-bordered min-h-28 w-full ${shouldShowError('ingredients') ? 'textarea-error' : ''}`}
            aria-invalid={shouldShowError('ingredients')}
            placeholder={'spaghetti, 400g\neggs, 4 large'}
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Photo URL</span>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input input-bordered w-full ${shouldShowError('imageUrl') ? 'input-error' : ''}`}
            aria-invalid={shouldShowError('imageUrl')}
            placeholder="/images/spaghetti-carbonara.png or https://..."
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Steps</span>
          <textarea
            name="steps"
            value={form.steps}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`textarea textarea-bordered min-h-28 w-full ${shouldShowError('steps') ? 'textarea-error' : ''}`}
            aria-invalid={shouldShowError('steps')}
            placeholder={'Boil the pasta.\nFry the guanciale.'}
            required
          />
        </label>

        {mutation.isError ? (
          <p role="alert" className="text-error">{mutation.error.message}</p>
        ) : null}

        {mutation.isSuccess ? (
          <p role="status" className="text-success">{isEditing ? 'Recipe updated.' : 'Recipe added to the cookbook.'}</p>
        ) : null}

        <div className="card-actions justify-end">
          {onCancel ? <Button variant="outline" onClick={onCancel}>Cancel</Button> : null}
          <Button type="submit" className="min-w-36" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Save recipe'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
