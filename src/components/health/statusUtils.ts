// Single source of truth for semantic health status across TIA.
// All UI (badges, cards, chart points, timeline dots, chatbot chips, reminders)
// should route through resolveStatus() so color coding stays consistent.

export type HealthStatus =
  | "normal"
  | "borderline"
  | "moderate"
  | "high"
  | "info"
  | "na";

export type MarkerKey = "TSH" | "T3" | "T4" | "FT3" | "FT4" | "AntiTPO";

export interface MarkerRange {
  min: number;
  max: number;
  unit: string;
  borderlineDelta: number; // absolute value of tolerance for "borderline"
  label: string;
}

export const MARKER_RANGES: Record<MarkerKey, MarkerRange> = {
  TSH: { min: 0.4, max: 4.0, unit: "μIU/mL", borderlineDelta: 0.5, label: "TSH" },
  T3: { min: 80, max: 200, unit: "ng/dL", borderlineDelta: 15, label: "T3" },
  T4: { min: 5.0, max: 12.0, unit: "μg/dL", borderlineDelta: 0.8, label: "T4" },
  FT3: { min: 2.3, max: 4.2, unit: "pg/mL", borderlineDelta: 0.3, label: "Free T3" },
  FT4: { min: 0.8, max: 1.8, unit: "ng/dL", borderlineDelta: 0.15, label: "Free T4" },
  AntiTPO: { min: 0, max: 34, unit: "IU/mL", borderlineDelta: 10, label: "Anti-TPO" },
};

const STATUS_LABEL: Record<HealthStatus, string> = {
  normal: "Normal",
  borderline: "Borderline",
  moderate: "Moderate",
  high: "High",
  info: "Info",
  na: "Not Available",
};

export const statusLabel = (s: HealthStatus) => STATUS_LABEL[s];

// Normalize any string coming from the backend to our HealthStatus union.
export function normalizeBackendStatus(
  status?: string | null,
  severity?: string | null,
): HealthStatus | null {
  const s = (status ?? "").toLowerCase().trim();
  const sev = (severity ?? "").toLowerCase().trim();

  if (!s && !sev) return null;

  if (sev === "severe" || sev === "critical" || s === "very high" || s === "very low") return "high";
  if (sev === "moderate" || s === "high" || s === "low") return "moderate";
  if (sev === "mild" || s === "borderline" || s === "slightly high" || s === "slightly low") return "borderline";
  if (s === "normal" || s === "optimal" || s === "stable" || sev === "none") return "normal";
  if (s === "unknown" || s === "n/a" || s === "not available") return "na";

  return null;
}

// Resolve status from backend hints first; fall back to reference-range check.
export function resolveStatus(
  marker: MarkerKey,
  value: number | null | undefined,
  backendStatus?: string | null,
  severity?: string | null,
): HealthStatus {
  const fromBackend = normalizeBackendStatus(backendStatus, severity);
  if (fromBackend) return fromBackend;

  if (value === null || value === undefined || Number.isNaN(value)) return "na";

  const range = MARKER_RANGES[marker];
  if (!range) return "na";

  const { min, max, borderlineDelta } = range;

  if (value >= min && value <= max) return "normal";
  if (value >= min - borderlineDelta && value <= max + borderlineDelta) return "borderline";

  const overshoot = value > max ? value - max : min - value;
  const relative = overshoot / (max - min);
  if (relative > 0.6) return "high";
  return "moderate";
}

export type RiskLevel = "low" | "moderate" | "high";

export function riskToStatus(risk?: string | null): HealthStatus {
  const r = (risk ?? "").toLowerCase().trim();
  if (r === "high" || r === "severe" || r === "critical") return "high";
  if (r === "moderate" || r === "medium") return "moderate";
  if (r === "low" || r === "none" || r === "normal") return "normal";
  return "na";
}

// Aggregate overall status from many markers — used for hero glow, timeline dots.
export function overallStatus(markers: HealthStatus[]): HealthStatus {
  if (markers.length === 0) return "na";
  if (markers.includes("high")) return "high";
  if (markers.includes("moderate")) return "moderate";
  if (markers.includes("borderline")) return "borderline";
  if (markers.every((m) => m === "na")) return "na";
  return "normal";
}
