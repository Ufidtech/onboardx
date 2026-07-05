import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Turns raw intake text into a structured 4-week plan.
// Returns { title, weeks: [string, string, string, string] }
export async function generateStarterPlan({ interests, currentSkillLevel, timeAvailable }) {
  const prompt = `You are helping a beginner student build a 4-week learning plan.
Interests: ${interests}
Current skill level: ${currentSkillLevel || 'complete beginner'}
Hours available per week: ${timeAvailable}

Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{"title": "short track name", "weeks": ["week 1 topic", "week 2 topic", "week 3 topic", "week 4 topic"]}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  return JSON.parse(text)
}

// Generates a short, shareable shoutout message for a weekly check-in.
export async function generateShoutout({ weekNumber, status, topic, mentorName }) {
  if (status !== 'done') {
    // Keep it simple and honest for stuck/skipped weeks -- no AI call needed
    return `Week ${weekNumber} check-in: still working through ${topic || 'this week\'s topic'}. Back on it soon.`
  }

  const prompt = `Write ONE short, upbeat sentence (under 25 words) a student can post in
their community WhatsApp group celebrating finishing week ${weekNumber} of their
learning path on "${topic}". Include a thank-you shoutout to their mentor named ${mentorName}.
No hashtags, no quotation marks, just the sentence.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
