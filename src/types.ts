export type CheckStatus = "OK" | "注意" | "要修正";

export interface CheckItem {
  name: string;
  status: CheckStatus;
  issue: string;
  reason: string;
  example?: string;
}

export interface AnalysisResult {
  score: number;
  summary?: string;
  checks: CheckItem[];
  rewrites: {
    simple: string;
    web: string;
    business: string;
  };
}
