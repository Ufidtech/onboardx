import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Button from "../components/Button";
import { submitCheckIn } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CheckIn() {
  const { user } = useAuth();
  const [weekNumber, setWeekNumber] = useState(null);
  const [shoutout, setShoutout] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "learnerProfiles", user.uid))
      .then((snap) => {
        setWeekNumber(snap.data()?.currentWeek || 1);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Something went wrong loading your check-in.");
      });
  }, [user]);

  async function handleStatus(status) {
    setError("");
    setLoading(true);
    try {
      const result = await submitCheckIn({
        userId: user.uid,
        weekNumber,
        status,
      });
      setShoutout(result.shoutoutText);
    } catch (err) {
      setError("Something went wrong submitting your check-in. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shoutout);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4 text-center">
        <p className="text-sm text-red-600 mb-3">{loadError}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (weekNumber === null) {
    return <Spinner />;
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Week {weekNumber} check-in</p>
        <h1 className="font-display text-xl font-semibold mb-4 text-ink">
          How did this week go?
        </h1>

        <div className="flex gap-2 mb-4">
          <Button
            variant="secondary"
            onClick={() => handleStatus("done")}
            disabled={loading}
          >
            Done
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleStatus("stuck")}
            disabled={loading}
          >
            Stuck
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleStatus("skipped")}
            disabled={loading}
          >
            Skipped
          </Button>
        </div>

        {loading && <p className="text-sm text-gray-500 mb-2">Submitting...</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        {shoutout && (
          <div className="bg-teal-50 rounded-lg p-3">
            <p className="text-xs text-teal-800 mb-2">Ready to share</p>
            <p className="text-sm">{shoutout}</p>
            <Button className="mt-3" onClick={handleCopy}>
              {copied ? "Copied" : "Copy to community group"}
            </Button>
            <Link to="/">
              <Button variant="secondary" className="mt-2">
                Back to dashboard
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
