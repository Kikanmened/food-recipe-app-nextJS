'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecipeAction } from '@/app/actions/recipes'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui'

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

async function createRecipeRequest(payload) {
  const result = await createRecipeAction(payload)

  if (result.error) {
    throw new Error(result.error)
  }

  return result.recipe
}

const emptyForm = {
  title: '',
  ingredients: '',
  steps: '',
  imageUrl: '',
}

export default function RecipeForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const { data: session } = authClient.useSession()
  const user = session?.user

  const mutation = useMutation({
    mutationFn: createRecipeRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setForm(emptyForm)
      setTouched({})
      setSubmitted(false)
    },
  })

  const fieldErrors = {
    title: !form.title.trim(),
    ingredients: !parseIngredients(form.ingredients).length,
    imageUrl: !form.imageUrl.trim(),
    steps: !parseLines(form.steps).length,
  }

  function shouldShowError(name) {
    return fieldErrors[name] && (submitted || touched[name])
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

    if (!title || !ingredients.length || !imageUrl || !steps.length) {
      return
    }

    mutation.mutate({
      title,
      ingredients,
      steps,
      imageUrl,
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

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 shadow-md" noValidate>
      <div className="card-body space-y-4">
        <h2 className="card-title">Add a recipe</h2>

        <label className="form-control w-full">
          <span className="label-text mb-1">Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input input-bordered w-full ${shouldShowError('title') ? 'input-error' : ''}`}
            aria-invalid={shouldShowError('title')}
            required
          />
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
          <p className="text-error">{mutation.error.message}</p>
        ) : null}

        {mutation.isSuccess ? (
          <p className="text-success">Recipe added to the cookbook.</p>
        ) : null}

        <div className="card-actions justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save recipe'}
          </Button>
        </div>
      </div>
    </form>
  )
}
