import { db } from './firebaseAdmin.js'

// Shared core: given a mentor with room, find the longest-waiting
// Self-Guided learner whose interest matches their specialty, and create
// a pending match for them. Used both when a mentor's seat frees up
// (graduation/leaving) and when a brand new mentor signs up with room
// from day one.
async function matchWaitingLearnerToMentor(mentorRef, mentor, currentMentees) {
    if (currentMentees.length >= 3) return

    const selfGuidedSnap = await db
        .collection('learnerProfiles')
        .where('track', '==', 'self-guided')
        .get()

    const specialty = (mentor.specialty || '').toLowerCase()
    const matchingCandidates = selfGuidedSnap.docs.filter((d) =>
        (d.data().interests || '').toLowerCase().includes(specialty)
    )

    // FAIRNESS FIX: without this, whichever self-guided learner happened to
    // come first in Firestore's arbitrary result order got matched -- not
    // necessarily whoever had been waiting longest. Sorting by
    // `selfGuidedSince` (set the moment they were routed to this track)
    // ensures the longest-waiting learner is prioritized.
    matchingCandidates.sort((a, b) => {
        const aTime = a.data().selfGuidedSince || ''
        const bTime = b.data().selfGuidedSince || ''
        return aTime.localeCompare(bTime)
    })

    const waitingLearnerDoc = matchingCandidates[0]
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
        mentorId: mentorRef.id,
        status: 'pending',
        matchType: 'rematch',
        createdAt: new Date().toISOString(),
    })

    await mentorRef.update({ currentMentees: [...currentMentees, learnerId] })

    await db.collection('learnerProfiles').doc(learnerId).set(
        { assignedMentorId: mentorRef.id, track: 'mentored' },
        { merge: true }
    )
}

// Called the moment a mentee actually leaves their mentor (graduates AND
// chooses a Peer Study Group, not just finishing 4 weeks -- see
// studyGroup.js for why). Frees their seat, then immediately checks for a
// waiting Self-Guided learner to fill it. Event-triggered, not a
// background job polling on a timer.
export async function freeSeatAndRematch(mentorId, leavingLearnerId) {
    const mentorRef = db.collection('mentorProfiles').doc(mentorId)
    const mentorSnap = await mentorRef.get()
    if (!mentorSnap.exists) return

    const mentor = mentorSnap.data()
    const updatedMentees = (mentor.currentMentees || []).filter((id) => id !== leavingLearnerId)
    await mentorRef.update({ currentMentees: updatedMentees })

    await matchWaitingLearnerToMentor(mentorRef, mentor, updatedMentees)
}

// Called right after a brand new mentor signs up. A fresh mentor has
// empty capacity from day one -- without this, a Self-Guided learner
// would keep waiting even though a perfectly good mentor just joined,
// until something else happened to trigger a rematch check.
export async function checkAndRematchForNewMentor(mentorId) {
    const mentorRef = db.collection('mentorProfiles').doc(mentorId)
    const mentorSnap = await mentorRef.get()
    if (!mentorSnap.exists) return

    const mentor = mentorSnap.data()
    const currentMentees = mentor.currentMentees || []

    await matchWaitingLearnerToMentor(mentorRef, mentor, currentMentees)
}