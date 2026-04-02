export const CASE_STATUSES = [
  "draft",
  "intake_pending",
  "intake_structured",
  "discovery_active",
  "enrichment_active",
  "evaluation_pending",
  "approval_required",
  "coordination_active",
  "completed",
  "blocked",
  "escalated",
  "cancelled",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const ENTITY_STATUSES = [
  "new",
  "discovered",
  "enriched",
  "queued",
  "contacted",
  "responded",
  "under_review",
  "approved",
  "rejected",
  "archived",
] as const;

export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "denied"] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface MetricSnapshot {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

export interface BottleneckSignal {
  stage: string;
  severity: "critical" | "warning" | "stable";
  count: number;
  summary: string;
}

export interface RiskFlag {
  code: string;
  label: string;
  severity: "critical" | "warning" | "info";
  summary: string;
}

export interface CaseSummary {
  id: string;
  title: string;
  domainLabel: string;
  status: CaseStatus;
  priority: PriorityLevel;
  ownerName: string;
  openApprovals: number;
  riskFlags: RiskFlag[];
  updatedAt: string;
}

export interface CaseEntitySummary {
  id: string;
  displayName: string;
  roleLabel: string;
  status: EntityStatus;
  fitScore: number;
  riskScore: number;
  confidence: number;
  lastSignal: string;
}
