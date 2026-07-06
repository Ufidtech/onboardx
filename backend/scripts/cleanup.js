// ONE-OFF CLEANUP SCRIPT -- run manually when you want to wipe every test
// account and reset Firestore to empty, e.g. before recruiting real
// students. Uses the same Firebase Admin credentials your backend already
// has (service-account.json), so no new setup needed.
//
// Run from the backend/ folder:
//   node scripts/cleanup.js
//
// WARNING: this deletes EVERYTHING -- every Auth user and every document
// in every collection listed below. There is no undo. Do not run this
// against a database you actually want to keep data in.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import 'dotenv/config'

let credential
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
} else {
    credential = cert('./service-account.json')
}

const app = initializeApp({ credential })
const db = getFirestore(app)
const auth = getAuth(app)

const COLLECTIONS_TO_WIPE = [
    'users',
    'learnerProfiles',
    'mentorProfiles',
    'matches',
    'checkIns',
    'onboardingStatus',
    'studyGroups',
]

async function deleteAllDocsIn(collectionName) {
    const snapshot = await db.collection(collectionName).get()
    if (snapshot.empty) {
        console.log(`  ${collectionName}: already empty`)
        return
    }
    const batch = db.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    console.log(`  ${collectionName}: deleted ${snapshot.size} document(s)`)
}

async function deleteAllAuthUsers() {
    const list = await auth.listUsers(1000)
    if (list.users.length === 0) {
        console.log('  Auth: already empty')
        return
    }
    const uids = list.users.map((u) => u.uid)
    await auth.deleteUsers(uids)
    console.log(`  Auth: deleted ${uids.length} user(s)`)
}

async function main() {
    console.log('Wiping Firestore collections...')
    for (const name of COLLECTIONS_TO_WIPE) {
        await deleteAllDocsIn(name)
    }

    console.log('Wiping Firebase Auth users...')
    await deleteAllAuthUsers()

    console.log('Done. Everything is reset -- ready for fresh signups.')
    process.exit(0)
}

main().catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
})