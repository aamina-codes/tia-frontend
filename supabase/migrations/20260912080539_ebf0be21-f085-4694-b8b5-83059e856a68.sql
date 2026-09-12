
CREATE TABLE public.daily_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  item_key text not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date, item_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checklist TO authenticated;
GRANT ALL ON public.daily_checklist TO service_role;
ALTER TABLE public.daily_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own checklist" ON public.daily_checklist
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.doctor_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  is_discussed boolean not null default false,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_questions TO authenticated;
GRANT ALL ON public.doctor_questions TO service_role;
ALTER TABLE public.doctor_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own questions" ON public.doctor_questions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.appointment_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  appointment_date date not null,
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_notes TO authenticated;
GRANT ALL ON public.appointment_notes TO service_role;
ALTER TABLE public.appointment_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own appointment notes" ON public.appointment_notes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS doctor_specialty text,
  ADD COLUMN IF NOT EXISTS doctor_clinic text,
  ADD COLUMN IF NOT EXISTS doctor_contact text;
