import changelogData from "../../data/catalog/changelog.json";
import confusionGuideData from "../../data/catalog/confusions.json";
import glossaryData from "../../data/catalog/glossary.json";
import modelData from "../../data/catalog/models.json";
import productEntryData from "../../data/catalog/products.json";
import providerData from "../../data/catalog/providers.json";

export type ProviderId = "openai" | "anthropic" | "google" | "xai" | "open-models";
export type ProductKind = "App" | "Model" | "API" | "Platform" | "Agent" | "Developer tool" | "Subscription";

export type UseCaseId =
  | "agentic-coding"
  | "rag-search"
  | "realtime-voice"
  | "cheap-batch"
  | "workspace-automation"
  | "multimodal-analysis";

export type Budget = "lowest" | "balanced" | "premium";
export type Latency = "instant" | "balanced" | "deep";
export type Ecosystem = "none" | "openai" | "google" | "anthropic" | "xai" | "self-host";
export type Capability =
  | "coding"
  | "reasoning"
  | "agents"
  | "tool-calling"
  | "structured-output"
  | "multimodal"
  | "realtime"
  | "long-context"
  | "cost-efficiency"
  | "self-hosting";

export type Provider = {
  id: ProviderId;
  name: string;
  accent: string;
  summary: string;
  developerAngle: string;
  sourceUrl: string;
  lastVerified: string;
};

export type ModelRecord = {
  id: string;
  providerId: ProviderId;
  name: string;
  modelId: string;
  status: "stable" | "preview" | "product";
  shortDescription: string;
  bestFor: UseCaseId[];
  capabilities: Capability[];
  pricingTier: Budget;
  latency: Latency;
  contextWindow: string;
  modalities: string[];
  surfaces: string[];
  strengths: string[];
  limitations: string[];
  sourceUrl: string;
  lastVerified: string;
};

export type QuizState = {
  useCase: UseCaseId;
  budget: Budget;
  latency: Latency;
  ecosystem: Ecosystem;
  needsOpenWeights: boolean;
};

export type Recommendation = {
  model: ModelRecord;
  score: number;
  reasons: string[];
};

export type ChangelogEntry = {
  id: string;
  date: string;
  providerId: ProviderId;
  title: string;
  impact: string;
  sourceUrl: string;
};

export type GlossaryTerm = {
  term: string;
  plainEnglish: string;
  developerRead: string;
};

export type ProductEntry = {
  id: string;
  providerId: ProviderId;
  name: string;
  kind: ProductKind;
  plainEnglish: string;
  audience: string;
  useWhen: string;
  skipWhen: string;
  developerDetail: string;
  relatedNames: string[];
  sourceUrl: string;
  lastVerified: string;
};

export type ConfusionGuide = {
  id: string;
  title: string;
  providerId: ProviderId;
  question: string;
  answer: string;
  choices: Array<{
    label: string;
    pickWhen: string;
  }>;
};

export const providers = providerData as Provider[];
export const productEntries = productEntryData as ProductEntry[];
export const models = modelData as ModelRecord[];
export const changelog = changelogData as ChangelogEntry[];
export const glossary = glossaryData as GlossaryTerm[];
export const confusionGuides = confusionGuideData as ConfusionGuide[];

export const useCases: Record<UseCaseId, { label: string; prompt: string; coreCapabilities: Capability[] }> = {
  "agentic-coding": {
    label: "Coding agent",
    prompt: "I am building or choosing an AI coding tool that edits real repos.",
    coreCapabilities: ["coding", "agents", "tool-calling", "reasoning"],
  },
  "rag-search": {
    label: "RAG and search",
    prompt: "I need grounded answers over documents, repos, or customer data.",
    coreCapabilities: ["long-context", "structured-output", "tool-calling", "cost-efficiency"],
  },
  "realtime-voice": {
    label: "Realtime voice",
    prompt: "I need low-latency speech, interruption handling, or live support.",
    coreCapabilities: ["realtime", "multimodal", "tool-calling"],
  },
  "cheap-batch": {
    label: "Cheap batch work",
    prompt: "I need to classify, extract, summarize, or transform lots of data.",
    coreCapabilities: ["cost-efficiency", "structured-output"],
  },
  "workspace-automation": {
    label: "Workspace automation",
    prompt: "I need AI inside docs, sheets, browser workflows, and business tools.",
    coreCapabilities: ["agents", "tool-calling", "structured-output", "multimodal"],
  },
  "multimodal-analysis": {
    label: "Multimodal analysis",
    prompt: "I need strong reasoning over text, images, PDFs, audio, or video.",
    coreCapabilities: ["multimodal", "long-context", "reasoning"],
  },
};

const budgetScore: Record<Budget, Record<Budget, number>> = {
  lowest: { lowest: 22, balanced: 12, premium: -10 },
  balanced: { lowest: 8, balanced: 18, premium: 6 },
  premium: { lowest: -4, balanced: 10, premium: 20 },
};

const latencyScore: Record<Latency, Record<Latency, number>> = {
  instant: { instant: 20, balanced: 8, deep: -8 },
  balanced: { instant: 8, balanced: 18, deep: 8 },
  deep: { instant: -4, balanced: 10, deep: 20 },
};

export function getProvider(providerId: ProviderId) {
  return providers.find((provider) => provider.id === providerId);
}

export function getModelsByProvider(providerId: ProviderId) {
  return models.filter((model) => model.providerId === providerId);
}

export function getRecommendations(quiz: QuizState): Recommendation[] {
  return models
    .map((model) => {
      const reasons: string[] = [];
      let score = 22;

      if (model.bestFor.includes(quiz.useCase)) {
        score += 22;
        reasons.push(`Direct fit for ${useCases[quiz.useCase].label.toLowerCase()}.`);
      }

      for (const capability of useCases[quiz.useCase].coreCapabilities) {
        if (model.capabilities.includes(capability)) {
          score += 4;
        }
      }

      score += budgetScore[quiz.budget][model.pricingTier];
      score += latencyScore[quiz.latency][model.latency];

      if (quiz.ecosystem !== "none" && model.providerId === quiz.ecosystem) {
        score += 12;
        reasons.push(`Matches your ${getProvider(model.providerId)?.name} ecosystem preference.`);
      }

      if (quiz.needsOpenWeights) {
        if (model.capabilities.includes("self-hosting")) {
          score += 24;
          reasons.push("Supports an open-weight or self-hosting path.");
        } else {
          score -= 22;
        }
      }

      if (model.capabilities.includes("structured-output")) {
        reasons.push("Works well for production apps that need typed outputs.");
      }

      if (model.capabilities.includes("tool-calling")) {
        reasons.push("Can connect to tools and application state.");
      }

      return {
        model,
        score: Math.max(0, Math.min(98, score)),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildStackSummary(quiz: QuizState, recommendations: Recommendation[]) {
  const primary = recommendations[0]?.model;
  const secondary = recommendations.find((recommendation) => recommendation.model.pricingTier !== primary?.pricingTier)?.model;

  return {
    title: `${useCases[quiz.useCase].label} stack`,
    primary,
    secondary,
    notes: [
      "Keep the model choice behind an adapter so production can switch providers.",
      "Log prompts, tool calls, latency, token usage, and user-visible failures from day one.",
      "Use a small eval set before increasing traffic or swapping model versions.",
    ],
  };
}
