import type { RiskFlag } from "./domain.js";

export interface IntakeProfileOutput {
  summary: string;
  mustHave: string[];
  niceToHave: string[];
  constraints: string[];
  successSignals: string[];
  recommendedSearchAngles: string[];
  approvalRequired: boolean;
}

export interface EvaluationScoreBreakdownItem {
  criterion: string;
  weight: number;
  score: number;
  evidenceRefs: string[];
}

export interface EvaluationOutput {
  recommendation: "advance" | "hold" | "reject" | "needs_review";
  confidence: number;
  scoreTotal: number;
  scoreBreakdown: EvaluationScoreBreakdownItem[];
  riskFlags: RiskFlag[];
  rationaleSummary: string;
  approvalRequired: boolean;
}

export interface MessageDraftOutput {
  channel: "email" | "slack" | "internal_note";
  language: string;
  subject?: string;
  body: string;
  tone: "neutral" | "warm" | "formal";
  sensitive: boolean;
  approvalRequired: boolean;
}
