import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChecklist } from "@/hooks/useChecklist";

interface DailyChecklistProps {
  date?: Date;
  className?: string;
}

const encouragement = (done: number, total: number) => {
  if (done === 0) return "Small steps count.";
  if (done < total) return "One good choice at a time 🦋";
  return "Every item ticked today — lovely work 🦋";
};

const DailyChecklist = ({ date, className }: DailyChecklistProps) => {
  const { items, isDone, toggle, completedCount, total, loading, error } = useChecklist(date);

  return (
    <Card
      className={`bg-white/5 backdrop-blur-sm border-2 border-pink-400/40 hover:border-pink-400/70 transition-all duration-300 ${className ?? ""}`}
    >
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-white">Today's thyroid checklist</h3>
            <p className="text-white/60 text-sm mt-1">{encouragement(completedCount, total)}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-pink-200 bg-white/10 border border-pink-400/30 rounded-full px-3 py-1">
            {completedCount}/{total}
          </span>
        </div>

        <div
          className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-5"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(completedCount / total) * 100}%` }}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {items.map((i) => (
              <Skeleton key={i.key} className="h-12 w-full bg-white/10" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const done = isDone(item.key);
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    aria-pressed={done}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                      done
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center ${
                        done ? "bg-pink-500 border-pink-400" : "border-white/30"
                      }`}
                    >
                      {done && <Check className="w-4 h-4 text-white" />}
                    </span>
                    <span aria-hidden className="text-lg">{item.emoji}</span>
                    <span className={done ? "text-white" : "text-white/75"}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {error && <p className="text-red-300 text-sm mt-4">{error}</p>}

        <p className="text-white/40 text-xs mt-5">
          Educational support only — always confirm decisions with your doctor.
        </p>
      </CardContent>
    </Card>
  );
};

export default DailyChecklist;
