import { useLocation, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import WeekPath from '../components/WeekPath'

export default function PlanView() {
  const { state } = useLocation()
  const plan = state?.plan

  if (!plan) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4 text-center text-sm text-gray-500">
        No plan found. <Link to="/" className="text-teal-deep underline">Go to your dashboard</Link>.
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Your starter path</p>
        <h1 className="font-display text-xl font-semibold mb-4 text-ink">{plan.title}</h1>

        <WeekPath weeks={plan.weeks} currentWeek={1} />

        {plan.mentor && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-pale/60 text-teal-deep flex items-center justify-center text-xs font-medium">
              {plan.mentor.initials}
            </div>
            <p className="text-sm">
              Matched with <span className="font-medium text-ink">{plan.mentor.name}</span>, {plan.mentor.specialty} mentor
            </p>
          </div>
        )}

        {!plan.mentor && plan.matchType === 'self-guided' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              All matching mentors are at capacity right now, so you've been placed on a
              <span className="font-medium text-ink"> Self-Guided + AI</span> track. Your AI-generated
              plan above still guides you week by week -- a mentor can be assigned later if one frees up.
            </p>
          </div>
        )}

        <Link to="/">
          <Button className="mt-4">Go to my dashboard</Button>
        </Link>
      </Card>
    </div>
  )
}