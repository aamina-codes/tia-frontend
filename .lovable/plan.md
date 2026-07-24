
# TIA Full Redesign Plan

The scope in your prompt is very large (six pages restructured + new AI features + a semantic color system). I'll execute it in **five sequential phases** so each ships in a reviewable state. Purple/butterfly branding, gradients, glassmorphism, and existing backend integration stay intact throughout.

---

## Phase 0 — Semantic Health Color System (foundation)

Everything else builds on this, so it goes first.

Add HSL tokens in `src/index.css` + `tailwind.config.ts`:

- `--health-normal` #22C55E
- `--health-borderline` #FACC15
- `--health-moderate` #FB923C
- `--health-high` #EF4444
- `--health-info` #3B82F6
- `--health-na` #94A3B8

Plus glow shadow tokens (`--glow-normal`, `--glow-borderline`, …) and Tailwind `text-health-*` / `bg-health-*` / `border-health-*` / `shadow-glow-*` utilities.

New shared components:
- `src/components/health/StatusBadge.tsx` — badge with dot + label, driven by a `HealthStatus` union.
- `src/components/health/statusUtils.ts` — one function `resolveStatus(marker, value, backendStatus, severity)` → `HealthStatus`. Single source of truth used by lab cards, chatbot inline chips, timeline dots, trend graphs, reminders.

Add subtle keyframes: `pulse-normal`, `pulse-warning`, `glow-soft` (used sparingly).

---

## Phase 1 — Explore / Home → "Your Thyroid Today" dashboard

Rework `src/pages/ExploreFeatures.tsx`:

1. **Hero status block** (new `TodayHeroCard.tsx`):
   - Time-based greeting from user's first name (from Profile/auth).
   - Overall status pill (Stable/Monitoring/Attention) using health colors + glow.
   - Four stat tiles: Last Report date · Latest TSH · Next Medication · Reports count.
   - Primary CTA: **Upload New Report**.
2. **Primary Actions row** (3 large cards): Analyze New Report, Chat with TIA, Health Timeline.
3. **Secondary Actions row** (3 smaller cards): Reminders, Doctor Connect, Profile.

Existing 6-card grid retired; feature cards restyled into the new hierarchy.

---

## Phase 2 — Smart Lab Report Analysis

In `src/pages/LabReportAnalysis.tsx`:

- Top **Overall Result summary card** — colored risk badge (LOW / MODERATE / HIGH) + one-line plain-language verdict + red-flag count.
- Per-marker cards (TSH, T3, T4, FT3, FT4, Anti-TPO) rebuilt as `MarkerCard.tsx`:
  - Value + unit, `StatusBadge`, reference range, 1-sentence plain explanation.
  - Border/accent/icon color derived from `resolveStatus`. No more "Unknown" when a status can be derived from value + range.
- **AI Recommendations** section → chip/checklist cards instead of paragraphs.
- History list dots colored by report status.

---

## Phase 3 — Progress Dashboard + Health Tracker

**ProgressDashboard.tsx**:
- Single question focus: "How is my thyroid changing?"
- Order: Health Score → Interactive Trend Chart → Latest Changes → Timeline.
- Trend chart (`TrendChart.tsx`, Recharts): toggle TSH/T3/T4/FT3/FT4, shaded normal-range band, colored points by status, dashed purple future-projection line, rich tooltip (`Value + StatusBadge`).
- Premium features collapsed to small **locked chips** that open a modal (`PremiumFeatureModal.tsx`) instead of large blurred sections.
- Timeline dots colored by report status.

**HealthTracker.tsx**:
- New **Daily Check-In card** — one form: mood, sleep hours, energy slider, symptom chips (Hair Fall, Weight Gain, Cold Intolerance, Fatigue, Dry Skin, Anxiety, Brain Fog), notes.
- Removes separate Mood Log / Notes sections.
- Chart gets marker toggles + normal-range band, same style as Progress trend chart.

---

## Phase 4 — Chatbot + Reminders + Doctor Connect

**Chatbot.tsx**:
- New TIA intro: "Hello — I'm TIA, your AI Thyroid Assistant. I've already reviewed your latest report…"
- Suggested-question chips above the composer (Explain my TSH, Compare with previous report, Can I eat soy?, Why am I tired?, What foods help hypothyroidism?, Should I consult a doctor?).
- Message renderer post-processes text to wrap lab references in small colored `LabValueChip` inline cards (TSH 1.12 · Normal).

**Reminders.tsx**:
- **Today's Schedule** timeline (time · title · action buttons: Taken / Skip / Snooze) using color coding (blue upcoming, green taken, red missed, yellow lab test).
- Sections: Medications · Lab Tests (every 6 months) · Doctor Appointments.
- Keeps existing calendar as a secondary view.

**DoctorConnect.tsx**:
- Doctor profile card with Share Latest Report · Download PDF Summary · Book Appointment.
- Auto-lists uploaded reports from `useLabReports` (no more empty state when reports exist).
- Sync: uploads from Smart Analysis appear here automatically.

---

## Phase 5 — New AI Features

Small additions, each behind existing PremiumGate where appropriate:

- **AI Explanation Mode** — click any marker → sheet with What it is / Why it matters / Your value / Possible causes / Simple + Medical toggle. Wired to a new `explain-marker` edge function (Lovable AI Gateway, `google/gemini-2.5-flash`).
- **Trend Prediction** — text block on Progress: analyzes last 3 reports and states expected trend.
- **Diet Recommendations** — cards on Progress, generated from latest report status.
- **Symptom Checker** — new `/symptom-checker` route: chip-based symptom picker → AI compares vs. latest labs → returns likely correlation + suggestion.
- **One-Click Doctor Summary** — extend `ConsultationSummary` with a PDF export (jsPDF) including labs, trends, meds, symptoms, questions-for-doctor.

---

## Technical Notes

- All health colors come from CSS tokens; no hardcoded hex in components.
- `resolveStatus` is the single classifier; backend `status`/`severity` win over local range checks when present.
- Lab report state (`useLabReports`) already central — Doctor Connect, Reminders lab section, Chatbot context all read from it. No schema changes needed.
- New edge functions (`explain-marker`, `symptom-check`, `trend-predict`) use existing Lovable AI Gateway pattern from `generate-insights`.
- No changes to auth, DB schema, or existing analyze-report backend contract.

---

## Delivery order

Each phase is a separate turn so you can review + course-correct:

```text
Turn 1 → Phase 0 (color system + StatusBadge + tokens)
Turn 2 → Phase 1 (Explore dashboard rework)
Turn 3 → Phase 2 (Smart Lab Report)
Turn 4 → Phase 3 (Progress + Tracker)
Turn 5 → Phase 4 (Chatbot + Reminders + Doctor)
Turn 6 → Phase 5 (AI features)
```

Reply **"go"** to start with Phase 0, or tell me to reorder / drop phases.
