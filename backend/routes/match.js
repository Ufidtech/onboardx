import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'
import { checkAndRematchForNewMentor } from '../services/rematch.js'

const router = Router()

const MAX_MENTEES_PER_MENTOR = 3

// Finds mentors whose specialty matches the learner's stated interest AND
// who are still under the capacity cap. A mentor at capacity is treated as
// unavailable for new matches, full stop -- not deprioritized, excluded.
function findAvailableBySpecialty(mentors, interests) {
  const lower = interests.toLowerCase()
  return mentors.filter(
    (m) =>
      lower.includes((m.specialty || '').toLowerCase()) &&
      (m.currentMentees?.length || 0) < MAX_MENTEES_PER_MENTOR
  )
}

async function routeToSelfGuided(userId) {
  await db.collection('learnerProfiles').doc(userId).set(
    { track: 'self-guided', assignedMentorId: null, selfGuidedSince: new Date().toISOString() },
    { merge: true }
  )
  await upsertOnboardingStatus(userId, { mentorName: 'Self-guided + AI', track: 'self-guided' })
}

// POST /api/match
router.post('/match', async (req, res) => {
  const { userId, interests } = req.body
  if (!userId || !interests) {
    return res.status(400).json({ error: 'userId and interests are required' })
  }

  try {
    const mentorsSnap = await db.collection('mentorProfiles').get()
    const mentors = mentorsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const available = findAvailableBySpecialty(mentors, interests)

    // MENTOR CAPACITY CAP + FALLBACK ROUTING
    // If every mentor matching this specialty is already at the 3-mentee
    // cap, we deliberately do NOT load-balance onto an unrelated mentor --
    // an unrelated match is worse than no match. Instead the learner is
    // routed into a Self-Guided + AI track. `selfGuidedSince` is recorded
    // so a later rematch (see services/rematch.js) can prioritize whoever
    // has been waiting longest, not just whoever happens to be found first.
    if (available.length === 0) {
      await routeToSelfGuided(userId)
      return res.json({ mentor: null, matchType: 'self-guided' })
    }

    // Prefer the mentor with the most room among candidates.
    const candidates = [...available].sort(
      (a, b) => (a.currentMentees?.length || 0) - (b.currentMentees?.length || 0)
    )

    const learnerSnap = await db.collection('users').doc(userId).get()
    const learner = learnerSnap.data() || {}

    // RACE CONDITION FIX: two learners could both read "2/3 mentees" for
    // the same mentor at nearly the same instant, and both try to become
    // the "3rd" -- overbooking the cap. A Firestore transaction makes the
    // read-check-write atomic: only one request can successfully claim a
    // seat at a time. If a candidate fills up mid-race, we fall through
    // to the next candidate rather than failing outright.
    let assignedMentor = null
    for (const candidate of candidates) {
      const mentorRef = db.collection('mentorProfiles').doc(candidate.id)
      try {
        assignedMentor = await db.runTransaction(async (tx) => {
          const freshSnap = await tx.get(mentorRef)
          const freshData = freshSnap.data()
          const mentees = freshData.currentMentees || []
          if (mentees.length >= MAX_MENTEES_PER_MENTOR) {
            throw new Error('SEAT_TAKEN')
          }
          tx.update(mentorRef, { currentMentees: [...mentees, userId] })
          return { id: candidate.id, ...freshData }
        })
        break
      } catch (err) {
        if (err.message === 'SEAT_TAKEN') continue
        throw err
      }
    }

    // Every candidate got filled by someone else in the exact same race --
    // genuinely no capacity left anywhere, fall back the same as normal.
    if (!assignedMentor) {
      await routeToSelfGuided(userId)
      return res.json({ mentor: null, matchType: 'self-guided' })
    }

    const matchRef = await db.collection('matches').add({
      learnerId: userId,
      learnerName: learner.name || 'A new member',
      learnerPhone: learner.phone || '',
      learnerInterest: interests,
      mentorId: assignedMentor.id,
      status: 'pending',
      matchType: 'specialty',
      createdAt: new Date().toISOString(),
    })

    await db.collection('learnerProfiles').doc(userId).set(
      { assignedMentorId: assignedMentor.id, track: 'mentored' },
      { merge: true }
    )

    await upsertOnboardingStatus(userId, {
      mentorName: assignedMentor.name,
      mentorPhone: assignedMentor.phone || '',
      track: 'mentored',
    })

    res.json({
      matchId: matchRef.id,
      mentor: {
        id: assignedMentor.id,
        name: assignedMentor.name,
        initials: assignedMentor.initials,
        specialty: assignedMentor.specialty,
      },
      matchType: 'specialty',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to match mentor' })
  }
})

// POST /api/cancel-pending-match
// MENTOR REQUEST TIMEOUT FIX: if a mentor never responds, the learner
// previously had no way out of "pending" forever. This is triggered by
// the learner's own action (visiting their dashboard and choosing to
// switch), not a background job -- consistent with the same
// event-triggered philosophy as the rematch logic.
router.post('/cancel-pending-match', async (req, res) => {
  const { userId, matchId, mentorId } = req.body
  if (!userId || !matchId || !mentorId) {
    return res.status(400).json({ error: 'userId, matchId, and mentorId are required' })
  }

  try {
    await db.collection('matches').doc(matchId).update({ status: 'cancelled' })

    const mentorRef = db.collection('mentorProfiles').doc(mentorId)
    const mentorSnap = await mentorRef.get()
    if (mentorSnap.exists) {
      const updatedMentees = (mentorSnap.data().currentMentees || []).filter((id) => id !== userId)
      await mentorRef.update({ currentMentees: updatedMentees })
    }

    await routeToSelfGuided(userId)

    res.json({ matchType: 'self-guided' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to cancel pending match' })
  }
})

// POST /api/mentor-registered
// Called right after a new mentor signs up. Checks whether any
// Self-Guided learner is a specialty match for this brand new mentor's
// open capacity, same as when an existing mentor's seat frees up.
router.post('/mentor-registered', async (req, res) => {
  const { mentorId } = req.body
  if (!mentorId) return res.status(400).json({ error: 'mentorId is required' })

  try {
    await checkAndRematchForNewMentor(mentorId)
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to check for waiting learners' })
  }
})

export default router