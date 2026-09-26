'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Button from './Button'

export default function SearchBar({ placeholder = 'Search recipes...' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  function handleSubmit(event) {
    event.preventDefault()
    const nextQuery = query.trim()
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="input input-bordered w-full"
        aria-label="Search recipes"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
