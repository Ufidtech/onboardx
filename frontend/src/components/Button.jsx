export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'w-full rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'
  const styles = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    secondary: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
