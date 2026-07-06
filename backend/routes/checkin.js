import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { generateShoutout } from '../services/azureOpenAI.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'

const router = Router()

// POST /api/checkin
router.post('/checkin', async (req, res) => {
  const { userId, weekNumber, status } = req.body
  if (!userId || !weekNumber || !status) {
    return res.status(400).json({ error: 'userId, weekNumber, and status are required' })
  }

  try {
    const profileSnap = await db.collection('learnerProfiles').doc(userId).get()
    const profile = profileSnap.data()
    if (!profile) return res.status(404).json({ error: 'Learner profile not found' })

    const topic = profile.generatedPlan?.weeks?.[weekNumber - 1]?.topic || ''
    let mentorName = 'their mentor'
    if (profile.assignedMentorId) {
      const mentorSnap = await db.collection('mentorProfiles').doc(profile.assignedMentorId).get()
      mentorName = mentorSnap.data()?.name || mentorName
    }

    const shoutoutText = await generateShoutout({ weekNumber, status, topic, mentorName })

    await db.collection('checkIns').add({
      learnerId: userId,
      weekNumber,
      status,
      generatedShoutoutText: shoutoutText,
      createdAt: new Date().toISOString(),
    })

    // Note: "status" here is the check-in status (done/stuck/skipped) from
    // the request body -- different from the admin-facing onboarding
    // status (in_progress/stuck/graduated) computed below. Kept as two
    // separate names on purpose so they're never confused mid-function.
    let adminStatus
    let adminLabel

    if (status === 'stuck') {
      adminStatus = 'stuck'
      adminLabel = `Stuck on week ${weekNumber}`
    } else if (status === 'done') {
      const nextWeek = weekNumber + 1
      await db.collection('learnerProfiles').doc(userId).update({ currentWeek: nextWeek })
      if (nextWeek > 4) {
        adminStatus = 'graduated'
        adminLabel = 'Graduated'
      } else {
        adminStatus = 'in_progress'
        adminLabel = `Week ${nextWeek} of 4`
      }
    } else {
      adminStatus = 'skipped'
      adminLabel = `Skipped week ${weekNumber}`
    }

    await upsertOnboardingStatus(userId, { status: adminStatus, statusLabel: adminLabel })

    // Give the mentor visibility into how their mentee is actually doing,
    // not just whether the match was accepted. Without this, a mentee
    // could mark every week "Done" and the mentor would never know
    // otherwise, or never know they're stuck and need a nudge.
    if (profile.assignedMentorId) {
      const matchQuery = await db
        .collection('matches')
        .where('learnerId', '==', userId)
        .where('mentorId', '==', profile.assignedMentorId)
        .limit(1)
        .get()

      if (!matchQuery.empty) {
        await matchQuery.docs[0].ref.update({
          lastCheckInStatus: status,
          lastCheckInWeek: weekNumber,
        })
      }
    }

    res.json({ shoutoutText })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit check-in' })
  }
})

export default router