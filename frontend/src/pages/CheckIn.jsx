import { useEffect, useState } from "react";
import Card from "../components/Card";
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

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "learnerProfiles", user.uid)).then((snap) => {
      setWeekNumber(snap.data()?.currentWeek || 1);
    });
  }, [user]);

  async function handleStatus(status) {
    setLoading(true);
    try {
      const result = await submitCheckIn({
        userId: user.uid,
        weekNumber,
        status,
      });
      setShoutout(result.shoutoutText);
    } catch (err) {
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

  if (weekNumber === null) {
    return (
      <div className="text-center mt-12 text-sm text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Week {weekNumber} check-in</p>
        <h1 className="text-lg font-medium mb-4">How did this week go?</h1>

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

        {shoutout && (
          <div className="bg-teal-50 rounded-lg p-3">
            <p className="text-xs text-teal-800 mb-2">Ready to share</p>
            <p className="text-sm">{shoutout}</p>
            <Button className="mt-3" onClick={handleCopy}>
              {copied ? "Copied" : "Copy to community group"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
