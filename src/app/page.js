import Link from 'next/link'
import { CategoryList } from '@/components/category'

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <div className="hero rounded-2xl bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold">Recipe Book</h1>
            <p className="py-6 text-base-content/80">
              Search recipes, view full instructions, and save favorites to your cookbook.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/search" className="btn btn-primary">
                Search recipes
              </Link>
              <Link href="/recipes" className="btn btn-outline">
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Browse by idea</h2>
        <CategoryList />
      </div>
    </section>
  )
}
