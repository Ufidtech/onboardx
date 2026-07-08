import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { friendlyAuthError } from "../lib/authErrors";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole =
    searchParams.get("role") === "mentor" ? "mentor" : "learner";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(initialRole);
  const [community, setCommunity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Save the extra profile info Firebase Auth itself doesn't store
      // (Auth only knows email/password -- everything else is our own data)
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        phone,
        role,
        community,
      });

      // If they're joining as a mentor, also create the mentorProfiles
      // document -- this is the one the matching route actually queries.
      // Without this, "signing up as a mentor" would look successful but
      // never actually receive any mentee matches.
      if (role === "mentor") {
        await setDoc(doc(db, "mentorProfiles", cred.user.uid), {
          name,
          initials: name.slice(0, 2).toUpperCase(),
          specialty,
          phone,
          currentMentees: [],
        });
      }

      navigate(role === "mentor" ? "/mentor-dashboard" : "/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <h1 className="font-display text-xl font-semibold mb-4 text-ink">
          Create your account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Phone (for WhatsApp connect)
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="234801234567"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Community</label>
            <input
              required
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="e.g. MSA, GDG"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">I am joining as a</label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setRole("learner")}
                className={`flex-1 rounded-lg border p-2 text-sm ${role === "learner" ? "border-teal-700 text-teal-700" : "border-gray-300"}`}
              >
                New member
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`flex-1 rounded-lg border p-2 text-sm ${role === "mentor" ? "border-teal-700 text-teal-700" : "border-gray-300"}`}
              >
                Mentor
              </button>
            </div>
          </div>

          {role === "mentor" && (
            <div>
              <label className="text-sm text-gray-600">
                What can you mentor others in?
              </label>
              <input
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. web development, UI/UX, cloud"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-700 underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
