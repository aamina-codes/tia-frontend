import { useState, useEffect, useCallback } from "react";

// Red flag item returned by the backend
export interface RedFlagItem {
  title: string;
  message: string;
  urgency: "High" | "Moderate" | "Low";
}

// Nested analysis section from POST /api/analyze-report
export interface AnalysisSection {
  analysis?: Record<string, any>;
  risk?: Record<string, any>;
  possible_conditions?: any[];
  recommendations?: any[];
  red_flags?: RedFlagItem[];
  summary?: string;
}

// Rich backend report shape returned by the FastAPI /api/analyze-report endpoint.
// The new schema nests medical analysis under `analysis`, but we accept legacy
// top-level fields as a fallback so older cached responses still parse.
export interface BackendReport {
  patient?: Record<string, any>;
  report?: Record<string, any> & { red_flags?: RedFlagItem[] };
  thyroid_values?: Record<string, any>;
  analysis?: AnalysisSection | Record<string, any>;
  risk?: Record<string, any>;
  possible_conditions?: any[];
  recommendations?: any[];
  red_flags?: RedFlagItem[];
  summary?: string;
}

export interface LabReport {
  id: string;
  uploadDate: string;
  addedToProfile: boolean;

  // Rich backend fields — permanent source of truth
  patient: Record<string, any>;
  reportDetails: Record<string, any>;
  thyroidValues: Record<string, any>;
  analysis: Record<string, any>;
  risk: Record<string, any>;
  possibleConditions: any[];
  recommendations: any[];
  redFlags: RedFlagItem[];
  summary: string;

  // ⚠️ TEMPORARY compatibility fields — derived from the backend response only.
  // Any of these may be null when the corresponding marker is missing.
  // TODO: Remove once the Results UI reads directly from the rich backend fields above.
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  ft3: number | null;
  ft4: number | null;
  antiTPO: number | null;
  tshStatus: string;
  t3Status: string;
  t4Status: string;
  ft3Status: string;
  ft4Status: string;
  antiTPOStatus: string;
  interpretation: string;
}

const STORAGE_KEY = "tia_lab_reports";

const loadReports = (): LabReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveReports = (reports: LabReport[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

// ⚠️ TEMPORARY helpers — used only to populate the legacy compatibility fields
// from the backend response. No medical logic here: they just pluck values.
// TODO: Remove alongside the legacy fields once the UI is fully migrated.
const pickNumber = (obj: Record<string, any> | undefined, keys: string[]): number | null => {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
    if (typeof v === "object") {
      const nested = pickNumber(v, ["value", "level", "result"]);
      if (nested !== null) return nested;
    }
  }
  return null;
};

const pickStatus = (
  analysis: Record<string, any> | undefined,
  thyroidValues: Record<string, any> | undefined,
  keys: string[]
): string => {
  const sources = [analysis, thyroidValues];
  for (const src of sources) {
    if (!src) continue;
    for (const k of keys) {
      const v = src[k];
      if (typeof v === "string" && v.trim()) return v;
      if (v && typeof v === "object") {
        const s = v.status ?? v.state ?? v.label;
        if (typeof s === "string" && s.trim()) return s;
      }
    }
  }
  return "unknown";
};

export const useLabReports = () => {
  const [reports, setReports] = useState<LabReport[]>(loadReports);

  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  useEffect(() => {
    const onFocus = () => setReports(loadReports());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const addReport = useCallback((backendReport: BackendReport) => {
    // Backend now nests `patient` and `report` inside `thyroid_values` alongside
    // the marker values (TSH, T3, T4, FT3, FT4, Anti_TPO). Unwrap them here so
    // downstream code keeps working, and accept legacy top-level fields too.
    const rawThyroid = (backendReport.thyroid_values ?? {}) as Record<string, any>;
    const { patient: nestedPatient, report: nestedReport, ...thyroidMarkers } = rawThyroid;

    const patient = backendReport.patient ?? nestedPatient ?? {};
    const reportDetails = backendReport.report ?? nestedReport ?? {};
    const thyroidValues = thyroidMarkers;

    // Analysis may be nested (new schema) or flat (legacy). Detect and unwrap.
    const rawAnalysis = (backendReport.analysis ?? {}) as any;
    const isNested =
      rawAnalysis &&
      typeof rawAnalysis === "object" &&
      ("risk" in rawAnalysis ||
        "recommendations" in rawAnalysis ||
        "possible_conditions" in rawAnalysis ||
        "red_flags" in rawAnalysis ||
        "summary" in rawAnalysis ||
        "analysis" in rawAnalysis);

    const analysis: Record<string, any> = isNested
      ? rawAnalysis.analysis ?? {}
      : rawAnalysis;
    const risk = (isNested ? rawAnalysis.risk : backendReport.risk) ?? {};
    const possibleConditions =
      (isNested ? rawAnalysis.possible_conditions : backendReport.possible_conditions) ?? [];
    const recommendations =
      (isNested ? rawAnalysis.recommendations : backendReport.recommendations) ?? [];
    const summary =
      (isNested ? rawAnalysis.summary : backendReport.summary) ?? "";

    const redFlags: RedFlagItem[] =
      (isNested ? rawAnalysis.red_flags : undefined) ??
      backendReport.red_flags ??
      reportDetails.red_flags ??
      [];

    // ⚠️ TEMPORARY — derive legacy per-marker fields for backward-compatible UI.
    // Every marker may be null when the lab did not include that test.
    // TODO: Remove once the Results UI consumes the rich backend fields directly.
    const tsh = pickNumber(thyroidValues, ["TSH", "tsh", "tsh_level"]);
    const t3 = pickNumber(thyroidValues, ["T3", "t3", "t3_level"]);
    const t4 = pickNumber(thyroidValues, ["T4", "t4", "t4_level"]);
    const ft3 = pickNumber(thyroidValues, ["FT3", "ft3", "free_t3", "Free_T3"]);
    const ft4 = pickNumber(thyroidValues, ["FT4", "ft4", "free_t4", "Free_T4"]);
    const antiTPO = pickNumber(thyroidValues, ["Anti_TPO", "anti_tpo", "AntiTPO", "TPO", "tpo"]);

    const tshStatus = pickStatus(analysis, thyroidValues, ["TSH", "tsh", "tsh_status"]);
    const t3Status = pickStatus(analysis, thyroidValues, ["T3", "t3", "t3_status"]);
    const t4Status = pickStatus(analysis, thyroidValues, ["T4", "t4", "t4_status"]);
    const ft3Status = pickStatus(analysis, thyroidValues, ["FT3", "ft3", "Free_T3", "free_t3"]);
    const ft4Status = pickStatus(analysis, thyroidValues, ["FT4", "ft4", "Free_T4", "free_t4"]);
    const antiTPOStatus = pickStatus(analysis, thyroidValues, ["Anti_TPO", "anti_tpo", "AntiTPO", "TPO", "tpo"]);

    const newReport: LabReport = {
      id: crypto.randomUUID(),
      uploadDate: new Date().toISOString(),
      addedToProfile: false,

      // Permanent backend-driven fields
      patient,
      reportDetails,
      thyroidValues,
      analysis,
      risk,
      possibleConditions,
      recommendations,
      redFlags,
      summary,

      // ⚠️ TEMPORARY compatibility fields — remove after Results UI migration.
      tsh,
      t3,
      t4,
      ft3,
      ft4,
      antiTPO,
      tshStatus,
      t3Status,
      t4Status,
      ft3Status,
      ft4Status,
      antiTPOStatus,
      interpretation: summary,
    };

    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleAddToProfile = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, addedToProfile: !r.addedToProfile } : r))
    );
  }, []);

  const latestReport = reports.length > 0 ? reports[0] : null;
  const profileReport = reports.find((r) => r.addedToProfile) ?? null;

  return { reports, latestReport, profileReport, addReport, deleteReport, toggleAddToProfile };
};
