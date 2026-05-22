# AI Compass V1 Design

## Product Focus

AI Compass is a hybrid AI clarity tool. It first answers: "What is this confusing AI name?" Then, for builders, it answers: "What AI model or tool should I use for this build, and why?"

The first version prioritizes orientation before recommendation. It combines a plain-English product translator, confusion resolver, guided recommender, source-backed model catalog, change intelligence feed, glossary, and practical stack export.

## Data Strategy

V1 uses repo-backed typed data with database-ready shapes:

- Providers, plain-English product entries, confusion guides, models, changelog entries, glossary terms, and recommendation use cases are modeled as structured records.
- Every model claim includes source URLs, `lastVerified`, pricing tier, context window, modalities, strengths, limitations, and best-fit developer jobs.
- UI code reads through data helper functions, not raw embedded arrays, so a later Postgres/Supabase source can replace the file layer without rewriting the interface.

## Experience

The first screen behaves like a translator: each confusing AI name is labeled as an app, model, API, platform, subscription, agent, or developer tool.

Supporting surfaces let developers inspect the why:

- Provider tabs and kind filters for scanning names quickly.
- Expandable rows for when to use, when to skip, related names, and source links.
- Confusion cards for common naming traps.
- Changelog for "what changed and who should care."
- Glossary for developer terms that create confusion.
- Stack builder output that can be copied into planning notes.

## Technical Plan

- Next.js App Router with React Server Components by default.
- One isolated client component for interactive filtering, quiz state, theme switching, and stack copy.
- Tailwind CSS v4 for styling.
- Phosphor icons for precise UI controls.
- Static deployment on Vercel, with later support for ISR or cached database reads if the content source moves to Postgres.

## Quality Bar

- Clean, quiet, developer-oriented UI.
- No unsourced catalog claims in the data model.
- Fast initial load and minimal client state.
- Responsive layouts that keep the recommender usable on mobile.
- Accessible labels, focus states, and keyboard-friendly controls.
