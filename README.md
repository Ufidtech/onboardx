# OnboardX

Smart community onboarding and mentorship engine, built for the Airtel NextGen
Cohort Knowledge Showcase 2.0. Full context and rationale is in
`PRD-Community-Onboarding-Engine.md`.

New members joining a campus tech community (MSA, GDG, etc.) fill in a short
intake form, get an AI-generated 4-week starter learning path, and are
automatically matched with a senior mentor. Weekly check-ins generate a
shareable "shoutout" message members post back into the community's existing
WhatsApp group, making progress visible to everyone, not just the mentor and
mentee.

## Project structure

```
onboardx/
  frontend/    React + Vite + Tailwind
  backend/     Node + Express + Firebase Admin + Gemini
```

## Setup

### 1. Firebase project
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password) and **Firestore Database**
3. Add a web app, copy the config values into `frontend/.env` (copy from `.env.example`)
4. Go to Project Settings > Service Accounts > Generate new private key,
   save the file as `backend/service-account.json`

### 2. Azure OpenAI (via AI Foundry)
1. In https://ai.azure.com, deploy a model (gpt-4o-mini recommended) and note its deployment name
2. On the deployment page, copy the **endpoint**, **API key**, and **API version**
3. Add all four to `backend/.env` (`AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`)
4. Check the deployment's quota (tokens/minute) on that same page — if it's 0, request an increase or redeploy in a different region

### 3. Install and run

```bash
# backend
cd backend
cp .env.example .env   # then fill in GEMINI_API_KEY
npm install
npm run dev             # runs on http://localhost:4000

# frontend (separate terminal)
cd frontend
cp .env.example .env    # then fill in Firebase config
npm install
npm run dev              # runs on http://localhost:5173
```

### 4. Seed at least one mentor
The matching route needs at least one document in the `mentorProfiles`
Firestore collection to work. Add one manually in the Firebase console, e.g.:

```json
{
  "name": "Tomi J.",
  "initials": "TJ",
  "specialty": "web development",
  "phone": "2348012345678",
  "currentMentees": []
}
```

## Routes (backend)

| Route | Purpose |
|---|---|
| `POST /api/generate-plan` | Intake text -> AI 4-week starter plan |
| `POST /api/match` | Finds and assigns a mentor (falls back to lowest-load mentor) |
| `POST /api/checkin` | Submits a weekly check-in, returns a shareable shoutout |
| `POST /api/generate-next-plan` | Generates the next 4-week plan after path completion |

## Status

This is a Day 1-2 scaffold: routing, data model, and core screens are wired
up end-to-end with working (not just mocked) Firestore and Gemini calls.
Still to build per the PRD timeline: real auth (currently a hardcoded
`demo-user-1`), the admin `onboardingStatus` sync, and the "become a mentor"
Firestore write. See `PRD-Community-Onboarding-Engine.md` section 10 for the
day-by-day plan.
