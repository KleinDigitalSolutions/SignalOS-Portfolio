export const EVENT_NAMES = [
  "intake.created",
  "intake.structured",
  "entity.discovered",
  "entity.enriched",
  "message.generated",
  "message.sent",
  "reply.received",
  "reply.classified",
  "evaluation.completed",
  "approval.required",
  "approval.granted",
  "approval.denied",
  "workflow.failed",
  "workflow.retried",
  "policy.violation_detected",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export interface EventLogItem {
  id: string;
  eventName: EventName;
  caseId: string;
  entityId?: string;
  severity: "critical" | "warning" | "info";
  title: string;
  summary: string;
  occurredAt: string;
  actorLabel: string;
}
