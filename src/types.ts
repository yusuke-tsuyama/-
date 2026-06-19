export type CheckStatus = "OK" | "注意" | "要修正";

export interface CriterionItem {
  id: string;
  name: string;
  status: CheckStatus;
  comment: string;
}

export interface AnalysisResult {
  score: number;
  overall: string;
  criteria: CriterionItem[];
  rewrites: {
    simple: string;
    web: string;
    business: string;
  };
}
