// API service layer for TIA lab report analysis.
// Consumes the FastAPI backend. Do NOT put medical logic here — this
// module only sends the file and normalizes the response shape.

export interface AnalysisSection {
  analysis?: Record<string, any>;
  risk?: Record<string, any>;
  possible_conditions?: any[];
  recommendations?: any[];
  red_flags?: Array<{ title: string; message: string; urgency: "High" | "Moderate" | "Low" }>;
  summary?: string;
}

export interface AnalyzeReportResponse {
  patient?: Record<string, any>;
  report?: Record<string, any>;
  thyroid_values?: Record<string, any>;
  analysis?: AnalysisSection;
}

export interface AnalyzeReportEnvelope {
  success?: boolean;
  message?: string;
  report?: AnalyzeReportResponse;
}

export class LabReportApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "LabReportApiError";
    this.status = status;
  }
}

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) throw new LabReportApiError("Missing VITE_API_URL configuration");
  return url.replace(/\/$/, "");
};

/**
 * Uploads a thyroid report to the backend and returns the parsed report object.
 * Sends multipart/form-data to POST /api/analyze-report.
 */
export const analyzeReport = async (file: File): Promise<AnalyzeReportResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/api/analyze-report`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new LabReportApiError(
      err instanceof Error ? `Network error: ${err.message}` : "Network error"
    );
  }

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message || errBody?.detail) detail = errBody.message || errBody.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new LabReportApiError(`Server error: ${detail}`, response.status);
  }

  let data: AnalyzeReportEnvelope;
  try {
    data = await response.json();
  } catch {
    throw new LabReportApiError("Invalid JSON response from server");
  }

  if (data?.success === false || !data?.report) {
    throw new LabReportApiError(data?.message || "Analysis failed");
  }

  return data.report;
};
