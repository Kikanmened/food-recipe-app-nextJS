export default function Loader({ size = 'lg', className = '' }) {
  return (
    <span
      className={`loading loading-spinner loading-${size} text-primary ${className}`}
      aria-label="Loading"
    />
  )
}
