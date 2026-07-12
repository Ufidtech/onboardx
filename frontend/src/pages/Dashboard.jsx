import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import WeekPath from "../components/WeekPath";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { whatsappLink } from "../lib/whatsapp";
import { cancelPendingMatch } from "../lib/api";

const PENDING_TIMEOUT_HOURS = 48;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [matchStatus, setMatchStatus] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [matchType, setMatchType] = useState(null);
  const [matchCreatedAt, setMatchCreatedAt] = useState(null);
  const [celebrationDismissed, setCelebrationDismissed] = useState(true);
  const [studyGroup, setStudyGroup] = useState(null);
  const [groupMessageCopied, setGroupMessageCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [userSnap, profileSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDoc(doc(db, "learnerProfiles", user.uid)),
        ]);
        setName(userSnap.data()?.name || "");
        setRole(userSnap.data()?.role || "learner");

        const profileData = profileSnap.exists() ? profileSnap.data() : null;
        setProfile(profileData);

        if (profileData?.studyGroupId) {
          const groupSnap = await getDoc(
            doc(db, "studyGroups", profileData.studyGroupId),
          );
          setStudyGroup(groupSnap.exists() ? groupSnap.data() : null);
        }

        if (profileData?.assignedMentorId) {
          const mentorSnap = await getDoc(
            doc(db, "mentorProfiles", profileData.assignedMentorId),
          );
          setMentor(mentorSnap.exists() ? mentorSnap.data() : null);

          // Only let a learner message their mentor once the mentor has
          // actually accepted -- respects the mentor's choice, rather than
          // exposing a contact button before they've agreed to anything.
          const matchQuery = await getDocs(
            query(
              collection(db, "matches"),
              where("learnerId", "==", user.uid),
              where("mentorId", "==", profileData.assignedMentorId),
            ),
          );
          if (!matchQuery.empty) {
            const matchDoc = matchQuery.docs[0];
            const matchData = matchDoc.data();
            setMatchStatus(matchData.status);
            setMatchId(matchDoc.id);
            setMatchType(matchData.matchType || null);
            setMatchCreatedAt(matchData.createdAt);
            // Explicit dismiss, not a silent timer -- the learner decides
            // when they've "seen enough" of the celebration, rather than
            // it quietly expiring after some fixed number of hours.
            setCelebrationDismissed(Boolean(matchData.celebrationDismissed));
          }
        }
      } catch (err) {
        console.error(err);
        setLoadError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleCancelPending() {
    if (!matchId || !profile?.assignedMentorId) return;
    setCancelling(true);
    try {
      await cancelPendingMatch({
        userId: user.uid,
        matchId,
        mentorId: profile.assignedMentorId,
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setCancelling(false);
    }
  }

  async function handleDismissCelebration() {
    setCelebrationDismissed(true);
    if (matchId) {
      try {
        await updateDoc(doc(db, "matches", matchId), {
          celebrationDismissed: true,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleCopyGroupMessage() {
    const message = `Looking for others in my Peer Study Group for ${profile.interests} on OnboardX! Anyone else here working on this?`;
    navigator.clipboard.writeText(message);
    setGroupMessageCopied(true);
    setTimeout(() => setGroupMessageCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="text-center mt-12 text-sm text-gray-500">Loading...</div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4 text-center">
        <p className="text-sm text-red-600 mb-3">{loadError}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
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

      {mentor && matchStatus === "pending" && (
        <Card>
          <p className="text-xs text-gray-500 mb-1">Your mentor</p>
          {matchType === "rematch" ? (
            <p className="text-sm text-teal-deep font-medium mb-2">
              &#127881; A mentor in your field just opened up! You've been
              matched with <span className="text-ink">{mentor.name}</span> --
              waiting for them to accept.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-2">
              Your request to{" "}
              <span className="font-medium text-ink">{mentor.name}</span> is
              waiting for them to accept -- you'll be able to message them here
              once they do.
            </p>
          )}
          {matchCreatedAt &&
            Date.now() - new Date(matchCreatedAt).getTime() >
              PENDING_TIMEOUT_HOURS * 60 * 60 * 1000 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  This has been pending a while. You can switch to a self-guided
                  track instead of waiting.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleCancelPending}
                  disabled={cancelling}
                >
                  {cancelling ? "Switching..." : "Switch to Self-Guided + AI"}
                </Button>
              </div>
            )}
        </Card>
      )}

      {mentor && matchStatus === "accepted" && (
        <Card>
          {!celebrationDismissed && (
            <div className="mb-2 pb-2 border-b border-gray-100">
              <p className="text-xs text-teal-deep font-medium mb-2">
                &#127881; {mentor.name} accepted your mentorship request!
              </p>
              <button
                onClick={handleDismissCelebration}
                className="text-xs text-gray-500 underline"
              >
                Got it, thanks!
              </button>
            </div>
          )}
          {celebrationDismissed && (
            <p className="text-xs text-gray-500 mb-2">Your mentor</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{mentor.name}</p>
              <p className="text-xs text-gray-500">{mentor.specialty}</p>
            </div>
            <a
              href={whatsappLink(
                mentor.phone,
                !celebrationDismissed
                  ? `Hi ${mentor.name}, thank you so much for accepting to mentor me on OnboardX! I'm ${firstName}, really looking forward to learning ${mentor.specialty} from you. Do well to reach me via OnboardX so we can keep track of our progress together!`
                  : `Hi ${mentor.name}, it's ${firstName} from OnboardX -- just checking in!`,
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
          <p className="text-sm text-gray-600 mb-3">
            You're in a{" "}
            <span className="font-medium text-ink">Peer Study Group</span> for{" "}
            {profile.interests}
            {studyGroup && (
              <>
                {" "}
                &middot; {studyGroup.members?.length || 1} member
                {(studyGroup.members?.length || 1) === 1 ? "" : "s"} so far
              </>
            )}
            .
          </p>
          <Button variant="secondary" onClick={handleCopyGroupMessage}>
            {groupMessageCopied
              ? "Copied"
              : "Copy message to find others in the group"}
          </Button>
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
