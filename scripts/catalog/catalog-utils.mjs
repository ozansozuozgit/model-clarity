import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(thisDir, "../..");
export const catalogDir = path.join(repoRoot, "data/catalog");
export const reportsDir = path.join(repoRoot, "reports");

export const catalogFiles = {
  providers: path.join(catalogDir, "providers.json"),
  products: path.join(catalogDir, "products.json"),
  models: path.join(catalogDir, "models.json"),
  changelog: path.join(catalogDir, "changelog.json"),
  confusions: path.join(catalogDir, "confusions.json"),
  glossary: path.join(catalogDir, "glossary.json"),
};

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function loadCatalog() {
  return {
    providers: await readJson(catalogFiles.providers),
    products: await readJson(catalogFiles.products),
    models: await readJson(catalogFiles.models),
    changelog: await readJson(catalogFiles.changelog),
    confusions: await readJson(catalogFiles.confusions),
    glossary: await readJson(catalogFiles.glossary),
  };
}

export async function writeCatalog(catalog) {
  await writeJson(catalogFiles.providers, catalog.providers);
  await writeJson(catalogFiles.products, catalog.products);
  await writeJson(catalogFiles.models, catalog.models);
  await writeJson(catalogFiles.changelog, catalog.changelog);
  await writeJson(catalogFiles.confusions, catalog.confusions);
  await writeJson(catalogFiles.glossary, catalog.glossary);
}

export function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeModelId(id) {
  return String(id ?? "").replace(/^models\//, "");
}

export function formatTokenWindow(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1_000_000 && value % 1_000_000 === 0) return `${value / 1_000_000}M tokens`;
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M tokens`;
  if (value >= 1_000 && value % 1_000 === 0) return `${value / 1_000}K tokens`;
  if (value >= 1_000) return `${Number((value / 1_000).toFixed(1))}K tokens`;
  return `${value} tokens`;
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b));
}

export function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent": "model-clarity-catalog-updater/1.0",
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(Number(process.env.CATALOG_FETCH_TIMEOUT_MS ?? 20000)),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ""}`);
  }

  return response.json();
}

export async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
      "User-Agent": "model-clarity-catalog-updater/1.0",
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(Number(process.env.CATALOG_FETCH_TIMEOUT_MS ?? 20000)),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ""}`);
  }

  return response.text();
}

export async function checkUrl(url) {
  const headers = {
    Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "User-Agent": "model-clarity-catalog-validator/1.0",
  };

  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(Number(process.env.CATALOG_URL_TIMEOUT_MS ?? 15000)),
      });

      const reachableButProtected = [401, 403, 405, 429].includes(response.status);
      if ((response.status >= 200 && response.status < 400) || reachableButProtected) {
        return { ok: true, status: response.status, method };
      }

      if (method === "GET") {
        return { ok: false, status: response.status, method, error: response.statusText };
      }
    } catch (error) {
      if (method === "GET") {
        return {
          ok: false,
          status: null,
          method,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  return { ok: false, status: null, method: "GET", error: "Unknown URL check failure" };
}
