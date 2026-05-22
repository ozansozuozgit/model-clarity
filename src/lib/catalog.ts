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

export const useCases: Record<UseCaseId, { label: string; prompt: string; coreCapabilities: Capability[] }> = {
  "agentic-coding": {
    label: "Agentic coding",
    prompt: "I am building or choosing a coding agent that edits real repos.",
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

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    accent: "oklch(0.58 0.11 174)",
    summary: "Broad API platform with strong general models, realtime APIs, tools, and ChatGPT product reach.",
    developerAngle: "Often the safest default when you need mature APIs, tool use, realtime options, and broad ecosystem support.",
    sourceUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    accent: "oklch(0.62 0.12 42)",
    summary: "Claude family with strong long-form reasoning, coding workflows, and Claude Code adoption.",
    developerAngle: "Best fit when careful instruction following, agentic coding, and long-context analysis matter more than raw breadth.",
    sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/models/all-models",
    lastVerified: "2026-05-21",
  },
  {
    id: "google",
    name: "Google",
    accent: "oklch(0.58 0.14 252)",
    summary: "Gemini and Vertex AI ecosystem with deep multimodal context, Workspace adjacency, and Google Cloud deployment.",
    developerAngle: "Strongest when the build touches Google Cloud, Search grounding, Workspace, or multimodal repository analysis.",
    sourceUrl: "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "xai",
    name: "xAI",
    accent: "oklch(0.64 0.1 116)",
    summary: "Grok models and Grok Build for developers who want fast agentic workflows and xAI API access.",
    developerAngle: "Useful to evaluate for low-cost high-context calls, tool calling, and agent workflows tied to the Grok ecosystem.",
    sourceUrl: "https://docs.x.ai/docs/models/grok-4-fast-non-reasoning",
    lastVerified: "2026-05-21",
  },
  {
    id: "open-models",
    name: "Open models",
    accent: "oklch(0.64 0.1 330)",
    summary: "Llama, Mistral, DeepSeek, Qwen, Gemma, and other weights for control, hosting flexibility, and cost-sensitive workloads.",
    developerAngle: "Best when data residency, custom deployment, fine control, or unit economics beat frontier-model convenience.",
    sourceUrl: "https://cloud.google.com/vertex-ai/generative-ai/docs/models",
    lastVerified: "2026-05-21",
  },
];

export const productEntries: ProductEntry[] = [
  {
    id: "gemini-app",
    providerId: "google",
    name: "Gemini app",
    kind: "App",
    plainEnglish: "The consumer chat app. You open it to ask questions, write, plan, search, talk, or use personal assistant features.",
    audience: "Everyday users, students, creators, and people using Google accounts.",
    useWhen: "You want a ready-made assistant, not an API or cloud deployment.",
    skipWhen: "You are building your own product or need enterprise cloud controls.",
    developerDetail: "Think of it as Google's ChatGPT-style product surface. It may contain features powered by different Gemini models.",
    relatedNames: ["Gemini Live", "Gemini Spark", "Daily Brief", "Google AI Pro", "Google AI Ultra"],
    sourceUrl: "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/",
    lastVerified: "2026-05-21",
  },
  {
    id: "gemini-spark",
    providerId: "google",
    name: "Gemini Spark",
    kind: "Agent",
    plainEnglish: "A personal agent inside the Gemini world that can keep working on tasks in the background under your direction.",
    audience: "People who want ongoing help across Gmail, Docs, Calendar, and connected apps.",
    useWhen: "You want an assistant to monitor, organize, draft, and act across personal or Workspace tasks.",
    skipWhen: "You only need a model API, a coding tool, or a one-off chatbot answer.",
    developerDetail: "Google says Spark runs on Gemini 3.5 and uses the Antigravity harness. Treat it as a product/agent, not a model name.",
    relatedNames: ["Gemini app", "Daily Brief", "Antigravity", "MCP connections"],
    sourceUrl: "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/",
    lastVerified: "2026-05-21",
  },
  {
    id: "google-ai-studio",
    providerId: "google",
    name: "Google AI Studio",
    kind: "Developer tool",
    plainEnglish: "A browser workspace for trying Gemini prompts, testing model behavior, and turning experiments into API calls.",
    audience: "Developers, prototypers, and technical product teams.",
    useWhen: "You want to quickly test Gemini without setting up a full cloud project first.",
    skipWhen: "You need production governance, monitoring, compliance, or team cloud infrastructure.",
    developerDetail: "Best understood as the fast prototyping surface for Gemini API work.",
    relatedNames: ["Gemini API", "Gemini models", "Vertex AI"],
    sourceUrl: "https://ai.google.dev/gemini-api/docs",
    lastVerified: "2026-05-21",
  },
  {
    id: "gemini-api",
    providerId: "google",
    name: "Gemini API",
    kind: "API",
    plainEnglish: "The developer API for putting Gemini models inside your own app.",
    audience: "Developers building apps, agents, automations, and AI features.",
    useWhen: "You want your product to call Gemini directly from code.",
    skipWhen: "You only need the Gemini app, or your company requires Google Cloud enterprise controls.",
    developerDetail: "This is the model access layer. It is different from the Gemini app and different from Vertex AI.",
    relatedNames: ["Google AI Studio", "Gemini models", "Vertex AI"],
    sourceUrl: "https://ai.google.dev/gemini-api/docs",
    lastVerified: "2026-05-21",
  },
  {
    id: "vertex-ai",
    providerId: "google",
    name: "Vertex AI",
    kind: "Platform",
    plainEnglish: "Google Cloud's managed AI platform for deploying, governing, monitoring, and scaling AI systems.",
    audience: "Companies, cloud teams, and developers building production systems on Google Cloud.",
    useWhen: "You need enterprise deployment, permissions, data controls, billing, monitoring, or cloud integration.",
    skipWhen: "You just want to chat, prototype quickly, or run a small personal script.",
    developerDetail: "Vertex AI can serve Gemini and other models, but it is a cloud platform, not a single model.",
    relatedNames: ["Google Cloud", "Gemini models", "Model Garden", "Gemini API"],
    sourceUrl: "https://docs.cloud.google.com/vertex-ai/generative-ai/docs",
    lastVerified: "2026-05-21",
  },
  {
    id: "google-ai-pro-ultra",
    providerId: "google",
    name: "Google AI Pro / Ultra",
    kind: "Subscription",
    plainEnglish: "Paid plans that unlock higher limits and premium AI features across Google's AI products.",
    audience: "Power users, creators, professionals, and teams that need more access than the free tier.",
    useWhen: "You use Gemini products often and need better limits or premium features.",
    skipWhen: "You are comparing raw model APIs or building production cloud infrastructure.",
    developerDetail: "A subscription can unlock product access, but it is not the same thing as an API contract or enterprise cloud deployment.",
    relatedNames: ["Gemini app", "Gemini Spark", "Gemini Omni", "AI Ultra"],
    sourceUrl: "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/",
    lastVerified: "2026-05-21",
  },
  {
    id: "google-flow",
    providerId: "google",
    name: "Flow",
    kind: "App",
    plainEnglish: "A creative video-making product for generating and editing videos with Google's media models.",
    audience: "Creators, marketers, filmmakers, and people making visual content.",
    useWhen: "You want to make or edit video, not build a model-powered app.",
    skipWhen: "You need chat, coding, enterprise deployment, or an API-first workflow.",
    developerDetail: "Flow is a creative product surface. The underlying media model names may change independently.",
    relatedNames: ["Gemini Omni", "Veo", "Gemini app"],
    sourceUrl: "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/",
    lastVerified: "2026-05-21",
  },
  {
    id: "notebooklm",
    providerId: "google",
    name: "NotebookLM",
    kind: "App",
    plainEnglish: "A research and study tool that helps you understand sources you provide.",
    audience: "Students, researchers, writers, analysts, and anyone working with documents.",
    useWhen: "You want AI grounded in a set of notes, files, or sources.",
    skipWhen: "You need a general assistant, a coding tool, or an API for your own app.",
    developerDetail: "NotebookLM is a user-facing research product, not the same thing as a RAG API or Vertex AI deployment.",
    relatedNames: ["Gemini", "Research", "Google Labs"],
    sourceUrl: "https://blog.google/technology/ai/notebooklm/",
    lastVerified: "2026-05-21",
  },
  {
    id: "antigravity",
    providerId: "google",
    name: "Antigravity",
    kind: "Developer tool",
    plainEnglish: "Google's agentic coding environment and command-line workflow for delegating software tasks.",
    audience: "Developers working in codebases.",
    useWhen: "You want an AI tool to inspect, edit, run, or reason through code work.",
    skipWhen: "You are looking for a general chat app, video generator, or simple model API.",
    developerDetail: "Antigravity is a coding product/harness. It can use Gemini models, but it is not itself a foundation model.",
    relatedNames: ["Antigravity CLI", "Gemini CLI", "Gemini models", "Gemini Spark"],
    sourceUrl: "https://www.antigravity.google/docs/cli-using",
    lastVerified: "2026-05-21",
  },
  {
    id: "chatgpt",
    providerId: "openai",
    name: "ChatGPT",
    kind: "App",
    plainEnglish: "OpenAI's assistant app for chatting, writing, researching, coding help, files, voice, and daily work.",
    audience: "Everyone from casual users to professionals.",
    useWhen: "You want a polished AI assistant you can use directly.",
    skipWhen: "You need to embed the model in your own product through code.",
    developerDetail: "ChatGPT is the product surface. OpenAI API is the developer surface.",
    relatedNames: ["GPT models", "Codex", "OpenAI API"],
    sourceUrl: "https://openai.com/chatgpt/",
    lastVerified: "2026-05-21",
  },
  {
    id: "openai-api",
    providerId: "openai",
    name: "OpenAI API",
    kind: "API",
    plainEnglish: "The developer API for adding OpenAI models, tools, structured outputs, and realtime experiences to apps.",
    audience: "Developers and product teams.",
    useWhen: "You are building your own AI feature, app, agent, or workflow.",
    skipWhen: "You only need an assistant you can use directly in a browser.",
    developerDetail: "Model names belong here. ChatGPT features may use the same model families but are not the same interface.",
    relatedNames: ["Responses API", "Realtime API", "GPT models", "Codex"],
    sourceUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "codex",
    providerId: "openai",
    name: "Codex",
    kind: "Developer tool",
    plainEnglish: "OpenAI's coding agent/tooling family for working on software tasks.",
    audience: "Developers working with repositories, terminals, and code review.",
    useWhen: "You want AI help that understands code changes, tests, and implementation workflows.",
    skipWhen: "You want general chat, image generation, or a model API only.",
    developerDetail: "Codex is a product/workflow layer. It may use OpenAI models, but it should not be confused with a single model.",
    relatedNames: ["ChatGPT", "OpenAI API", "GPT models"],
    sourceUrl: "https://openai.com/codex/",
    lastVerified: "2026-05-21",
  },
  {
    id: "claude",
    providerId: "anthropic",
    name: "Claude",
    kind: "App",
    plainEnglish: "Anthropic's assistant app for chat, writing, analysis, files, projects, and everyday reasoning.",
    audience: "People and teams who want a direct assistant.",
    useWhen: "You want to use Claude directly without building an app.",
    skipWhen: "You need model calls inside your own software.",
    developerDetail: "Claude is the assistant surface. The Anthropic API is the programmable surface.",
    relatedNames: ["Claude Code", "Claude API", "Claude models", "Projects"],
    sourceUrl: "https://claude.ai/",
    lastVerified: "2026-05-21",
  },
  {
    id: "claude-code",
    providerId: "anthropic",
    name: "Claude Code",
    kind: "Developer tool",
    plainEnglish: "Anthropic's coding agent for software projects.",
    audience: "Developers working in existing codebases.",
    useWhen: "You want Claude to inspect files, plan edits, write code, and help with repo tasks.",
    skipWhen: "You need a consumer assistant or a generic model API call.",
    developerDetail: "Claude Code is a coding workflow. Claude Sonnet and Opus are model choices that can power coding work.",
    relatedNames: ["Claude", "Claude API", "Sonnet", "Opus"],
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/overview",
    lastVerified: "2026-05-21",
  },
  {
    id: "grok",
    providerId: "xai",
    name: "Grok",
    kind: "App",
    plainEnglish: "xAI's assistant product for using Grok models directly.",
    audience: "People who want the Grok assistant experience.",
    useWhen: "You want to interact with Grok as an app rather than build with the API.",
    skipWhen: "You need programmable access in your own product.",
    developerDetail: "Grok is the product surface. xAI API and Grok Build are separate developer surfaces.",
    relatedNames: ["xAI API", "Grok models", "Grok Build"],
    sourceUrl: "https://docs.x.ai/",
    lastVerified: "2026-05-21",
  },
  {
    id: "open-models-product",
    providerId: "open-models",
    name: "Open-weight models",
    kind: "Model",
    plainEnglish: "Models whose weights can be run outside the original company's hosted app or API.",
    audience: "Developers, researchers, and teams needing more control.",
    useWhen: "You need self-hosting, data residency, customization, or tighter cost control.",
    skipWhen: "You want the simplest path, best managed tooling, or frontier model quality without ops work.",
    developerDetail: "The model may be open, but serving, evals, scaling, monitoring, and safety become your responsibility.",
    relatedNames: ["Llama", "Mistral", "Qwen", "DeepSeek", "Gemma"],
    sourceUrl: "https://cloud.google.com/vertex-ai/generative-ai/docs/models",
    lastVerified: "2026-05-21",
  },
];

export const confusionGuides: ConfusionGuide[] = [
  {
    id: "google-gemini-stack",
    providerId: "google",
    title: "Gemini is not one thing",
    question: "Is Gemini the app, the model, the API, or the paid plan?",
    answer: "It can refer to a model family, the consumer app, developer APIs, and subscription-powered features. The trick is to identify the object type first.",
    choices: [
      { label: "I want to use AI personally", pickWhen: "Start with the Gemini app." },
      { label: "I want to test prompts", pickWhen: "Use Google AI Studio." },
      { label: "I want AI in my app", pickWhen: "Use the Gemini API." },
      { label: "I need cloud governance", pickWhen: "Use Vertex AI." },
    ],
  },
  {
    id: "agent-vs-model",
    providerId: "google",
    title: "Agent names are not model names",
    question: "Is Spark or Antigravity a model?",
    answer: "No. Spark is a personal agent product. Antigravity is a developer coding tool and harness. They can be powered by Gemini models, but they are not model names.",
    choices: [
      { label: "Personal task automation", pickWhen: "Look at Gemini Spark." },
      { label: "Coding in a repo", pickWhen: "Look at Antigravity or other coding agents." },
      { label: "Raw model access", pickWhen: "Look at Gemini API or Vertex AI model endpoints." },
    ],
  },
  {
    id: "chat-app-vs-api",
    providerId: "openai",
    title: "App surface versus API surface",
    question: "Is ChatGPT the same thing as the OpenAI API?",
    answer: "No. ChatGPT is the finished assistant product. The OpenAI API is the programmable interface developers use inside their own products.",
    choices: [
      { label: "Use it directly", pickWhen: "Open ChatGPT." },
      { label: "Build with it", pickWhen: "Use the OpenAI API." },
      { label: "Work in code", pickWhen: "Use Codex-style coding workflows." },
    ],
  },
];

export const models: ModelRecord[] = [
  {
    id: "gpt-55",
    providerId: "openai",
    name: "GPT-5.5",
    modelId: "gpt-5.5",
    status: "stable",
    shortDescription: "Frontier OpenAI model for complex coding, research, and production-grade reasoning.",
    bestFor: ["agentic-coding", "workspace-automation", "multimodal-analysis"],
    capabilities: ["coding", "reasoning", "agents", "tool-calling", "structured-output", "multimodal"],
    pricingTier: "premium",
    latency: "deep",
    contextWindow: "See official model card",
    modalities: ["text", "image"],
    surfaces: ["Responses API", "ChatGPT", "client SDKs"],
    strengths: ["Mature API surface", "strong tool ecosystem", "broad developer documentation"],
    limitations: ["Premium model economics", "exact availability can vary by API tier"],
    sourceUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "gpt-55-mini",
    providerId: "openai",
    name: "GPT-5.5 mini",
    modelId: "gpt-5.5-mini",
    status: "stable",
    shortDescription: "Smaller OpenAI model for everyday production work where latency and cost matter.",
    bestFor: ["cheap-batch", "rag-search", "workspace-automation"],
    capabilities: ["cost-efficiency", "structured-output", "tool-calling", "multimodal"],
    pricingTier: "balanced",
    latency: "balanced",
    contextWindow: "See official model card",
    modalities: ["text", "image"],
    surfaces: ["Responses API", "ChatGPT", "client SDKs"],
    strengths: ["Good default for high-volume tasks", "same platform primitives as larger GPT models"],
    limitations: ["Less headroom for frontier reasoning than GPT-5.5"],
    sourceUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "gpt-realtime",
    providerId: "openai",
    name: "GPT Realtime",
    modelId: "gpt-realtime",
    status: "stable",
    shortDescription: "Realtime OpenAI family for speech-first applications and live user interaction.",
    bestFor: ["realtime-voice", "workspace-automation"],
    capabilities: ["realtime", "multimodal", "tool-calling", "agents"],
    pricingTier: "balanced",
    latency: "instant",
    contextWindow: "Session-dependent",
    modalities: ["audio", "text"],
    surfaces: ["Realtime API", "client SDKs"],
    strengths: ["Low-latency interaction", "speech-native product surface", "tool integration"],
    limitations: ["Needs careful session design and interruption handling"],
    sourceUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-05-21",
  },
  {
    id: "claude-opus-47",
    providerId: "anthropic",
    name: "Claude Opus 4.7",
    modelId: "claude-opus-4-7",
    status: "stable",
    shortDescription: "Anthropic flagship for difficult planning, agentic coding, and high-stakes analysis.",
    bestFor: ["agentic-coding", "multimodal-analysis", "workspace-automation"],
    capabilities: ["coding", "reasoning", "agents", "tool-calling", "structured-output", "multimodal", "long-context"],
    pricingTier: "premium",
    latency: "deep",
    contextWindow: "1M tokens",
    modalities: ["text", "image"],
    surfaces: ["Claude API", "Claude Code", "Bedrock", "Vertex AI"],
    strengths: ["Excellent instruction discipline", "strong coding-agent fit", "long-context workflows"],
    limitations: ["Premium latency and cost profile", "availability can depend on platform surface"],
    sourceUrl: "https://platform.claude.com/docs/claude/docs/models-overview",
    lastVerified: "2026-05-21",
  },
  {
    id: "claude-sonnet-46",
    providerId: "anthropic",
    name: "Claude Sonnet 4.6",
    modelId: "claude-sonnet-4-6",
    status: "stable",
    shortDescription: "Balanced Claude model for coding, agents, writing, and production reasoning.",
    bestFor: ["agentic-coding", "rag-search", "workspace-automation"],
    capabilities: ["coding", "reasoning", "agents", "tool-calling", "structured-output", "long-context"],
    pricingTier: "balanced",
    latency: "balanced",
    contextWindow: "1M tokens",
    modalities: ["text", "image"],
    surfaces: ["Claude API", "Claude Code", "Bedrock", "Vertex AI"],
    strengths: ["Strong balance of quality and cost", "good agentic coding default", "clear response style"],
    limitations: ["Less frontier headroom than Opus for very hard tasks"],
    sourceUrl: "https://platform.claude.com/docs/claude/docs/models-overview",
    lastVerified: "2026-05-21",
  },
  {
    id: "claude-haiku-45",
    providerId: "anthropic",
    name: "Claude Haiku 4.5",
    modelId: "claude-haiku-4-5",
    status: "stable",
    shortDescription: "Fast Claude model for routed sub-tasks, extraction, and latency-sensitive agent steps.",
    bestFor: ["cheap-batch", "rag-search"],
    capabilities: ["cost-efficiency", "structured-output", "tool-calling"],
    pricingTier: "lowest",
    latency: "instant",
    contextWindow: "200K class",
    modalities: ["text", "image"],
    surfaces: ["Claude API", "Bedrock", "Vertex AI"],
    strengths: ["Fast and economical", "useful as a sub-agent", "strong extraction fit"],
    limitations: ["Not the first pick for complex planning"],
    sourceUrl: "https://support.claude.com/en/articles/11940350-claude-code-model-configuration",
    lastVerified: "2026-05-21",
  },
  {
    id: "gemini-31-pro",
    providerId: "google",
    name: "Gemini 3.1 Pro",
    modelId: "gemini-3.1-pro-preview",
    status: "preview",
    shortDescription: "Google reasoning model for complex multimodal work, coding, and large-context analysis.",
    bestFor: ["multimodal-analysis", "agentic-coding", "workspace-automation"],
    capabilities: ["coding", "reasoning", "agents", "tool-calling", "structured-output", "multimodal", "long-context"],
    pricingTier: "premium",
    latency: "deep",
    contextWindow: "1M tokens",
    modalities: ["text", "code", "image", "audio", "video", "pdf"],
    surfaces: ["Vertex AI", "Gemini API", "Google AI Studio"],
    strengths: ["Huge context", "rich multimodal inputs", "Google Cloud and grounding integration"],
    limitations: ["Preview status changes deployment expectations", "Google Cloud setup can add friction"],
    sourceUrl: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-pro",
    lastVerified: "2026-05-21",
  },
  {
    id: "gemini-25-flash-lite",
    providerId: "google",
    name: "Gemini 3.1 Flash-Lite",
    modelId: "gemini-3.1-flash-lite",
    status: "stable",
    shortDescription: "Google cost-efficiency model for high-throughput extraction and simple multimodal tasks.",
    bestFor: ["cheap-batch", "rag-search"],
    capabilities: ["cost-efficiency", "structured-output", "multimodal", "long-context"],
    pricingTier: "lowest",
    latency: "instant",
    contextWindow: "1M tokens",
    modalities: ["text", "image", "audio", "video"],
    surfaces: ["Vertex AI", "Gemini API", "Google AI Studio"],
    strengths: ["Very attractive scale economics", "long context for the price class", "good throughput fit"],
    limitations: ["Not ideal for hard reasoning or autonomous coding"],
    sourceUrl: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-lite",
    lastVerified: "2026-05-21",
  },
  {
    id: "grok-43",
    providerId: "xai",
    name: "Grok 4.3",
    modelId: "grok-4.3",
    status: "stable",
    shortDescription: "xAI flagship with long context, tool calling, structured output, and configurable reasoning.",
    bestFor: ["agentic-coding", "rag-search", "workspace-automation"],
    capabilities: ["coding", "reasoning", "agents", "tool-calling", "structured-output", "multimodal", "long-context"],
    pricingTier: "balanced",
    latency: "balanced",
    contextWindow: "1M tokens",
    modalities: ["text", "image"],
    surfaces: ["xAI API", "Grok"],
    strengths: ["Long context", "competitive token pricing", "configurable reasoning"],
    limitations: ["Smaller developer ecosystem than OpenAI, Google, or Anthropic"],
    sourceUrl: "https://docs.x.ai/docs/models/grok-4-fast-non-reasoning",
    lastVerified: "2026-05-21",
  },
  {
    id: "grok-build",
    providerId: "xai",
    name: "Grok Build",
    modelId: "grok-build",
    status: "product",
    shortDescription: "Coding-agent product for interactive, headless, and ACP-driven repo work.",
    bestFor: ["agentic-coding", "workspace-automation"],
    capabilities: ["coding", "agents", "tool-calling"],
    pricingTier: "balanced",
    latency: "balanced",
    contextWindow: "Model-dependent",
    modalities: ["text", "code"],
    surfaces: ["CLI", "TUI", "headless scripts", "ACP"],
    strengths: ["Agent workflow primitives", "headless automation mode", "custom model configuration"],
    limitations: ["Product workflow, not a standalone foundation model"],
    sourceUrl: "https://docs.x.ai/build/overview",
    lastVerified: "2026-05-21",
  },
  {
    id: "gemma-3",
    providerId: "open-models",
    name: "Gemma 3",
    modelId: "gemma-3",
    status: "stable",
    shortDescription: "Google open model family for controllable deployment and lower-friction experimentation.",
    bestFor: ["cheap-batch", "rag-search"],
    capabilities: ["cost-efficiency", "self-hosting", "multimodal"],
    pricingTier: "lowest",
    latency: "balanced",
    contextWindow: "128K class",
    modalities: ["text", "image"],
    surfaces: ["self-host", "Vertex AI Model Garden", "third-party hosts"],
    strengths: ["Open-weight flexibility", "deployment control", "good fit for constrained environments"],
    limitations: ["Usually needs more ops work and eval discipline than hosted frontier APIs"],
    sourceUrl: "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models",
    lastVerified: "2026-05-21",
  },
];

export const changelog: ChangelogEntry[] = [
  {
    id: "gpt-55-api",
    date: "2026-05-07",
    providerId: "openai",
    title: "GPT-5.5 expands developer availability",
    impact: "Re-check hard coding, research, and cyber-defense workflows that were pinned to older GPT or reasoning models.",
    sourceUrl: "https://developers.openai.com/api/docs/models",
  },
  {
    id: "opus-47",
    date: "2026-04-16",
    providerId: "anthropic",
    title: "Claude Opus 4.7 enters the frontier coding conversation",
    impact: "Teams using Claude Code should compare Opus for hard planning steps and Sonnet for day-to-day edit loops.",
    sourceUrl: "https://platform.claude.com/docs/claude/docs/models-overview",
  },
  {
    id: "gemini-31-pro",
    date: "2025-11-18",
    providerId: "google",
    title: "Gemini 3.1 Pro preview supersedes Gemini 3 Pro",
    impact: "Large repo, PDF, audio, and video analysis should be tested against Google Cloud constraints and preview status.",
    sourceUrl: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-pro",
  },
  {
    id: "grok-build",
    date: "2026-04-12",
    providerId: "xai",
    title: "Grok Build documents interactive and headless coding-agent flows",
    impact: "Useful for developers comparing code-agent product ergonomics, not just foundation model quality.",
    sourceUrl: "https://docs.x.ai/build/overview",
  },
];

export const glossary: GlossaryTerm[] = [
  {
    term: "Context window",
    plainEnglish: "How much input a model can consider at once.",
    developerRead: "Large context helps with repos and document sets, but it does not replace retrieval, chunking, or evals.",
  },
  {
    term: "Tool calling",
    plainEnglish: "The model can ask your app to run a function with structured arguments.",
    developerRead: "This is the bridge between chat and real software behavior. Validate every argument server-side.",
  },
  {
    term: "Structured output",
    plainEnglish: "The model returns JSON or another constrained shape.",
    developerRead: "Use it for extraction, routing, UI state, and pipelines. Still handle refusals and schema misses.",
  },
  {
    term: "Agent",
    plainEnglish: "A loop that lets a model plan, call tools, observe results, and continue.",
    developerRead: "Agents need budgets, permissions, traces, and stop conditions. The model is only one component.",
  },
  {
    term: "Reasoning level",
    plainEnglish: "A knob that trades latency and cost for deeper problem-solving.",
    developerRead: "Expose it only where users understand the cost. Default ordinary paths to cheaper settings.",
  },
  {
    term: "Open weights",
    plainEnglish: "Model weights you can run or host outside the original provider's API.",
    developerRead: "Useful for control and data policy, but you inherit deployment, serving, monitoring, and quality work.",
  },
];

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
