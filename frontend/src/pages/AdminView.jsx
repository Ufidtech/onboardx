import { useEffect, useState } from "react";
import Card from "../components/Card";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const STATUS_STYLES = {
  pending: "text-gray-500",
  in_progress: "bg-green-100 text-green-800",
  stuck: "bg-amber-100 text-amber-800",
  graduated: "bg-teal-100 text-teal-800",
};

export default function AdminView() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // TODO: this assumes a denormalized 'onboardingStatus' collection is kept
    // up to date by the backend as matches/check-ins happen. Simpler than
    // joining Users + Matches + CheckIns client-side.
    const unsubscribe = onSnapshot(
      collection(db, "onboardingStatus"),
      (snapshot) => {
        setRows(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Admin view</p>
        <h1 className="font-display text-xl font-semibold mb-4 text-ink">
          Onboarding, this cohort
        </h1>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Learner</th>
              <th className="py-2 font-medium">Mentor</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2">{r.learnerName}</td>
                <td className="py-2">
                  {r.mentorName || (
                    <span className="text-gray-400">Pending</span>
                  )}
                </td>
                <td className="py-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs ${STATUS_STYLES[r.status] || ""}`}
                  >
                    {r.statusLabel || r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">
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
