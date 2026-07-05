import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "matches"),
      where("mentorId", "==", user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatches(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user]);

  async function respond(matchId, status) {
    await updateDoc(doc(db, "matches", matchId), { status });
  }

  function whatsappLink(phone) {
    const digits = (phone || "").replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }

  const pending = matches.filter((m) => m.status === "pending");
  const accepted = matches.filter((m) => m.status === "accepted");

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Mentor dashboard</p>
        <h1 className="text-lg font-medium mb-4">
          {pending.length} pending requests
        </h1>

        <div className="space-y-3">
          {pending.map((m) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium">{m.learnerName}</p>
              <p className="text-xs text-gray-500 mb-2">
                Wants: {m.learnerInterest}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => respond(m.id, "accepted")}>
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => respond(m.id, "declined")}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}

          {accepted.map((m) => (
            <div
              key={m.id}
              className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">{m.learnerName}</p>
                <p className="text-xs text-gray-500">
                  Accepted &middot; week {m.currentWeek || 1}
                </p>
              </div>
              <a
                href={whatsappLink(m.learnerPhone)}
                target="_blank"
                rel="noreferrer"
                className="text-green-700 text-sm"
              >
                Message on WhatsApp
              </a>
            </div>
          ))}

          {matches.length === 0 && (
            <p className="text-sm text-gray-500">No requests yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
