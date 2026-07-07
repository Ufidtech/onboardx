import { db } from './firebaseAdmin.js'

// Called the moment a mentee graduates. Two jobs:
// 1. Actually free their seat on the mentor's currentMentees list --
//    without this, mentor capacity only ever grows, never shrinks, and
//    "wait for a mentor to free up" could never be true no matter how
//    long a self-guided learner waited.
// 2. Immediately check whether any self-guided learner is a specialty
//    match for this now-freed mentor, and promote the first one found.
//    Event-triggered at the exact moment of freeing, rather than a
//    background job polling on a timer -- simpler and instant.
export async function freeSeatAndRematch(mentorId, graduatingLearnerId) {
    const mentorRef = db.collection('mentorProfiles').doc(mentorId)
    const mentorSnap = await mentorRef.get()
    if (!mentorSnap.exists) return

    const mentor = mentorSnap.data()
    const updatedMentees = (mentor.currentMentees || []).filter((id) => id !== graduatingLearnerId)
    await mentorRef.update({ currentMentees: updatedMentees })

    // Only actually free if there's room now -- if this mentor was over
    // capacity somehow, don't rematch until there's genuinely a seat.
    if (updatedMentees.length >= 3) return

    const selfGuidedSnap = await db
        .collection('learnerProfiles')
        .where('track', '==', 'self-guided')
        .get()

    const specialty = (mentor.specialty || '').toLowerCase()
    const waitingLearnerDoc = selfGuidedSnap.docs.find((d) =>
        (d.data().interests || '').toLowerCase().includes(specialty)
    )

    if (!waitingLearnerDoc) return

    const learnerId = waitingLearnerDoc.id
    const learnerProfile = waitingLearnerDoc.data()
    const learnerUserSnap = await db.collection('users').doc(learnerId).get()
    const learnerUser = learnerUserSnap.data() || {}

    await db.collection('matches').add({
        learnerId,
        learnerName: learnerUser.name || 'A new member',
        learnerPhone: learnerUser.phone || '',
        learnerInterest: learnerProfile.interests || '',
        mentorId,
        status: 'pending',
        matchType: 'rematch',
        createdAt: new Date().toISOString(),
    })

    await mentorRef.update({ currentMentees: [...updatedMentees, learnerId] })

    await db.collection('learnerProfiles').doc(learnerId).set(
        { assignedMentorId: mentorId, track: 'mentored' },
        { merge: true }
    )
}