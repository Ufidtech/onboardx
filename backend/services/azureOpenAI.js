import OpenAI from 'openai'
import 'dotenv/config'
import { curriculumFor } from '../data/curriculum.js'

// Azure OpenAI speaks the same chat-completions shape as regular OpenAI,
// so we can use the plain `openai` package -- we just point it at your
// Azure endpoint + deployment instead of api.openai.com.
//
// Required env vars (see .env.example):
//   AZURE_OPENAI_ENDPOINT      e.g. https://your-resource-name.openai.azure.com
//   AZURE_OPENAI_API_KEY
//   AZURE_OPENAI_DEPLOYMENT    e.g. gpt-4o-mini  (the deployment NAME, not the model name)
//   AZURE_OPENAI_API_VERSION   e.g. 2024-08-01-preview

const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '') // strip trailing slash if present
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
const apiVersion = process.env.AZURE_OPENAI_API_VERSION

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${endpoint}/openai/deployments/${deployment}`,
  defaultQuery: { 'api-version': apiVersion },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
})

// AI HALLUCINATION DEFENSE
// The model is never asked for a URL and is never trusted with one, even
// if it echoes one back. It only sees a numbered list of pre-verified
// curriculum items and picks 4 ids, in order, plus writes encouraging
// text. The backend then looks up the real title/url for those ids itself
// -- so a hallucinated or malformed id just gets ignored, not passed
// through to the learner.
export async function generateStarterPlan({ interests, currentSkillLevel, timeAvailable, community }) {
  const options = curriculumFor(community)
  const optionsList = options.map((item, i) => `${i}. [${item.id}] ${item.title} (tags: ${item.tags.join(', ')})`).join('\n')

  const prompt = `You are a routing agent, not a content generator. You must select
from a fixed list of verified learning resources -- you may NOT invent, modify,
or suggest any resource, title, or link that is not in this list.

Learner's stated interest: ${interests}
Current skill level: ${currentSkillLevel || 'complete beginner'}
Hours available per week: ${timeAvailable}

Verified resource options (select ONLY from this list, by exact id):
${optionsList}

Pick exactly 4 ids from the list above, in a sensible order for a 4-week
beginner plan matching the learner's stated interest. If the learner's
interest genuinely does not match any specific resource well (e.g. a topic
like cybersecurity, DevOps, or a career path not covered by a dedicated
resource), it is better to honestly pick the general catalog/browse item
(tagged "general") for those weeks and say so in the encouragement --
for example "Browse the catalog for X since we don't have a dedicated
track yet" -- rather than forcing an unrelated specific resource to look
like a match it isn't. For each pick, write one short, encouraging
sentence explaining why it fits them this week -- this sentence is the
ONLY thing you should generate freely; do not include a URL or invent a
resource name in it.

Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{"title": "short track name", "weeks": [{"id": "exact-id-from-list", "encouragement": "short sentence"}, ...4 total]}`

  const completion = await client.chat.completions.create({
    model: deployment, // Azure ignores this field's value but the SDK requires it to be present
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  const text = completion.choices[0].message.content.trim()
  const parsed = JSON.parse(text)

  // The actual defense: look up each picked id against our own verified
  // list. If the model returns an id we don't recognize (hallucinated or
  // malformed), skip it rather than trust anything it said about it.
  const weeks = parsed.weeks
    .map((pick) => {
      const item = options.find((o) => o.id === pick.id)
      if (!item) return null
      return {
        topic: `${item.title} -- ${pick.encouragement || ''}`.trim(),
        resourceUrl: item.url,
      }
    })
    .filter(Boolean)

  // If the model picked badly and we lost items, backfill from the
  // verified list so the learner still gets a full 4-week plan.
  while (weeks.length < 4 && weeks.length < options.length) {
    const next = options[weeks.length]
    weeks.push({ topic: next.title, resourceUrl: next.url })
  }

  return { title: parsed.title || 'Your starter path', weeks }
}

export async function generateShoutout({ weekNumber, status, topic, mentorName }) {
  if (status !== 'done') {
    // Keep it simple and honest for stuck/skipped weeks -- no AI call needed
    return `Week ${weekNumber} check-in: still working through ${topic || "this week's topic"}. Back on it soon.`
  }

  const prompt = `Write ONE short, upbeat sentence (under 25 words) a student can post in
their community WhatsApp group celebrating finishing week ${weekNumber} of their
learning path on "${topic}". Include a thank-you shoutout to their mentor named ${mentorName}.
No hashtags, no quotation marks, just the sentence.`

  const completion = await client.chat.completions.create({
    model: deployment,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
  })

  return completion.choices[0].message.content.trim()
}