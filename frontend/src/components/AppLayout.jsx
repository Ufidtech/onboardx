import { useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email.toLowerCase())

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-canvas/95 backdrop-blur-sm max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/onboardx-logo.svg" alt="OnboardX" className="h-6" />
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && <Link to="/admin" className="text-xs text-gray-500 underline">Admin</Link>}
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button onClick={handleLogout} className="text-xs text-teal-700 underline">
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  )
}