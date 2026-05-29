#!/usr/bin/env node

import { checkUrl, loadCatalog } from "./catalog-utils.mjs";

const providerIds = new Set(["openai", "anthropic", "google", "xai", "open-models"]);
const productKinds = new Set(["App", "Model", "API", "Platform", "Agent", "Developer tool", "Subscription"]);
const useCases = new Set([
  "agentic-coding",
  "rag-search",
  "realtime-voice",
  "cheap-batch",
  "workspace-automation",
  "multimodal-analysis",
]);
const budgets = new Set(["lowest", "balanced", "premium"]);
const latencies = new Set(["instant", "balanced", "deep"]);
const capabilities = new Set([
  "coding",
  "reasoning",
  "agents",
  "tool-calling",
  "structured-output",
  "multimodal",
  "realtime",
  "long-context",
  "cost-efficiency",
  "self-hosting",
]);
const statuses = new Set(["stable", "preview", "product"]);

const maxVerificationAgeDays = Number(process.env.CATALOG_MAX_VERIFICATION_AGE_DAYS ?? 45);
const validateUrls = process.env.CATALOG_VALIDATE_URLS !== "0" && process.env.CATALOG_VALIDATE_OFFLINE !== "1";
const todayMs = Date.now();
const errors = [];
const warnings = [];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireArray(value, path) {
  if (!Array.isArray(value)) errors.push(`${path} must be an array`);
}

function requireObject(value, path) {
  if (!isObject(value)) errors.push(`${path} must be an object`);
}

function requireString(value, path) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${path} must be a non-empty string`);
}

function requireStringArray(value, path) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push(`${path} must be a non-empty string array`);
  }
}

function requireOneOf(value, allowed, path) {
  if (!allowed.has(value)) errors.push(`${path} has invalid value "${value}"`);
}

function requireDate(value, path, options = { checkFreshness: true }) {
  requireString(value, path);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${path} must use YYYY-MM-DD`);
    return;
  }

  const dateMs = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(dateMs)) {
    errors.push(`${path} is not a valid date`);
    return;
  }

  const ageDays = Math.floor((todayMs - dateMs) / 86_400_000);
  if (options.checkFreshness && ageDays > maxVerificationAgeDays) {
    errors.push(`${path} is ${ageDays} days old; max is ${maxVerificationAgeDays}`);
  }
}

function requireHttpsUrl(value, path) {
  requireString(value, path);
  if (typeof value !== "string" || !/^https:\/\/\S+$/.test(value)) {
    errors.push(`${path} must be an HTTPS URL`);
  }
}

function checkDuplicateIds(records, path) {
  const seen = new Set();
  for (const record of records) {
    if (!record?.id) continue;
    if (seen.has(record.id)) errors.push(`${path} has duplicate id "${record.id}"`);
    seen.add(record.id);
  }
}

function validateProvider(provider, index) {
  const path = `providers[${index}]`;
  requireObject(provider, path);
  requireOneOf(provider.id, providerIds, `${path}.id`);
  requireString(provider.name, `${path}.name`);
  requireString(provider.accent, `${path}.accent`);
  requireString(provider.summary, `${path}.summary`);
  requireString(provider.developerAngle, `${path}.developerAngle`);
  requireHttpsUrl(provider.sourceUrl, `${path}.sourceUrl`);
  requireDate(provider.lastVerified, `${path}.lastVerified`);
}

function validateProduct(product, index) {
  const path = `products[${index}]`;
  requireObject(product, path);
  requireString(product.id, `${path}.id`);
  requireOneOf(product.providerId, providerIds, `${path}.providerId`);
  requireString(product.name, `${path}.name`);
  requireOneOf(product.kind, productKinds, `${path}.kind`);
  requireString(product.plainEnglish, `${path}.plainEnglish`);
  requireString(product.audience, `${path}.audience`);
  requireString(product.useWhen, `${path}.useWhen`);
  requireString(product.skipWhen, `${path}.skipWhen`);
  requireString(product.developerDetail, `${path}.developerDetail`);
  requireStringArray(product.relatedNames, `${path}.relatedNames`);
  requireHttpsUrl(product.sourceUrl, `${path}.sourceUrl`);
  requireDate(product.lastVerified, `${path}.lastVerified`);
}

function validateModel(model, index) {
  const path = `models[${index}]`;
  requireObject(model, path);
  requireString(model.id, `${path}.id`);
  requireOneOf(model.providerId, providerIds, `${path}.providerId`);
  requireString(model.name, `${path}.name`);
  requireString(model.modelId, `${path}.modelId`);
  requireOneOf(model.status, statuses, `${path}.status`);
  requireString(model.shortDescription, `${path}.shortDescription`);
  requireStringArray(model.bestFor, `${path}.bestFor`);
  for (const useCase of model.bestFor ?? []) requireOneOf(useCase, useCases, `${path}.bestFor`);
  requireStringArray(model.capabilities, `${path}.capabilities`);
  for (const capability of model.capabilities ?? []) requireOneOf(capability, capabilities, `${path}.capabilities`);
  requireOneOf(model.pricingTier, budgets, `${path}.pricingTier`);
  requireOneOf(model.latency, latencies, `${path}.latency`);
  requireString(model.contextWindow, `${path}.contextWindow`);
  requireStringArray(model.modalities, `${path}.modalities`);
  requireStringArray(model.surfaces, `${path}.surfaces`);
  requireStringArray(model.strengths, `${path}.strengths`);
  requireStringArray(model.limitations, `${path}.limitations`);
  requireHttpsUrl(model.sourceUrl, `${path}.sourceUrl`);
  requireDate(model.lastVerified, `${path}.lastVerified`);
}

function validateChangelog(entry, index) {
  const path = `changelog[${index}]`;
  requireObject(entry, path);
  requireString(entry.id, `${path}.id`);
  requireDate(entry.date, `${path}.date`, { checkFreshness: false });
  requireOneOf(entry.providerId, providerIds, `${path}.providerId`);
  requireString(entry.title, `${path}.title`);
  requireString(entry.impact, `${path}.impact`);
  requireHttpsUrl(entry.sourceUrl, `${path}.sourceUrl`);
}

function validateConfusion(guide, index) {
  const path = `confusions[${index}]`;
  requireObject(guide, path);
  requireString(guide.id, `${path}.id`);
  requireString(guide.title, `${path}.title`);
  requireOneOf(guide.providerId, providerIds, `${path}.providerId`);
  requireString(guide.question, `${path}.question`);
  requireString(guide.answer, `${path}.answer`);
  requireArray(guide.choices, `${path}.choices`);
  for (const [choiceIndex, choice] of (guide.choices ?? []).entries()) {
    requireString(choice.label, `${path}.choices[${choiceIndex}].label`);
    requireString(choice.pickWhen, `${path}.choices[${choiceIndex}].pickWhen`);
  }
}

function validateGlossary(term, index) {
  const path = `glossary[${index}]`;
  requireObject(term, path);
  requireString(term.term, `${path}.term`);
  requireString(term.plainEnglish, `${path}.plainEnglish`);
  requireString(term.developerRead, `${path}.developerRead`);
}

async function validateSourceUrls(catalog) {
  if (!validateUrls) {
    warnings.push("URL validation skipped by CATALOG_VALIDATE_URLS=0 or CATALOG_VALIDATE_OFFLINE=1");
    return;
  }

  const seen = new Map();
  const collections = [
    ["providers", catalog.providers],
    ["products", catalog.products],
    ["models", catalog.models],
    ["changelog", catalog.changelog],
  ];

  for (const [collectionName, records] of collections) {
    for (const [index, record] of records.entries()) {
      if (!record.sourceUrl || seen.has(record.sourceUrl)) continue;
      const result = await checkUrl(record.sourceUrl);
      seen.set(record.sourceUrl, result);
      if (!result.ok) {
        errors.push(`${collectionName}[${index}].sourceUrl is not reachable: ${record.sourceUrl} (${result.status ?? result.error})`);
      }
    }
  }
}

async function main() {
  const catalog = await loadCatalog();

  for (const [key, value] of Object.entries(catalog)) requireArray(value, key);
  checkDuplicateIds(catalog.providers, "providers");
  checkDuplicateIds(catalog.products, "products");
  checkDuplicateIds(catalog.models, "models");
  checkDuplicateIds(catalog.changelog, "changelog");
  checkDuplicateIds(catalog.confusions, "confusions");

  catalog.providers.forEach(validateProvider);
  catalog.products.forEach(validateProduct);
  catalog.models.forEach(validateModel);
  catalog.changelog.forEach(validateChangelog);
  catalog.confusions.forEach(validateConfusion);
  catalog.glossary.forEach(validateGlossary);

  await validateSourceUrls(catalog);

  for (const warning of warnings) console.warn(`Warning: ${warning}`);

  if (errors.length) {
    console.error(`Catalog validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("Catalog validation passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
