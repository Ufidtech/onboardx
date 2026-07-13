export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16 gap-3">
      <div className="w-6 h-6 border-2 border-teal-pale border-t-teal-deep rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}