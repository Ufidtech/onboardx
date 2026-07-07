// A compact version of the WeekPath signature -- same visual language
// (filled = done, highlighted = current, gray = upcoming), just small
// enough to sit inline on a mentee card instead of a full page.
export default function MiniWeekDots({ currentWeek = 0, status = "" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((w) => {
        let color = "bg-gray-200";
        if (currentWeek > 0) {
          if (w < currentWeek) color = "bg-teal-deep";
          else if (w === currentWeek) {
            if (status === "stuck") color = "bg-amber-flag";
            else if (status === "skipped") color = "bg-orange-500";
            else color = "bg-teal-mid";
          }
        }
        return <div key={w} className={`w-2 h-2 rounded-full ${color}`} />;
      })}
    </div>
  );
}
