import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import type { Reminder } from "./ReminderModal";

interface ReminderCalendarProps {
  currentMonth: Date;
  reminders: Reminder[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ReminderCalendar = ({
  currentMonth,
  reminders,
  selectedDate,
  onSelectDate,
}: ReminderCalendarProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const hasReminder = (day: Date) =>
    reminders.some((r) => isSameDay(r.date, day));

  return (
    <div className="bg-white/5 rounded-xl border border-pink-400/30 p-4 sm:p-6">
      {/* Month label */}
      <h4 className="text-center text-lg font-bold text-white mb-4">
        {format(currentMonth, "MMMM yyyy")}
      </h4>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-pink-300/80 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const dot = hasReminder(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                relative flex flex-col items-center justify-center rounded-lg h-10 sm:h-12 text-sm transition-all duration-200
                ${!inMonth ? "text-white/20 cursor-default" : "text-white/80 hover:bg-white/10 cursor-pointer"}
                ${today ? "ring-2 ring-pink-400/60 font-bold text-pink-300" : ""}
                ${selected ? "bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-white font-bold" : ""}
              `}
            >
              {format(day, "d")}
              {dot && inMonth && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-pink-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReminderCalendar;
