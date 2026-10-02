'use client'

import { useRef } from 'react'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth/client'
import { DUPLICATE_FAVORITE_ERROR, normalizeFavorite, normalizeFavoriteList, requestFavorites } from '@/utils/favorites'
import { FavoritesContext } from './FavoritesContext'

export default function FavoritesState({ children }) {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const queryKey = ['favorites', userId]
  const inFlight = useRef(new Set())
  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => normalizeFavoriteList(await requestFavorites('GET', undefined, signal)),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  })
  const favorites = userId ? query.data || [] : []

  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: ({ method, recipeId, note }) => requestFavorites(method, { recipeId, ...(note !== undefined ? { note } : {}) }),
    onMutate: ({ accountId }) => queryClient.cancelQueries({ queryKey: ['favorites', accountId] }),
    onSuccess(result, { method, recipeId, accountId }) {
      queryClient.setQueryData(['favorites', accountId], (current = []) => {
        if (method === 'DELETE') return current.filter((favorite) => favorite.id !== String(recipeId))
        const favorite = normalizeFavorite(result)
        return method === 'POST'
          ? [favorite, ...current.filter((item) => item.id !== favorite.id)]
          : current.map((item) => item.id === favorite.id ? favorite : item)
      })
    },
    onSettled: (_data, _error, { accountId }) => queryClient.invalidateQueries({ queryKey: ['favorites', accountId] }),
  })
  const pendingIds = useMutationState({
    filters: { mutationKey: queryKey, status: 'pending' },
    select: (pending) => String(pending.state.variables.recipeId),
  })

  async function mutateFavorite(method, recipeId, note) {
    if (!userId) throw new Error('Sign in to manage your favorites.')
    const key = userId + ':' + recipeId
    const current = queryClient.getQueryData(queryKey) || []
    if (method === 'POST' && current.some((favorite) => favorite.id === String(recipeId))) {
      throw new Error(DUPLICATE_FAVORITE_ERROR)
    }
    if (inFlight.current.has(key)) throw new Error('This favorite is already being updated.')
    inFlight.current.add(key)
    try {
      return await mutation.mutateAsync({ method, recipeId, note, accountId: userId })
    } finally {
      inFlight.current.delete(key)
    }
  }

  const value = {
    favorites,
    isLoading: Boolean(isSessionPending || (userId && query.isPending)),
    error: userId ? query.error : null,
    refetch: query.refetch,
    isFavorite: (recipeId) => favorites.some((favorite) => favorite.id === String(recipeId)),
    isFavoritePending: (recipeId) => pendingIds.includes(String(recipeId)),
    addFavorite: (recipe) => mutateFavorite('POST', recipe.id),
    updateNote: (recipeId, note) => mutateFavorite('PUT', recipeId, note),
    removeFavorite: (recipeId) => mutateFavorite('DELETE', recipeId),
    onRecipeUpdated(recipe) {
      queryClient.setQueryData(queryKey, (current = []) => current.map((favorite) => favorite.id === String(recipe.id)
        ? { ...favorite, title: recipe.title, image_url: recipe.image_url || '' }
        : favorite))
    },
    onRecipeDeleted(recipeId) {
      queryClient.setQueryData(queryKey, (current = []) => current.filter((favorite) => favorite.id !== String(recipeId)))
    },
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
