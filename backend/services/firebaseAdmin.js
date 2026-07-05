import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import 'dotenv/config'

let credential
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
} else {
  credential = cert('./service-account.json')
}

const app = initializeApp({ credential })

export const db = getFirestore(app)