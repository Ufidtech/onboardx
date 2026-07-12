import { Router } from 'express'
import { db } from '../services/firebaseAdmin.js'
import { upsertOnboardingStatus } from '../services/onboardingStatus.js'
import { freeSeatAndRematch } from '../services/rematch.js'

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

        const userSnap = await db.collection('users').doc(userId).get()
        const userData = userSnap.data() || {}

        // Group id is derived from their interest so learners on a similar
        // track land in the same group, e.g. "web development" -> "web-development"
        const groupId = (profile.interests || 'general')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 40)

        const groupRef = db.collection('studyGroups').doc(groupId)
        const groupSnap = await groupRef.get()

        // Members are stored with name/phone (not just a raw user id) so the
        // admin view can actually show who's in each group and their contact
        // info -- useful for a community lead manually creating a WhatsApp
        // group for them, since there's no public API to auto-create one.
        const newMember = { id: userId, name: userData.name || 'A member', phone: userData.phone || '' }

        if (groupSnap.exists) {
            const existing = groupSnap.data()
            const alreadyIn = (existing.members || []).some((m) => m.id === userId)
            if (!alreadyIn) {
                await groupRef.update({ members: [...(existing.members || []), newMember] })
            }
        } else {
            await groupRef.set({
                topic: profile.interests || 'general',
                members: [newMember],
                createdAt: new Date().toISOString(),
            })
        }

        // Choosing a peer group is the real "leaving this mentor relationship"
        // moment -- unlike generating a next 4-week path, which deliberately
        // keeps the same mentor. Only here do we actually free the seat and
        // check for a waiting Self-Guided learner to fill it.
        const hadMentor = profile.assignedMentorId
        if (hadMentor) {
            await freeSeatAndRematch(profile.assignedMentorId, userId)
        }

        await db.collection('learnerProfiles').doc(userId).set(
            { track: 'peer-group', studyGroupId: groupId, assignedMentorId: null },
            { merge: true }
        )

        await upsertOnboardingStatus(userId, {
            mentorName: 'Peer group',
            status: 'graduated',
            statusLabel: `In peer group: ${profile.interests || 'general'}`,
            track: 'peer-group',
        })

        res.json({ groupId, topic: profile.interests || 'general' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to join study group' })
    }
})

export default router