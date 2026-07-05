import { db } from './firebaseAdmin.js'

// Keeps the onboardingStatus collection (what AdminView.jsx reads) in sync.
// Called from whatever route just changed a learner's state, rather than
// AdminView trying to join Users + LearnerProfiles + Matches client-side.
export async function upsertOnboardingStatus(userId, patch) {
    const userSnap = await db.collection('users').doc(userId).get()
    const learnerName = userSnap.data()?.name || userId

    await db.collection('onboardingStatus').doc(userId).set(
        { learnerName, ...patch },
        { merge: true }
    )
}