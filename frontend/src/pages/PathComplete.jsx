import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { generateNextPlan, joinStudyGroup } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function PathComplete() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // "Week 5 cliff" fix: a beginner who just finished their very first
  // 4-week path should NOT be offered immediate mentor opt-in -- that's a
  // risk, not a growth path, this early. The two real options are:
  // go deeper solo, or go deeper with peers.
  async function handleNextPlan() {
    setError("");
    setLoading(true);
    try {
      const plan = await generateNextPlan({ userId: user.uid });
      navigate("/plan", { state: { plan } });
    } catch (err) {
      setError("Something went wrong generating your next path. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinStudyGroup() {
    setError("");
    setLoading(true);
    try {
      await joinStudyGroup({ userId: user.uid });
      navigate("/");
    } catch (err) {
      setError("Something went wrong joining a study group. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4 text-center">
      <Card>
        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-green-700 text-xl">&#10003;</span>
        </div>
        <h1 className="text-lg font-medium mb-1">Path complete</h1>
        <p className="text-sm text-gray-600 mb-4">
          You finished your 4-week path
        </p>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <Button className="mb-2" onClick={handleNextPlan} disabled={loading}>
          {loading
            ? "Working on it..."
            : "Generate my next 4-week Intermediate Path"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleJoinStudyGroup}
          disabled={loading}
        >
          Join a Peer Study Group
        </Button>
      </Card>
    </div>
  );
}
