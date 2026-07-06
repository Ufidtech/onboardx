import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import WeekPath from "../components/WeekPath";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { whatsappLink } from "../lib/whatsapp";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [userSnap, profileSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "learnerProfiles", user.uid)),
      ]);
      setName(userSnap.data()?.name || "");
      setRole(userSnap.data()?.role || "learner");

      const profileData = profileSnap.exists() ? profileSnap.data() : null;
      setProfile(profileData);

      if (profileData?.assignedMentorId) {
        const mentorSnap = await getDoc(
          doc(db, "mentorProfiles", profileData.assignedMentorId),
        );
        setMentor(mentorSnap.exists() ? mentorSnap.data() : null);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center mt-12 text-sm text-gray-500">Loading...</div>
    );
  }

  if (role === "mentor") {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  const firstName = name.split(" ")[0] || "there";

  if (!profile?.generatedPlan) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <p className="font-display text-xl font-semibold mb-1 text-ink">
            Welcome, {firstName}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            You haven't started a learning path yet.
          </p>
          <Button onClick={() => navigate("/intake")}>Get started</Button>
        </Card>
      </div>
    );
  }

  const currentWeek = profile.currentWeek || 1;
  const pathComplete = currentWeek > 4;

  return (
    <div className="max-w-md mx-auto mt-12 px-4 space-y-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Welcome back</p>
        <p className="font-display text-xl font-semibold mb-1 text-ink">
          {firstName}
        </p>
        <p className="text-sm text-gray-600">
          {pathComplete
            ? "You completed your path"
            : `Week ${currentWeek} of 4`}{" "}
          &middot; {profile.generatedPlan.title}
        </p>
      </Card>

      {mentor && (
        <Card>
          <p className="text-xs text-gray-500 mb-2">Your mentor</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{mentor.name}</p>
              <p className="text-xs text-gray-500">{mentor.specialty}</p>
            </div>
            <a
              href={whatsappLink(
                mentor.phone,
                `Hi ${mentor.name}! I'm ${firstName}, matched with you on OnboardX for ${mentor.specialty}. Looking forward to learning from you!`,
              )}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-green-700"
            >
              Message on WhatsApp
            </a>
          </div>
        </Card>
      )}

      {!mentor && profile.track === "self-guided" && (
        <Card>
          <p className="text-xs text-gray-500 mb-1">Track</p>
          <p className="text-sm text-gray-600">
            You're on a{" "}
            <span className="font-medium text-ink">Self-Guided + AI</span> track
            -- all matching mentors are at capacity right now. A mentor can be
            assigned later if one frees up.
          </p>
        </Card>
      )}

      {profile.track === "peer-group" && (
        <Card>
          <p className="text-xs text-gray-500 mb-1">Track</p>
          <p className="text-sm text-gray-600">
            You're in a{" "}
            <span className="font-medium text-ink">Peer Study Group</span> for{" "}
            {profile.interests}.
          </p>
        </Card>
      )}

      <Card>
        <p className="text-xs text-gray-500 mb-3">Your path</p>
        <div className="mb-4">
          <WeekPath
            weeks={profile.generatedPlan.weeks}
            currentWeek={currentWeek}
          />
        </div>

        {pathComplete ? (
          <Link to="/path-complete">
            <Button>View path completion</Button>
          </Link>
        ) : (
          <Link to="/checkin">
            <Button>Check in for week {currentWeek}</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
