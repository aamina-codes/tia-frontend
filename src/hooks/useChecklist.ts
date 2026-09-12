import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChecklistItem {
  key: string;
  label: string;
  emoji: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: "medication", label: "Took my medication", emoji: "💊" },
  { key: "water", label: "Drank enough water", emoji: "💧" },
  { key: "meal", label: "Ate a balanced meal", emoji: "🥗" },
  { key: "movement", label: "Moved my body", emoji: "🚶" },
  { key: "sleep", label: "Slept well last night", emoji: "😴" },
  { key: "logged", label: "Logged how I felt", emoji: "📝" },
];

export interface ChecklistRow {
  entry_date: string;
  item_key: string;
  completed: boolean;
}

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Daily checklist for the signed-in user.
 * Entries are stored per day, so a new day naturally starts empty while
 * previous days stay in the history.
 */
export const useChecklist = (date: Date = new Date()) => {
  const { user } = useAuth();
  const dateKey = toDateKey(date);
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [history, setHistory] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("daily_checklist")
      .select("entry_date, item_key, completed")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });

    if (err) {
      setError("We couldn't load your checklist.");
    } else {
      const all = (data as ChecklistRow[]) ?? [];
      setHistory(all);
      setRows(all.filter((r) => r.entry_date === dateKey));
    }
    setLoading(false);
  }, [user, dateKey]);

  useEffect(() => {
    load();
  }, [load]);

  const isDone = useCallback(
    (key: string) => rows.some((r) => r.item_key === key && r.completed),
    [rows]
  );

  const toggle = useCallback(
    async (key: string) => {
      if (!user) return;
      const next = !isDone(key);
      setRows((prev) => {
        const others = prev.filter((r) => r.item_key !== key);
        return next ? [...others, { entry_date: dateKey, item_key: key, completed: true }] : others;
      });

      const { error: err } = await supabase
        .from("daily_checklist")
        .upsert(
          { user_id: user.id, entry_date: dateKey, item_key: key, completed: next },
          { onConflict: "user_id,entry_date,item_key" }
        );
      if (err) {
        setError("We couldn't save that just now.");
        await load();
      }
    },
    [user, dateKey, isDone, load]
  );

  const completedCount = CHECKLIST_ITEMS.filter((i) => isDone(i.key)).length;

  /** Days (YYYY-MM-DD) with at least one completed item. */
  const activeDays = Array.from(
    new Set(history.filter((r) => r.completed).map((r) => r.entry_date))
  );

  return {
    items: CHECKLIST_ITEMS,
    isDone,
    toggle,
    completedCount,
    total: CHECKLIST_ITEMS.length,
    activeDays,
    history,
    loading,
    error,
    reload: load,
    dateKey,
  };
};
