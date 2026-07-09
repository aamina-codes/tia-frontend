import { useState, useEffect, useCallback } from "react";

// Red flag item returned by the backend
export interface RedFlagItem {
  title: string;
  message: string;
  urgency: "High" | "Moderate" | "Low";
}

// Rich backend report shape returned by the new FastAPI /analyze-report endpoint
export interface BackendReport {
  patient?: Record<string, any>;
  report?: Record<string, any> & { red_flags?: RedFlagItem[] };
  thyroid_values?: Record<string, any>;
  analysis?: Record<string, any>;
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
  // These exist solely so the current UI keeps rendering during migration.
  // TODO: Remove once the Results UI reads directly from the rich backend fields above.
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  tshStatus: string;
  t3Status: string;
  t4Status: string;
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
    const thyroidValues = backendReport.thyroid_values ?? {};
    const analysis = backendReport.analysis ?? {};
    const reportDetails = backendReport.report ?? {};

    // Red flags may be nested under report.red_flags or at the top level.
    const redFlags: RedFlagItem[] =
      backendReport.red_flags ?? reportDetails.red_flags ?? [];

    // ⚠️ TEMPORARY — derive legacy fields for backward-compatible UI rendering.
    // TODO: Remove once the Results UI consumes the rich backend fields directly.
    const tsh = pickNumber(thyroidValues, ["TSH", "tsh", "tsh_level"]);
    const t3 = pickNumber(thyroidValues, ["T3", "t3", "t3_level", "FT3", "ft3"]);
    const t4 = pickNumber(thyroidValues, ["T4", "t4", "t4_level", "FT4", "ft4"]);
    const tshStatus = pickStatus(analysis, thyroidValues, ["TSH", "tsh", "tsh_status"]);
    const t3Status = pickStatus(analysis, thyroidValues, ["T3", "t3", "t3_status", "FT3"]);
    const t4Status = pickStatus(analysis, thyroidValues, ["T4", "t4", "t4_status", "FT4"]);

    const newReport: LabReport = {
      id: crypto.randomUUID(),
      uploadDate: new Date().toISOString(),
      addedToProfile: false,

      // Permanent backend-driven fields
      patient: backendReport.patient ?? {},
      reportDetails,
      thyroidValues,
      analysis,
      risk: backendReport.risk ?? {},
      possibleConditions: backendReport.possible_conditions ?? [],
      recommendations: backendReport.recommendations ?? [],
      redFlags,
      summary: backendReport.summary ?? "",

      // ⚠️ TEMPORARY compatibility fields — remove after Results UI migration.
      tsh,
      t3,
      t4,
      tshStatus,
      t3Status,
      t4Status,
      interpretation: backendReport.summary ?? "",
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
