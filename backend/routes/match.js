import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'

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
    // routed into a Self-Guided + AI track, and that decision is recorded
    // on their profile so the rest of the app (dashboard, admin view) can
    // reflect it accurately.
    if (available.length === 0) {
      await db.collection('learnerProfiles').doc(userId).set(
        { track: 'self-guided', assignedMentorId: null },
        { merge: true }
      )
      await upsertOnboardingStatus(userId, { mentorName: 'Self-guided + AI' })
      return res.json({ mentor: null, matchType: 'self-guided' })
    }

    // Among available (under-cap, specialty-matching) mentors, still prefer
    // the one with the most room, so mentees spread out rather than
    // piling onto whichever mentor happens to be first in the list.
    const mentor = [...available].sort(
      (a, b) => (a.currentMentees?.length || 0) - (b.currentMentees?.length || 0)
    )[0]

    // Fetch the learner's real profile so the mentor's dashboard has an
    // actual name/phone to show -- without this, the mentor-side WhatsApp
    // button had nothing valid to point at.
    const learnerSnap = await db.collection('users').doc(userId).get()
    const learner = learnerSnap.data() || {}

    const matchRef = await db.collection('matches').add({
      learnerId: userId,
      learnerName: learner.name || 'A new member',
      learnerPhone: learner.phone || '',
      learnerInterest: interests,
      mentorId: mentor.id,
      status: 'pending',
      matchType: 'specialty',
      createdAt: new Date().toISOString(),
    })

    // Actually reserve the mentee's seat -- without this, currentMentees
    // never grows and the capacity cap could never trigger.
    await db.collection('mentorProfiles').doc(mentor.id).update({
      currentMentees: [...(mentor.currentMentees || []), userId],
    })

    await db.collection('learnerProfiles').doc(userId).set(
      { assignedMentorId: mentor.id, track: 'mentored' },
      { merge: true }
    )

    await upsertOnboardingStatus(userId, { mentorName: mentor.name, mentorPhone: mentor.phone || '' })

    res.json({
      matchId: matchRef.id,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        initials: mentor.initials,
        specialty: mentor.specialty,
      },
      matchType: 'specialty',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to match mentor' })
  }
})

export default router