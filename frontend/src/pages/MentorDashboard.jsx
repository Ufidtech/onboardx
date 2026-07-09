import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import MiniWeekDots from "../components/MiniWeekDots";
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
import { whatsappLink } from "../lib/whatsapp";

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
    const patch = { status };
    if (status === "accepted") {
      patch.acceptedAt = new Date().toISOString();
    }
    await updateDoc(doc(db, "matches", matchId), patch);
  }

  const pending = matches.filter((m) => m.status === "pending");
  const accepted = matches.filter((m) => m.status === "accepted");
  const graduated = accepted.filter(
    (m) => m.lastCheckInWeek === 4 && m.lastCheckInStatus === "done",
  );

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Mentor dashboard</p>
        <h1 className="font-display text-xl font-semibold mb-1 text-ink">
          {pending.length} pending requests
        </h1>
        <p className="text-xs font-mono text-gray-500 mb-4">
          {accepted.length} active mentee{accepted.length === 1 ? "" : "s"}{" "}
          &middot; {graduated.length} graduated
        </p>

        <div className="space-y-3">
          {pending.map((m) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-ink">{m.learnerName}</p>
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

          {accepted.map((m) => {
            const isStuck = m.lastCheckInStatus === "stuck";
            return (
              <div
                key={m.id}
                className={`border rounded-lg p-3 ${isStuck ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {m.learnerName}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {m.lastCheckInWeek
                        ? `Week ${m.lastCheckInWeek} \u00b7 ${m.lastCheckInStatus}`
                        : "No check-in yet"}
                    </p>
                    <MiniWeekDots
                      currentWeek={m.lastCheckInWeek || 0}
                      status={m.lastCheckInStatus}
                    />
                  </div>
                  {!isStuck && (
                    <a
                      href={whatsappLink(
                        m.learnerPhone,
                        `Hi ${m.learnerName}! I'm your mentor on OnboardX for ${m.learnerInterest}. Excited to help you get started.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-700 text-sm shrink-0"
                    >
                      Message on WhatsApp
                    </a>
                  )}
                </div>

                {isStuck && (
                  <div className="mt-2 pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-800 mb-2">
                      Flagged as stuck on week {m.lastCheckInWeek} -- a quick
                      nudge could help.
                    </p>
                    <a
                      href={whatsappLink(
                        m.learnerPhone,
                        `Hey ${m.learnerName}, saw you're stuck on week ${m.lastCheckInWeek} -- want to hop on a quick call or chat about it?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-white bg-amber-600 rounded-lg px-3 py-1.5"
                    >
                      Send a nudge on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {matches.length === 0 && (
            <p className="text-sm text-gray-500">No requests yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
