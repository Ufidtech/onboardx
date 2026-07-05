import { useLocation, Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";

export default function PlanView() {
  const { state } = useLocation();
  const plan = state?.plan;

  if (!plan) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4 text-center text-sm text-gray-500">
        No plan found.{" "}
        <Link to="/" className="text-teal-700 underline">
          Go to your dashboard
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <p className="text-xs text-gray-500 mb-1">Your starter path</p>
        <h1 className="text-lg font-medium mb-4">{plan.title}</h1>

        <div className="space-y-2">
          {plan.weeks.map((week, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <span className="text-sm">
                Week {i + 1} &middot; {week.topic}
              </span>
              <div>
                <a
                  href={week.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-700 underline"
                >
                  Start here &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>

        {plan.mentor && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-medium">
              {plan.mentor.initials}
            </div>
            <p className="text-sm">
              Matched with{" "}
              <span className="font-medium">{plan.mentor.name}</span>,{" "}
              {plan.mentor.specialty} mentor
            </p>
          </div>
        )}

        {!plan.mentor && plan.matchType === "self-guided" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              All matching mentors are at capacity right now, so you've been
              placed on a<span className="font-medium"> Self-Guided + AI</span>{" "}
              track. Your AI-generated plan above still guides you week by week
              -- a mentor can be assigned later if one frees up.
            </p>
          </div>
        )}

        <Link to="/">
          <Button className="mt-4">Go to my dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
