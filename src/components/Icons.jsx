export const Arrow = () => (
  <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

export const Spark = ({ className = 'spark' }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 0c.6 5.8 4.2 9.4 10 10-5.8.6-9.4 4.2-10 10-.6-5.8-4.2-9.4-10-10C5.8 9.4 9.4 5.8 10 0z" fill="currentColor" />
  </svg>
)
