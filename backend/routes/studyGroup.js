import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'

const router = Router()

// POST /api/join-study-group
// Groups learners by their interest topic into shared study groups instead
// of leaving "become a mentor" as the only post-path option for a learner
// who just finished their very first 4 weeks (the "Week 5 cliff" -- a
// beginner opting straight into mentoring others is a real risk, not a
// growth path, this early).
router.post('/join-study-group', async (req, res) => {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId is required' })

    try {
        const profileSnap = await db.collection('learnerProfiles').doc(userId).get()
        const profile = profileSnap.data()
        if (!profile) return res.status(404).json({ error: 'Learner profile not found' })

        // Group id is derived from their interest so learners on a similar
        // track land in the same group, e.g. "web development" -> "web-development"
        const groupId = (profile.interests || 'general')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 40)

        const groupRef = db.collection('studyGroups').doc(groupId)
        const groupSnap = await groupRef.get()

        if (groupSnap.exists()) {
            const existing = groupSnap.data()
            if (!existing.members.includes(userId)) {
                await groupRef.update({ members: [...existing.members, userId] })
            }
        } else {
            await groupRef.set({
                topic: profile.interests || 'general',
                members: [userId],
                createdAt: new Date().toISOString(),
            })
        }

        await db.collection('learnerProfiles').doc(userId).set(
            { track: 'peer-group', studyGroupId: groupId },
            { merge: true }
        )

        await upsertOnboardingStatus(userId, {
            mentorName: 'Peer group',
            status: 'graduated',
            statusLabel: `In peer group: ${profile.interests || 'general'}`,
        })

        res.json({ groupId, topic: profile.interests || 'general' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to join study group' })
    }
})

export default router