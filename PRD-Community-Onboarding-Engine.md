# Product Requirements Document (PRD)
## Project: OnboardX — Smart Community Onboarding & Mentorship Engine

**Author:** [Your Name]
**Program:** Airtel NextGen Cohort Knowledge Showcase 2.0 (3MTT)
**Focus Area:** Education & Skills
**Date:** July 2026
**Status:** Draft v1

---

## 1. Problem Statement

At the start of every semester, hundreds of students join campus tech communities (Microsoft Student Ambassador community, Google Developer Groups, CS department clubs, etc.). They are typically dropped into one large WhatsApp or Telegram group with no structure.

A new member says "I want to learn tech" but doesn't know the difference between UI/UX, cloud computing, or frontend development. Community leads do not have the time or bandwidth to manually interview and guide hundreds of new members every semester. As a result:

- New members feel lost and disengage within weeks
- Community leads spend hours doing repetitive onboarding conversations
- Senior members (300L/400L) who could mentor are never systematically connected to the juniors who need them
- No structured learning path exists, so progress is inconsistent and unmeasured

**Who this affects:** Incoming and existing members of campus tech communities (starting with MSA and GDG on campus), and the community leads/exec teams who run onboarding.

**Where:** University campuses in Nigeria, starting with [your university].

### The deeper problem: excitement decays after Day 1

New members join a community like MSA/GDG genuinely excited — but that excitement fades because there's no ongoing structure after the welcome message. The community usually *does* have the people who could fix this: a core team, many of whom are capable mentors. But without a system to deploy them, the only real touchpoints members get are occasional events. In between events, there's silence, and over weeks, members quietly give up.

The community isn't failing from lack of will — it's failing from lack of structure. The core team already wants to help; there's just no mechanism connecting a specific junior to a specific senior on an ongoing basis, and no visible proof in the group that progress is actually happening. This PRD's core bet: if mentorship is made structured *and visible* (a member posting "shoutout to my mentor, I've hit week 4 of my path" in the group), it flips the group's culture — a confused 500-member group becomes a group of engaged members with something concrete to show for their membership.

---

## 2. Goals & Objectives

| Goal | Success looks like |
|---|---|
| Replace manual onboarding with a structured intake flow | New member fills a form instead of a 1:1 chat with a lead |
| Give every new member a personalized starting point | Each member receives an AI-generated 4-week starter learning path |
| Connect juniors with the right seniors automatically | System auto-matches a new member to a 300L/400L mentor by specialty |
| Turn silent progress into visible community culture | Members post AI-generated weekly shoutouts back into the group, making mentorship visible to all 500+ members, not just the pair involved |
| Prove this generalizes beyond one community | Pilot works for at least 2 campus communities (MSA + GDG) |

**Out of scope for MVP:** payments, mobile app, multi-campus rollout, gamification/badges, admin analytics dashboard, in-app chat/messaging (WhatsApp deep link handles this instead — see section 5a) (nice-to-have, not MVP).

---

## 3. Target Users

1. **New Member ("Learner")** — a student joining a tech community, often with little to no prior tech background.
2. **Senior Member ("Mentor")** — a 300L/400L student with a specialization (e.g., MERN stack, UI/UX, cloud, data) willing to guide juniors. In practice, this pool starts with the community's existing core team — people who already want to help but currently have no system to be systematically matched to juniors.
3. **Community Lead ("Admin")** — runs the community, needs visibility into who's joined and who's been matched, without manual work.

---

## 4. User Stories (MVP)

- As a **new member**, I can fill a short conversational intake form describing my interests, current skill level, and time availability, so the system understands my starting point.
- As a **new member**, I receive an AI-generated 4-week starter learning path tailored to what I said, so I know exactly what to do first.
- As a **new member**, I get automatically matched with a senior mentor whose specialty fits my interest, so I have someone to ask questions.
- As a **mentor**, I can set my specialty/stack and availability, and I receive mentorship requests I can accept or decline.
- As a **community lead**, I can see a simple list of new members and their assigned mentors, so I know onboarding is happening without doing it myself.
- As a **new member**, I get a weekly prompt asking how my progress is going, and I receive a ready-made shoutout message I can post in the community group, so my progress is visible and my mentor gets credit.

---

## 5. Core Features (MVP — must build)

1. **Auth** — sign up/login (student email) for both learners and mentors
2. **Conversational Intake Form** — free-text fields: "What do you want to learn?", "What do you already know?", "How much time do you have per week?"
3. **AI Blueprint Generator** — sends intake text to Gemini API, returns a structured 4-week starter plan (topics + curated free resources, e.g. freeCodeCamp links)
4. **Mentor Matching** — queries mentor database by specialty/stack, assigns best match, notifies mentor. Fallback: if no mentor matches the requested specialty, assign the mentor with the fewest current mentees (load-balancing), tagged as a "general mentor" match rather than a specialty match, so no learner is left unmatched.
5. **Mentor Dashboard** — simple view for mentors to see assigned mentees and accept/decline
6. **Admin/Lead View** — simple table: new members, their generated path topic, assigned mentor, status
7. **Weekly Check-in & Shoutout Generator** — each week, the learner gets a simple prompt: "How did week [N] go?" (done / stuck / skipped). Based on the answer, the system generates a short, ready-to-post message the member can copy into the community group — e.g. "Week 2 done! Learned CSS Flexbox with shoutout to my mentor [Name] 🎉" — turning individual progress into visible, shareable proof in the group
8. **Path Completion Screen** — after week 4, the learner sees a "Path Complete 🎉" screen with two choices: (a) generate the next 4-week plan (deeper continuation of the same track), or (b) opt in to become a mentor for the next intake of new members

### Why feature 8 matters
Without it, the learner is stranded again after week 4 — recreating the original problem. More importantly, letting graduates opt into the mentor pool means the mentor pool **grows every cycle** instead of depending only on the existing core team. This directly answers the scaling problem in the original insight (core team can't manually guide 200+ people) and gives you a clean "impact compounds over time" story for judges.

### Why feature 7 matters
This is what actually solves the deeper problem, not just the onboarding gap. Structured intake + AI plan + mentor match gets someone *started* — but it's the recurring, visible check-in loop that keeps them engaged and makes the community's progress visible to everyone else in the group, not just the one member. This is also your strongest "Innovation" and "Impact Potential" talking point in the demo.

### Nice-to-have (only if time remains after MVP is solid)
- Local-language toggle for intake form (Pidgin/Yoruba/Hausa/Igbo)
- Auto-post the shoutout directly to a connected WhatsApp/Telegram group (vs. copy-paste) — powerful but adds integration risk, cut if time is tight
- Email/WhatsApp notification instead of in-app only

---

## 5a. How this connects to the existing WhatsApp community

OnboardX is not a replacement for the community's WhatsApp group — it's an orchestration layer that sits beside it. This keeps the MVP buildable in 10 days (no in-app chat system needed) and matches how students already behave.

1. **In** — the community lead pins the OnboardX onboarding link in the existing WhatsApp group. This is the new "front door" instead of a raw group invite.
2. **Match** — once a mentor match is accepted, both sides see a "Message on WhatsApp" button using a `wa.me/<phone>` deep link. The actual mentoring conversation happens on WhatsApp, where both already live — OnboardX does not build or host chat.
3. **Out** — the weekly shoutout message generated by feature 7 is explicitly designed to be copy-pasted back into that same WhatsApp group, not kept inside the app. This is what makes progress visible to the whole 500-member group, not just the mentor-mentee pair.

This means OnboardX's real job is narrow and achievable: **structure the start of the relationship, and keep nudging visible proof of progress** — not host the relationship itself.

---

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Familiar, fast to build UI |
| Backend | Node.js + Express | Familiar, simple REST API |
| Auth + Database | Firebase (Auth + Firestore) | No server/DB management needed, generous free tier |
| AI Reasoning | Gemini API | Free tier available, good at structured text generation |
| Hosting (frontend) | Azure Static Web Apps | Free tier, leverages your MSA status, auto-deploys from GitHub |
| Hosting (backend) | Render (free tier) | Simple Node hosting, no card required |
| Version Control | GitHub (fresh repo) | Clean history for judges to review |

---

## 7. Data Model (simplified)

**Users**
- id, name, email, phone (for WhatsApp deep link), role (learner/mentor/admin), community (MSA/GDG/etc.)

**LearnerProfiles**
- userId, interests (text), currentSkillLevel (text), timeAvailable (text), generatedPlan (AI output, JSON), assignedMentorId

**MentorProfiles**
- userId, specialty (e.g. "MERN", "UI/UX", "Cloud"), level (300L/400L), availability, currentMentees (array)

**Matches**
- learnerId, mentorId, status (pending/accepted/declined), createdAt

**CheckIns**
- learnerId, weekNumber, status (done/stuck/skipped), generatedShoutoutText, createdAt

---

## 8. User Flow (MVP)

1. New member gets onboarding link (replaces "join the WhatsApp group" message)
2. Signs up → fills intake form (interests, current knowledge, time available)
3. Backend sends intake text to Gemini → gets structured 4-week plan back → shown to learner
4. Backend queries mentor pool → finds best specialty match → creates a pending Match → notifies mentor
5. Mentor logs in → sees pending request → accepts/declines
6. Community lead can view all learners + their match status in one table
7. Each week, learner gets a check-in prompt → answers done/stuck/skipped → system generates a shareable shoutout message → learner copies it into the community group
8. After week 4, learner sees "Path Complete" screen → chooses to generate the next 4-week plan OR opt in to become a mentor for the next intake

---

## 9. Success Metrics (for your demo/submission)

- Number of real students onboarded during testing (target: 10+)
- Number of successful mentor matches made (target: 5+)
- Time saved estimate vs manual onboarding (state this explicitly in your pitch)
- At least 2 communities represented in your test data (MSA + GDG)
- Number of weekly check-ins completed and shoutout messages generated/posted (target: 10+) — this is your strongest visible-impact evidence

---

## 10. 10-Day Build Timeline (SDLC-aligned)

| Day | Phase | Tasks |
|---|---|---|
| 1 | Requirements + Design | Finalize this PRD, sketch wireframes, set up fresh GitHub repo, Firebase project, Gemini API key |
| 2 | Design | Data model in Firestore, basic React app scaffold, Express server scaffold |
| 3–4 | Build | Auth (signup/login) + intake form UI + save to Firestore |
| 5 | Build | Gemini integration — intake text → structured 4-week plan |
| 6 | Build | Mentor profile creation + matching logic |
| 7 | Build | Mentor dashboard (accept/decline) + admin/lead view + weekly check-in prompt + shoutout message generator |
| 8 | Testing | Recruit 5–10 real students (MSA/GDG) to test end-to-end, fix bugs |
| 9 | Deploy + Polish | Deploy frontend (Azure Static Web Apps) + backend (Render), write README |
| 10 | Submit | Record demo video, write submission description, submit via Google Form before 11:59 PM |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini API integration takes longer than expected | Build a hardcoded fallback plan template first, layer AI on top once core flow works |
| Not enough real mentors to test matching | Seed 3–5 mentor profiles yourself (real seniors you know) before wider testing |
| Running out of time for polish | MVP features are prioritized above; nice-to-haves are explicitly cut if Day 8 testing reveals problems |
| Live demo breaks (network, server cold start) | Record a backup screen-recording demo in advance in case live demo fails during physical showcase |

---

## 12. Submission Framing (for the Google Form)

- **Theme:** Education & Skills
- **Problem/Solution description (draft):** "Every semester, hundreds of students join campus tech communities excited to grow — but that excitement fades because there's no structure after the welcome message. The community's own core team could mentor them, but there's no system connecting the two. OnboardX fixes this: new members get an AI-generated 4-week starter path, are automatically matched to a core-team mentor by specialty, and get a weekly shareable shoutout ('Week 2 done, thanks to my mentor!') to post back in the group. What was a confused 500-member chat becomes a group where progress is visible every week."
- **Build link:** [deployed URL]
- **Demo video:** 2–3 min — show the problem (chaotic group chat, members going quiet) → show intake form → show AI-generated plan → show mentor match happening → show the weekly shoutout message being generated and posted back into the group
