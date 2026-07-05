import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { generatePlan, matchMentor } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Intake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interests, setInterests] = useState("");
  const [currentSkillLevel, setCurrentSkillLevel] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Community was captured at signup -- read it here so the AI can
      // tailor resource links (Google-ecosystem for GDG, Microsoft Learn
      // for MSA, etc.) without asking the learner to type it again.
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const community = userSnap.data()?.community || "";

      const plan = await generatePlan({
        userId: user.uid,
        interests,
        currentSkillLevel,
        timeAvailable,
        community,
      });
      const matchResult = await matchMentor({ userId: user.uid, interests });
      navigate("/plan", {
        state: {
          plan: {
            ...plan,
            mentor: matchResult.mentor,
            matchType: matchResult.matchType,
          },
        },
      });
    } catch (err) {
      setError("Something went wrong generating your path. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Step 1 of 1</p>
        <h1 className="text-lg font-medium mb-4">Tell us about you</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              What do you want to learn?
            </label>
            <textarea
              rows={2}
              required
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. web development, UI/UX design"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              What do you already know?
            </label>
            <textarea
              rows={2}
              value={currentSkillLevel}
              onChange={(e) => setCurrentSkillLevel(e.target.value)}
              placeholder="e.g. nothing yet, or some HTML"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Hours available per week
            </label>
            <input
              type="number"
              min="1"
              required
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              placeholder="5"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Generating your path..." : "Generate my path"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
