# Contributing

AI Cheatsheet is a small source-backed reference app. Contributions should keep the catalog accurate, plain-English, and easy to review.

## Catalog Updates

Catalog files live in `data/catalog/`. Each provider, product, and model claim should include an official source URL and a current `lastVerified` date.

Use the automation first:

```bash
npm run catalog:update
npm run catalog:validate
```

The updater writes `reports/catalog-diff.md` so reviewers can see what changed and what still needs human judgment.

## Review Standard

- Prefer official provider docs, release notes, or APIs.
- Keep product explanations short and concrete.
- Do not add unsourced benchmark claims.
- Do not let automation write recommendation copy for new models without review.
- Run `npm run catalog:validate`, `npm run typecheck`, and `npm run build` before opening a PR.
