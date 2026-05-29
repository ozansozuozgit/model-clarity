#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  arraysEqual,
  catalogFiles,
  checkUrl,
  fetchJson,
  fetchText,
  formatTokenWindow,
  loadCatalog,
  normalizeModelId,
  reportsDir,
  todayIso,
  uniqueSorted,
  writeCatalog,
} from "./catalog-utils.mjs";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const refreshVerified = args.has("--refresh-verified") || process.env.CATALOG_REFRESH_VERIFIED === "1";
const requireCredentials = args.has("--require-credentials") || process.env.CATALOG_REQUIRE_CREDENTIALS === "1";
const today = todayIso();

const sourceDocs = {
  openai: "https://platform.openai.com/docs/api-reference/models",
  anthropic: "https://platform.claude.com/docs/en/about-claude/models/overview",
  google: "https://ai.google.dev/api/rest/generativelanguage/models/list",
  xai: "https://docs.x.ai/developers/rest-api-reference/inference/models",
};

const modelFamilyPatterns = {
  anthropic: /^claude-(opus|sonnet|haiku)-(\d+)-(\d{1,2})$/,
};

const sourceState = [];
const changes = [];
const warnings = [];
const missingLocalModels = [];
const candidateModels = [];

function env(name) {
  return process.env[name]?.trim();
}

function missingCredential(providerId, names) {
  const label = names.join(" or ");
  const message = `${providerId}: skipped because ${label} is not set`;
  if (requireCredentials) throw new Error(message);
  sourceState.push({ providerId, status: "skipped", detail: `Missing ${label}` });
  return null;
}

async function fetchOpenAIModels() {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) return missingCredential("openai", ["OPENAI_API_KEY"]);

  const json = await fetchJson("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return {
    providerId: "openai",
    sourceName: "OpenAI /v1/models",
    sourceUrl: sourceDocs.openai,
    models: (json.data ?? []).map((model) => ({
      id: normalizeModelId(model.id),
      aliases: [],
      created: model.created,
      sourceUrl: sourceDocs.openai,
    })),
  };
}

async function fetchAnthropicModels() {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) return fetchAnthropicPublicModels();

  const headers = {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  const models = [];
  let afterId = "";

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://api.anthropic.com/v1/models");
    url.searchParams.set("limit", "1000");
    if (afterId) url.searchParams.set("after_id", afterId);
    const json = await fetchJson(url.toString(), { headers });
    models.push(
      ...(json.data ?? []).map((model) => ({
        id: normalizeModelId(model.id),
        displayName: model.display_name,
        aliases: [],
        created: model.created_at,
        sourceUrl: sourceDocs.anthropic,
      })),
    );
    if (!json.has_more || !json.last_id) break;
    afterId = json.last_id;
  }

  return {
    providerId: "anthropic",
    sourceName: "Anthropic /v1/models",
    sourceUrl: sourceDocs.anthropic,
    models,
  };
}

async function fetchAnthropicPublicModels() {
  const text = await fetchText(sourceDocs.anthropic);
  const ids = [...text.matchAll(/\bclaude-(opus|sonnet|haiku)-\d+-\d{1,2}\b/g)].map((match) => match[0]);
  const models = uniqueSorted(ids).map((id) => ({
    id,
    displayName: humanizeAnthropicModelId(id),
    aliases: [],
    sourceUrl: sourceDocs.anthropic,
  }));

  if (!models.length) {
    throw new Error("anthropic: public model overview did not expose any Claude model IDs");
  }

  return {
    providerId: "anthropic",
    sourceName: "Anthropic public models overview (no API key)",
    sourceUrl: sourceDocs.anthropic,
    models,
  };
}

async function fetchGoogleModels() {
  const apiKey = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");
  if (!apiKey) return missingCredential("google", ["GEMINI_API_KEY", "GOOGLE_API_KEY"]);

  const models = [];
  let pageToken = "";

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("pageSize", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const json = await fetchJson(url.toString());
    models.push(
      ...(json.models ?? []).map((model) => {
        const id = normalizeModelId(model.name);
        const modalities = inferGoogleModalities(model.supportedGenerationMethods ?? []);
        return {
          id,
          aliases: [],
          displayName: model.displayName,
          contextWindow: formatTokenWindow(Number(model.inputTokenLimit)),
          outputWindow: formatTokenWindow(Number(model.outputTokenLimit)),
          modalities,
          sourceUrl: sourceDocs.google,
        };
      }),
    );
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }

  return {
    providerId: "google",
    sourceName: "Gemini models.list",
    sourceUrl: sourceDocs.google,
    models,
  };
}

async function fetchXaiModels() {
  const apiKey = env("XAI_API_KEY");
  if (!apiKey) return missingCredential("xai", ["XAI_API_KEY"]);

  let json;
  let sourceName = "xAI /v1/language-models";
  try {
    json = await fetchJson("https://api.x.ai/v1/language-models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (error) {
    warnings.push(`xai: /v1/language-models failed, falling back to /v1/models: ${error.message}`);
    sourceName = "xAI /v1/models";
    json = await fetchJson("https://api.x.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  const rawModels = json.models ?? json.data ?? [];
  return {
    providerId: "xai",
    sourceName,
    sourceUrl: sourceDocs.xai,
    models: rawModels.map((model) => ({
      id: normalizeModelId(model.id ?? model.name),
      aliases: (model.aliases ?? []).map(normalizeModelId),
      created: model.created,
      contextWindow: formatTokenWindow(Number(model.context_window ?? model.contextWindow)),
      modalities: uniqueSorted([...(model.input_modalities ?? []), ...(model.output_modalities ?? [])]),
      sourceUrl: sourceDocs.xai,
    })),
  };
}

function inferGoogleModalities(methods) {
  const values = new Set(["text"]);
  for (const method of methods) {
    const normalized = String(method).toLowerCase();
    if (normalized.includes("bidi") || normalized.includes("stream")) values.add("audio");
    if (normalized.includes("embed")) values.add("text");
    if (normalized.includes("generate")) values.add("text");
  }
  return [...values];
}

function humanizeAnthropicModelId(modelId) {
  const match = modelId.match(modelFamilyPatterns.anthropic);
  if (!match) return modelId;
  const [, family, major, minor] = match;
  return `Claude ${family[0].toUpperCase()}${family.slice(1)} ${major}.${minor}`;
}

function parseVersionedFamily(providerId, modelId) {
  const pattern = modelFamilyPatterns[providerId];
  if (!pattern) return null;
  const match = normalizeModelId(modelId).match(pattern);
  if (!match) return null;
  return {
    family: match[1],
    major: Number(match[2]),
    minor: Number(match[3]),
  };
}

function compareFamilyVersions(a, b) {
  return a.major - b.major || a.minor - b.minor;
}

function findNewerFamilyModel(providerId, localModelId, source) {
  const local = parseVersionedFamily(providerId, localModelId);
  if (!local) return null;

  const candidates = source.models
    .map((model) => ({ model, parsed: parseVersionedFamily(providerId, model.id) }))
    .filter(({ parsed }) => parsed && parsed.family === local.family)
    .sort((a, b) => compareFamilyVersions(b.parsed, a.parsed));

  const latest = candidates[0];
  if (!latest || compareFamilyVersions(latest.parsed, local) <= 0) return null;
  return latest.model;
}

function catalogIdForModelId(providerId, modelId) {
  const parsed = parseVersionedFamily(providerId, modelId);
  if (providerId === "anthropic" && parsed) {
    return `claude-${parsed.family}-${parsed.major}${parsed.minor}`;
  }

  return normalizeModelId(modelId).replaceAll(".", "-");
}

function isOlderThanTrackedFamily(providerId, officialModelId, localModels) {
  const official = parseVersionedFamily(providerId, officialModelId);
  if (!official) return false;

  return localModels.some((localModel) => {
    if (localModel.providerId !== providerId) return false;
    const local = parseVersionedFamily(providerId, localModel.modelId);
    if (!local || local.family !== official.family) return false;
    return compareFamilyVersions(local, official) >= 0;
  });
}

async function fetchOfficialSources() {
  const fetchers = [fetchOpenAIModels, fetchAnthropicModels, fetchGoogleModels, fetchXaiModels];
  const sources = [];

  for (const fetcher of fetchers) {
    try {
      const source = await fetcher();
      if (!source) continue;
      sourceState.push({
        providerId: source.providerId,
        status: "ok",
        detail: `${source.models.length} models from ${source.sourceName}`,
      });
      sources.push(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (requireCredentials) throw error;
      sourceState.push({ providerId: fetcher.name.replace(/^fetch|Models$/g, "").toLowerCase(), status: "error", detail: message });
      warnings.push(message);
    }
  }

  return sources;
}

function buildSourceIndex(sources) {
  const byProvider = new Map();

  for (const source of sources) {
    const idToModel = new Map();
    const aliasToModel = new Map();
    for (const model of source.models) {
      if (model.id) idToModel.set(model.id, model);
      for (const alias of model.aliases ?? []) aliasToModel.set(alias, model);
    }
    byProvider.set(source.providerId, { ...source, idToModel, aliasToModel });
  }

  return byProvider;
}

function recordChange(pathLabel, before, after) {
  if (before === after) return false;
  changes.push(`${pathLabel}: ${before || "(empty)"} -> ${after || "(empty)"}`);
  return true;
}

function reconcileModels(catalog, sourceIndex) {
  const matchedByProvider = new Map();

  for (const model of catalog.models) {
    const source = sourceIndex.get(model.providerId);
    if (!source) continue;

    const localModelId = normalizeModelId(model.modelId);
    const originalCatalogId = model.id;
    const promoted = findNewerFamilyModel(model.providerId, localModelId, source);
    const official = promoted ?? source.idToModel.get(localModelId) ?? source.aliasToModel.get(localModelId);

    if (!official) {
      if (model.status !== "product") {
        missingLocalModels.push(`${model.name} (${model.modelId}) was not found in ${source.sourceName}`);
      }
      continue;
    }

    if (!matchedByProvider.has(model.providerId)) matchedByProvider.set(model.providerId, new Set());
    matchedByProvider.get(model.providerId).add(official.id);
    matchedByProvider.get(model.providerId).add(localModelId);

    if (promoted) {
      const nextId = catalogIdForModelId(model.providerId, official.id);
      const nextName = official.displayName ?? humanizeAnthropicModelId(official.id);
      if (recordChange(`models.${originalCatalogId}.id`, model.id, nextId)) model.id = nextId;
      if (recordChange(`models.${originalCatalogId}.name`, model.name, nextName)) model.name = nextName;
      if (recordChange(`models.${originalCatalogId}.modelId`, model.modelId, official.id)) model.modelId = official.id;
      if (recordChange(`models.${originalCatalogId}.sourceUrl`, model.sourceUrl, official.sourceUrl)) model.sourceUrl = official.sourceUrl;
    }

    if (refreshVerified && recordChange(`models.${model.id}.lastVerified`, model.lastVerified, today)) {
      model.lastVerified = today;
    }

    if (official.contextWindow && recordChange(`models.${model.id}.contextWindow`, model.contextWindow, official.contextWindow)) {
      model.contextWindow = official.contextWindow;
    }

    if (official.modalities?.length) {
      const nextModalities = uniqueSorted([...model.modalities, ...official.modalities]);
      if (!arraysEqual(model.modalities, nextModalities)) {
        changes.push(`models.${model.id}.modalities: ${model.modalities.join(", ")} -> ${nextModalities.join(", ")}`);
        model.modalities = nextModalities;
      }
    }
  }

  for (const source of sourceIndex.values()) {
    const matched = matchedByProvider.get(source.providerId) ?? new Set();
    for (const official of source.models) {
      if (!official.id || matched.has(official.id)) continue;
      if (isOlderThanTrackedFamily(source.providerId, official.id, catalog.models)) continue;
      candidateModels.push(`${source.providerId}: ${official.id}${official.displayName ? ` (${official.displayName})` : ""}`);
    }
  }
}

async function refreshSourceVerifiedDates(catalog) {
  if (!refreshVerified) return;

  const records = [
    ...catalog.providers.map((record) => ({ collection: "providers", record })),
    ...catalog.products.map((record) => ({ collection: "products", record })),
    ...catalog.models.map((record) => ({ collection: "models", record })),
  ];

  for (const { collection, record } of records) {
    const result = await checkUrl(record.sourceUrl);
    if (!result.ok) {
      warnings.push(`${collection}.${record.id}.sourceUrl failed URL check: ${record.sourceUrl} (${result.status ?? result.error})`);
      continue;
    }

    if (recordChange(`${collection}.${record.id}.lastVerified`, record.lastVerified, today)) {
      record.lastVerified = today;
    }
  }
}

function renderReport() {
  const lines = [
    "# Catalog update report",
    "",
    `Run date: ${today}`,
    `Dry run: ${dryRun ? "yes" : "no"}`,
    `Refresh verified dates: ${refreshVerified ? "yes" : "no"}`,
    "",
    "## Source fetches",
    "",
    ...sourceState.map((source) => `- ${source.providerId}: ${source.status} - ${source.detail}`),
    "",
    "## Changes",
    "",
    ...(changes.length ? changes.map((change) => `- ${change}`) : ["- No JSON field changes."]),
    "",
    "## Local models not found in official API lists",
    "",
    ...(missingLocalModels.length ? missingLocalModels.map((item) => `- ${item}`) : ["- None."]),
    "",
    "## New official model candidates",
    "",
    ...(candidateModels.length ? candidateModels.slice(0, 80).map((item) => `- ${item}`) : ["- None."]),
  ];

  if (candidateModels.length > 80) {
    lines.push(`- ${candidateModels.length - 80} more candidates omitted from this report.`);
  }

  lines.push("", "## Warnings", "");
  lines.push(...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ["- None."]));
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const catalog = await loadCatalog();
  const sources = await fetchOfficialSources();
  const sourceIndex = buildSourceIndex(sources);

  reconcileModels(catalog, sourceIndex);
  await refreshSourceVerifiedDates(catalog);

  const report = renderReport();

  if (!dryRun) {
    await writeCatalog(catalog);
    await mkdir(reportsDir, { recursive: true });
    await writeFile(path.join(reportsDir, "catalog-diff.md"), report);
  }

  process.stdout.write(`${report}\n`);
  process.stdout.write(dryRun ? "Dry run complete. No files written.\n" : `Updated ${Object.values(catalogFiles).length} catalog files.\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
