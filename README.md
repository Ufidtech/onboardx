# OnboardX

Smart community onboarding and mentorship engine, built for the Airtel NextGen
Cohort Knowledge Showcase 2.0. Full context and rationale is in
`PRD-Community-Onboarding-Engine.md`.

**Live app:** https://onboardx-ashy.vercel.app

New members joining a campus tech community (MSA, GDG, etc.) sign up, fill in
a short intake form, and get an AI-generated 4-week starter learning path
routed only through a hand-verified curriculum (the AI never invents links).
They're automatically matched with a senior mentor who has real capacity --
if every matching mentor is full, the learner is honestly routed to a
Self-Guided + AI track instead of being forced onto an unrelated mentor.
Weekly check-ins generate a shareable "shoutout" message members post back
into the community's existing WhatsApp group, making progress visible to
everyone, not just the mentor and mentee.

## What's actually built

- **Auth**: real Firebase email/password signup and login, with role
  selection (learner or mentor) and a public landing page for new visitors
- **AI-generated learning paths**: Azure OpenAI acts strictly as a router
  over a verified curriculum list (10 skill areas: web dev, Python, cloud,
  data, AI/ML, UI/UX, Android, cybersecurity, DevOps, backend) -- it can
  never hallucinate a broken link, and honestly falls back to a general
  catalog page for topics outside that list
- **Mentor matching with capacity caps**: a hard 3-mentee cap per mentor,
  enforced with a Firestore transaction to prevent race conditions when two
  learners match at once; learners with no capacity available anywhere are
  routed to a Self-Guided + AI track, not randomly assigned
- **Automatic rematching**: when a mentee graduates, their mentor's seat
  frees up immediately, and the longest-waiting Self-Guided learner in that
  specialty is automatically matched -- event-triggered, not a polling job
- **Mentor consent gating**: a learner can't message their mentor via
  WhatsApp until the mentor has actually accepted the request
- **Weekly check-ins**: Done / Stuck / Skipped, each tracked distinctly;
  a stuck mentee is flagged on their mentor's dashboard with a one-tap
  WhatsApp nudge already written
- **Path completion**: after 4 weeks, a learner chooses a deeper
  Intermediate path or a Peer Study Group -- not immediate mentor status
- **Admin view**: real-time cohort status, a single "copy weekly reminder"
  message meant for the community group (not mass-DMing), and a
  "needs attention" section highlighting stuck learners with a direct
  WhatsApp link to their mentor
- **Mentor request timeout**: a learner can switch to Self-Guided if their
  mentor hasn't responded in 48 hours, rather than waiting indefinitely

## Project structure

```
onboardx/
  frontend/    React + Vite + Tailwind, deployed on Vercel
  backend/     Node + Express + Firebase Admin + Azure OpenAI, deployed on Azure App Service
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
4. Check the deployment's quota (tokens/minute) on that same page -- if it's 0, request an increase or redeploy in a different region

### 3. Install and run

```bash
# backend
cd backend
cp .env.example .env   # fill in Azure OpenAI and Firebase values
npm install
npm run dev             # runs on http://localhost:4000

# frontend (separate terminal)
cd frontend
cp .env.example .env    # fill in Firebase config + VITE_API_BASE_URL
npm install
npm run dev              # runs on http://localhost:5173
```

### 4. Seed at least one mentor
Sign up through the app itself with role "Mentor" -- this creates a proper
`mentorProfiles` document automatically, including the specialty and phone
number needed for matching and WhatsApp handoff.

## Routes (backend)

| Route | Purpose |
|---|---|
| `POST /api/generate-plan` | Intake text -> AI-routed 4-week starter plan |
| `POST /api/match` | Capacity-aware mentor matching with transaction safety, falls back to Self-Guided + AI |
| `POST /api/cancel-pending-match` | Lets a learner switch to Self-Guided if their mentor hasn't responded |
| `POST /api/checkin` | Submits a weekly check-in, returns a shareable shoutout, triggers rematch on graduation |
| `POST /api/generate-next-plan` | Generates the next 4-week plan after path completion |
| `POST /api/join-study-group` | Groups a learner into a peer study group by interest topic |

## Deployment

- **Frontend**: Vercel, auto-deploys from `main`
- **Backend**: Azure App Service, deployed from `main`
- Firebase Authentication requires the deployed domain added under
  Authentication > Settings > Authorized domains

## Known limitations (disclosed, not hidden)

- Admin access is gated by an email allowlist checked client-side -- good
  enough to hide the view from regular users, not a substitute for real
  Firestore Security Rules at production scale
- No in-app chat by design -- WhatsApp deep links are used instead, since
  that's where these communities already communicate
- Rematching picks the longest-waiting Self-Guided learner for a given
  specialty, not a globally optimal assignment across all open seats
