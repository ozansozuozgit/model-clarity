# Catalog Automation Design

## Goal

Keep the AI Cheatsheet current without letting automated fetches rewrite curated product guidance. The catalog should update from official provider sources, show reviewers exactly what changed, and keep the app buildable from repo-backed static data.

## Approach

Catalog records live in `data/catalog/*.json`, while `src/lib/catalog.ts` owns TypeScript types, constants, and recommendation logic. This preserves the current app import path and makes the data layer easy to diff in pull requests.

`npm run catalog:update` fetches official provider model lists from OpenAI, Anthropic, Google Gemini, and xAI when API keys are available. It also has a public Anthropic docs fallback so the open-source scheduled job can detect current Claude aliases without private secrets. It reconciles known local model IDs, promotes narrow same-family point releases, refreshes safe machine-readable fields, records missing local models, and lists new official model candidates for human review. It does not generate new plain-English descriptions, use-case recommendations, strengths, or limitations.

`npm run catalog:validate` enforces required fields, valid enum values, duplicate ID checks, provider relationships, source URL shape, reachable source URLs, and `lastVerified` freshness.

## Automation

The scheduled GitHub Action runs weekly and can also be started manually. It installs dependencies, runs the updater, validates the catalog, typechecks, builds, and opens or updates a `codex/catalog-auto-update` pull request when tracked catalog data changes.

Provider API keys are optional GitHub repository secrets that improve coverage:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `XAI_API_KEY`

## Review Model

Machine-readable facts can move automatically when official APIs confirm them. Editorial decisions stay reviewable in source control. The generated `reports/catalog-diff.md` is the review receipt: it shows source fetch status, changed fields, local models missing from official lists, new model candidates, and warnings.
