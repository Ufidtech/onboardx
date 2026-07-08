import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function LandingPage() {
  return (
    <div className="max-w-md mx-auto mt-16 px-4 text-center">
      <img src="/onboardx-logo.svg" alt="OnboardX" className="h-8 mx-auto mb-8" />

      <h1 className="font-display text-2xl font-semibold text-ink mb-3">
        Structured onboarding, real mentorship.
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Every new member gets an AI-guided starter path and a real mentor from
        your community -- not just another WhatsApp group.
      </p>

      <div className="space-y-3">
        <Link to="/signup?role=learner">
          <Button>Join as a new member</Button>
        </Link>
        <Link to="/signup?role=mentor">
          <Button variant="secondary">Become a mentor</Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Already have an account? <Link to="/login" className="text-teal-deep underline">Log in</Link>
      </p>
    </div>
  )
}