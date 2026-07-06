// The signature visual: connected nodes forming a path, echoing the
// OnboardX logo's own language (ascending, connected circles = growth
// through connection). Used anywhere a learner's weekly progress is
// shown, so it's a consistent, recognizable pattern, not a one-off list.
export default function WeekPath({ weeks, currentWeek = 1 }) {
  return (
    <div>
      {weeks.map((week, i) => {
        const weekNum = i + 1
        const isDone = weekNum < currentWeek
        const isCurrent = weekNum === currentWeek
        const isLast = i === weeks.length - 1

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isDone
                    ? 'bg-teal-deep'
                    : isCurrent
                    ? 'bg-teal-mid ring-4 ring-teal-pale/50'
                    : 'bg-gray-300'
                }`}
              />
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-teal-deep' : 'bg-gray-200'}`} />
              )}
            </div>

            <div className={isLast ? 'pb-0' : 'pb-5'}>
              <p className="text-xs font-mono text-gray-500 mb-0.5">Week {weekNum}</p>
              <p className={`text-sm ${isCurrent ? 'font-medium text-ink' : 'text-gray-600'}`}>
                {week.topic}
              </p>
              {!isDone && week.resourceUrl && (
                <a
                  href={week.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-deep underline"
                >
                  Start here &rarr;
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}