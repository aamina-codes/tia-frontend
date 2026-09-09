import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReminderRow {
  id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  reminder_date: string;
  reminder_time: string | null;
  is_active: boolean;
  frequency: string | null;
}

export interface NewReminder {
  title: string;
  description?: string | null;
  reminder_type: string;
  reminder_date: string;
  reminder_time?: string | null;
  frequency?: string | null;
}

/** Reminders for the signed-in user, backed by the database. */
export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("reminders")
      .select("id, title, description, reminder_type, reminder_date, reminder_time, is_active, frequency")
      .eq("user_id", user.id)
      .order("reminder_date", { ascending: true });

    if (err) setError("We couldn't load your reminders.");
    else setReminders((data as ReminderRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addReminder = useCallback(
    async (reminder: NewReminder) => {
      if (!user) return { error: "You need to be signed in." };
      const { error: err } = await supabase.from("reminders").insert({
        user_id: user.id,
        is_active: true,
        ...reminder,
      });
      if (err) return { error: "We couldn't save this reminder." };
      await load();
      return {};
    },
    [user, load]
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)));
      const { error: err } = await supabase
        .from("reminders")
        .update({ is_active: isActive })
        .eq("id", id);
      if (err) await load();
    },
    [load]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      const { error: err } = await supabase.from("reminders").delete().eq("id", id);
      if (err) await load();
    },
    [load]
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reminders.filter((r) => r.is_active && r.reminder_date >= today);
  const past = reminders.filter((r) => r.reminder_date < today);

  return { reminders, upcoming, past, loading, error, reload: load, addReminder, setActive, deleteReminder };
};
