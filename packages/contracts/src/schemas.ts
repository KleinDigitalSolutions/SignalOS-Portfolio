export const intakeProfileSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "mustHave",
    "niceToHave",
    "constraints",
    "successSignals",
    "recommendedSearchAngles",
    "approvalRequired",
  ],
  properties: {
    summary: { type: "string" },
    mustHave: { type: "array", items: { type: "string" } },
    niceToHave: { type: "array", items: { type: "string" } },
    constraints: { type: "array", items: { type: "string" } },
    successSignals: { type: "array", items: { type: "string" } },
    recommendedSearchAngles: { type: "array", items: { type: "string" } },
    approvalRequired: { type: "boolean" },
  },
} as const;

export const evaluationSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "recommendation",
    "confidence",
    "scoreTotal",
    "scoreBreakdown",
    "riskFlags",
    "rationaleSummary",
    "approvalRequired",
  ],
  properties: {
    recommendation: {
      type: "string",
      enum: ["advance", "hold", "reject", "needs_review"],
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    scoreTotal: { type: "number", minimum: 0, maximum: 100 },
    scoreBreakdown: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["criterion", "weight", "score", "evidenceRefs"],
        properties: {
          criterion: { type: "string" },
          weight: { type: "number" },
          score: { type: "number" },
          evidenceRefs: { type: "array", items: { type: "string" } },
        },
      },
    },
    riskFlags: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "label", "severity", "summary"],
        properties: {
          code: { type: "string" },
          label: { type: "string" },
          severity: { type: "string", enum: ["critical", "warning", "info"] },
          summary: { type: "string" },
        },
      },
    },
    rationaleSummary: { type: "string" },
    approvalRequired: { type: "boolean" },
  },
} as const;

export const messageDraftSchema = {
  type: "object",
  additionalProperties: false,
  required: ["channel", "language", "body", "tone", "sensitive", "approvalRequired"],
  properties: {
    channel: {
      type: "string",
      enum: ["email", "slack", "internal_note"],
    },
    language: { type: "string" },
    subject: { type: "string" },
    body: { type: "string" },
    tone: { type: "string", enum: ["neutral", "warm", "formal"] },
    sensitive: { type: "boolean" },
    approvalRequired: { type: "boolean" },
  },
} as const;
