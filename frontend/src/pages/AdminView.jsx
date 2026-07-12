import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { whatsappLink } from "../lib/whatsapp";

const STATUS_STYLES = {
  pending: "text-gray-500",
  in_progress: "bg-green-100 text-green-800",
  skipped: "bg-orange-100 text-orange-800",
  stuck: "bg-amber-100 text-amber-800",
  graduated: "bg-teal-100 text-teal-800",
};

const TRACK_LABELS = {
  mentored: "Mentored",
  "self-guided": "Self-Guided + AI",
  "peer-group": "Peer Group",
};

const REMINDER_MESSAGE = `\uD83D\uDC4B Weekly check-in time! How's your learning path going this week? Drop an update in the group, and shoutout your mentor if they've helped you out \uD83D\uDE80`;

export default function AdminView() {
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Denormalized 'onboardingStatus' collection is kept up to date by the
    // backend as matches/check-ins happen -- simpler than joining
    // Users + Matches + CheckIns client-side.
    const unsubscribeStatus = onSnapshot(
      collection(db, "onboardingStatus"),
      (snapshot) => {
        setRows(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    const unsubscribeGroups = onSnapshot(
      collection(db, "studyGroups"),
      (snapshot) => {
        setGroups(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return () => {
      unsubscribeStatus();
      unsubscribeGroups();
    };
  }, []);

  function copyReminder() {
    navigator.clipboard.writeText(REMINDER_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const needingAttention = rows.filter((r) => r.status === "stuck");

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 space-y-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Admin view</p>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-xl font-semibold text-ink">
            Onboarding, this cohort
          </h1>
          <Button className="w-auto px-3 py-1.5 text-xs" onClick={copyReminder}>
            {copied ? "Copied" : "Copy weekly reminder"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Paste the reminder once into the community group -- reaches everyone
          at once, instead of messaging each person individually.
        </p>
      </Card>

      {needingAttention.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-xs text-amber-800 font-medium mb-2">
            Needs attention -- {needingAttention.length} stuck
          </p>
          {/* Capped so a large, real cohort doesn't make this section grow
              indefinitely down the page -- scrolls internally instead. */}
          <div className="max-h-[100px] overflow-y-auto space-y-2 pr-1">
            {needingAttention.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2"
              >
                <p className="text-sm text-amber-900">
                  <span className="font-medium">{r.learnerName}</span> &middot;
                  mentor: {r.mentorName || "unassigned"}
                  {" \u00b7 "}
                  <span className="font-mono text-xs">{r.statusLabel}</span>
                </p>
                {r.mentorPhone && (
                  <a
                    href={whatsappLink(
                      r.mentorPhone,
                      `Hi ${r.mentorName}, noticed ${r.learnerName} is ${r.statusLabel?.toLowerCase() || "stuck"} -- could you check in with them when you get a chance?`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-700 shrink-0"
                  >
                    Message mentor
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {groups.length > 0 && (
        <Card>
          <p className="text-xs text-gray-500 mb-2">
            Peer study groups -- WhatsApp has no public API to auto-create a
            group, so use these contacts to set one up manually if a group is
            ready.
          </p>
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="border border-gray-200 rounded-lg p-2">
                <p className="text-sm font-medium text-ink mb-1">
                  {g.topic}{" "}
                  <span className="text-xs text-gray-500 font-normal">
                    &middot; {g.members?.length || 0} member
                    {(g.members?.length || 0) === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  {(g.members || [])
                    .map((m) => `${m.name}${m.phone ? ` (${m.phone})` : ""}`)
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Learner</th>
              <th className="py-2 font-medium">Mentor</th>
              <th className="py-2 font-medium">Track</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2 text-ink">{r.learnerName}</td>
                <td className="py-2">
                  {r.mentorName || (
                    <span className="text-gray-400">Pending</span>
                  )}
                </td>
                <td className="py-2 text-xs text-gray-600">
                  {TRACK_LABELS[r.track] || "\u2014"}
                </td>
                <td className="py-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-mono ${STATUS_STYLES[r.status] || ""}`}
                  >
                    {r.statusLabel || r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
