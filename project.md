# AI Compass: Developer AI Model Navigator

## Product Thesis

Developers do not need another generic AI directory. They need a decision tool that answers:

> What model, agent, or provider should I use for this build, and what tradeoffs am I accepting?

AI Compass turns a fast-moving AI market into a clean, source-backed workflow for choosing models and stacks.

## Core User Problem

The 2026 AI landscape changes constantly. Developers have to compare:

- Model quality, cost, latency, context, multimodal support, structured output, tool calling, and realtime APIs.
- Product surfaces such as ChatGPT, Claude Code, Gemini Agent Platform, Vertex AI, Grok Build, and open-weight deployments.
- Fast-moving release notes, preview statuses, deprecations, and provider-specific constraints.

The current options are usually stale tables, hype-heavy blog posts, or vendor docs that are accurate but hard to compare.

## V1 Goal

Build a beautiful single-page web app that starts simple enough for non-developers, then gives developers the deeper model and stack guidance they need. It should feel calm, fast, and useful within the first minute.

The first screen must focus on the decision path:

1. What kind of thing is this name: app, model, API, platform, subscription, agent, or developer tool?
2. Who is it for?
3. When should I use it?
4. When should I ignore it?
5. If I am building with AI, which model or provider fits my use case?

## V1 Experience

### 1. AI Name Translator

- Plain-English provider tabs for Google, OpenAI, Anthropic, xAI, and open models.
- Simple rows that explain confusing names like Gemini app, Gemini Spark, Google AI Studio, Gemini API, Vertex AI, Google AI Pro / Ultra, Flow, NotebookLM, Antigravity, ChatGPT, Codex, Claude, Claude Code, Grok, and open-weight models.
- Each row identifies the object type, audience, best use case, skip condition, related names, and source.

### 2. Confusion Resolver

- Direct explanations for common naming traps:
  - Gemini is not one thing.
  - Agent names are not model names.
  - App surfaces and API surfaces are different.
- Designed for people who are confused by overlapping product names, including non-developers.

### 3. Developer Recommender

- Use-case router for agentic coding, RAG/search, realtime voice, cheap batch work, workspace automation, and multimodal analysis.
- Budget, latency, ecosystem, and self-hosting controls.
- Ranked model recommendations with confidence scores and plain reasons.

### 4. Source-Backed Catalog

- Providers, models, products, and open-model paths.
- Every entry includes source URL, last verified date, strengths, limitations, pricing tier, latency posture, context, modalities, and surfaces.
- The catalog starts repo-backed for speed, but uses shapes that can later move to Postgres.

### 5. Change Intelligence

- Timeline of important model and platform changes.
- Each entry explains who should care and links to the source.

### 6. Glossary and Stack Brief

- Developer-focused glossary for terms that block decisions.
- Stack brief export that can be copied into planning docs or tickets.

## Data Strategy

V1 uses typed repo data rather than a database:

- Fast to build and deploy.
- Easy to review through Git changes.
- Excellent for static rendering and SEO.
- No auth, moderation, migrations, or admin UI needed on day one.

The data layer should be isolated behind helper functions such as `getRecommendations`, `getProvider`, and `getModelsByProvider`. A later database-backed version can keep the UI mostly unchanged.

Future database-backed version would need:

- Postgres or equivalent hosted database.
- Tables for providers, models, products, sources, changelog entries, glossary terms, use cases, and recommendation rules.
- Admin authentication, draft/review/publish states, audit logs, backups, and source-change monitoring.
- Cached reads through ISR or API routes.

## Technical Direction

- Next.js App Router.
- React Server Components by default.
- One isolated client component for quiz state, filtering, theme switching, and copy actions.
- Tailwind CSS for design system implementation.
- Vercel deployment.
- Later: scheduled source verification scripts, admin UI, saved stacks, public submissions, and image export.

## Quality Bar

- Developer-first clarity beats directory breadth.
- No unsourced catalog claims.
- No generic SaaS landing page as the primary experience.
- Fast, responsive, keyboard-friendly, and accessible.
- Clean visual system with restrained motion and precise interaction feedback.
