import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { generateStarterPlan } from '../services/azureOpenAI.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'

const router = Router()

// POST /api/generate-plan
router.post('/generate-plan', async (req, res) => {
  const { userId, interests, currentSkillLevel, timeAvailable, community } = req.body
  if (!userId || !interests) {
    return res.status(400).json({ error: 'userId and interests are required' })
  }

  try {
    const plan = await generateStarterPlan({ interests, currentSkillLevel, timeAvailable, community })

    await db.collection('learnerProfiles').doc(userId).set(
      {
        interests,
        currentSkillLevel,
        timeAvailable,
        community,
        generatedPlan: plan,
        currentWeek: 1,
      },
      { merge: true }
    )

    await upsertOnboardingStatus(userId, { status: 'in_progress', statusLabel: 'Week 1 of 4' })

    res.json(plan)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate plan' })
  }
})

// POST /api/generate-next-plan (PRD feature 8, path completion -> continue track)
router.post('/generate-next-plan', async (req, res) => {
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  try {
    const profileSnap = await db.collection('learnerProfiles').doc(userId).get()
    const profile = profileSnap.data()
    if (!profile) return res.status(404).json({ error: 'Learner profile not found' })

    const plan = await generateStarterPlan({
      interests: `${profile.interests} (continuing to a more advanced level)`,
      currentSkillLevel: 'completed a 4-week starter path already',
      timeAvailable: profile.timeAvailable,
      community: profile.community,
    })

    await db.collection('learnerProfiles').doc(userId).update({
      generatedPlan: plan,
      currentWeek: 1,
    })

    await upsertOnboardingStatus(userId, { status: 'in_progress', statusLabel: 'Week 1 of 4 (Intermediate)' })

    res.json(plan)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate next plan' })
  }
})

export default router