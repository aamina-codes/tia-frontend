# TIA — Cohesive Product Pass

Your brief covers 25 areas. Nothing gets rebuilt: auth, onboarding, the lab-report backend, and the purple/butterfly look all stay exactly as they are. I'll work through it in four reviewable stages.

## What's already there (audit)

- Working: sign up / login / Google / forgot password / email verification, protected routes, 5-step onboarding saving to the profile, lab report upload to your FastAPI backend, health tracker, reminders, TIA chat with report context, profile.
- Weak points found:
  - Navigation is a single floating "About / Profile" button in the corner — no real primary navigation, no mobile nav, no way to reach most pages except from Explore.
  - Explore is a static 6-card grid, not a personalized home.
  - No dedicated Reports list page, no report detail view, no Settings, no Help & Safety, no Care Plan naming.
  - Several pages still contain placeholder health content (Doctor Connect doctor list, some tracker/dashboard samples).
  - Empty, loading and error states are inconsistent across pages.

## Stage 1 — Navigation and routes (the "one product" fix)

- New shared app shell: top bar on desktop, bottom bar on mobile, with Home · Reports · Progress · Ask TIA · Profile, plus a menu for Care Plan, Doctor Connect, Settings, About, Help.
- Active page always visibly highlighted.
- Add routes `/reports`, `/assistant`, `/care-plan`, `/settings`, `/help`, `/home` (home = the current Explore page), keeping every existing link working via redirects so nothing breaks.
- Replace the ad-hoc auth code in the old nav with the existing shared auth context.

## Stage 2 — Home, Reports, Progress

- **Home**: time-based greeting with the real profile name, a snapshot card showing only values that actually exist (latest TSH/T3/T4, last report date, last check-in, next reminder), three quick actions, compact progress preview, upcoming reminders, and a TIA insight card. Brand-new user sees a welcome state instead of empty boxes.
- **Reports**: list of the user's real stored reports with date, name, markers and status; upload CTA; opening one shows values, reference ranges, status, interpretation, red flags and comparison with the previous report — all from stored data only.
- **Progress**: time filters (1M / 3M / 6M / 1Y / All), charts only when enough real points exist, and a "What TIA notices" block limited to statements the stored data supports.

## Stage 3 — Care Plan, Profile, Settings, About, Help

- Reminders becomes **My Care Plan**: upcoming reminders, your onboarding health goals, tests and appointments — using the existing reminder data, nothing invented.
- **Profile**: Personal information · My thyroid journey · My health goals · Account, all editable and saved back to the same profile record.
- **Settings**: only controls that genuinely work; anything unsupported is left out.
- **About** and **Help & Safety** written plainly, with the medical disclaimer.

## Stage 4 — Polish pass

- Remove remaining placeholder health content (including the sample doctor list — Doctor Connect will state plainly what it can and can't do today).
- Consistent empty states, skeleton loading, human-readable errors with retry.
- Mobile/tablet check on every page, focus states, form labels, alt text.

## Technical notes

- No database changes. Existing tables, RLS and the `profiles` fields stay as they are; every query stays scoped to the signed-in user.
- Reuses the existing Supabase client, `useLabReports`, `AuthContext`, `ProtectedRoute`, status/colour helpers and shadcn components.
- No new dependencies.

Reply "go" to start with Stage 1, or tell me to reorder.
