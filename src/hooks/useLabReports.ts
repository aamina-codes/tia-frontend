import { useState, useEffect, useCallback } from "react";

export interface LabReport {
  id: string;
  uploadDate: string;
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  tshStatus: string;
  t3Status: string;
  t4Status: string;
  interpretation: string;
  recommendations: string[];
  addedToProfile: boolean;
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

export const useLabReports = () => {
  const [reports, setReports] = useState<LabReport[]>(loadReports);

  // Sync with localStorage on every change
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  // Re-read from localStorage when tab gains focus (cross-tab sync)
  useEffect(() => {
    const onFocus = () => setReports(loadReports());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const addReport = useCallback((report: Omit<LabReport, "id" | "uploadDate" | "addedToProfile">) => {
    const newReport: LabReport = {
      ...report,
      id: crypto.randomUUID(),
      uploadDate: new Date().toISOString(),
      addedToProfile: false,
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
