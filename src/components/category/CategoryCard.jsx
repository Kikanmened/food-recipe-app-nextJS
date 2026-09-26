import Link from 'next/link'

export default function CategoryCard({ title, description, href }) {
  return (
    <Link href={href} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </Link>
  )
}
