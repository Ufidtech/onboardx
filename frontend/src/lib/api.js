const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Request to ${path} failed: ${text}`)
  }
  return res.json()
}

// Sends intake answers, gets back a structured 4-week plan (feature 3)
export function generatePlan({ userId, interests, currentSkillLevel, timeAvailable, community }) {
  return post('/api/generate-plan', { userId, interests, currentSkillLevel, timeAvailable, community })
}

// Finds and assigns a mentor based on interests (feature 4)
export function matchMentor({ userId, interests }) {
  return post('/api/match', { userId, interests })
}

// Submits a weekly check-in and gets back a shareable shoutout (feature 7)
export function submitCheckIn({ userId, weekNumber, status }) {
  return post('/api/checkin', { userId, weekNumber, status })
}

// Generates the next 4-week plan after path completion (feature 8)
export function generateNextPlan({ userId }) {
  return post('/api/generate-next-plan', { userId })
}

// Joins the learner into a peer study group based on their interest topic
export function joinStudyGroup({ userId }) {
  return post('/api/join-study-group', { userId })
}

// Cancels a stale pending mentor request and switches the learner to
// Self-Guided + AI instead of waiting indefinitely for a response
export function cancelPendingMatch({ userId, matchId, mentorId }) {
  return post('/api/cancel-pending-match', { userId, matchId, mentorId })
}