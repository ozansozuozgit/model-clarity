"use client";

import { ArrowSquareOut, Check, ClipboardText, Copy, MagnifyingGlass, Moon, Sun, X } from "@phosphor-icons/react";
import type { Dispatch, SetStateAction } from "react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildStackSummary,
  getProvider,
  getRecommendations,
  type Budget,
  type Capability,
  type ConfusionGuide,
  type Ecosystem,
  type GlossaryTerm,
  type Latency,
  type ModelRecord,
  type ProductEntry,
  type ProductKind,
  type Provider,
  type ProviderId,
  type QuizState,
  type UseCaseId,
} from "@/lib/catalog";

type CheatsheetAppProps = {
  providers: Provider[];
  models: ModelRecord[];
  productEntries: ProductEntry[];
  confusionGuides: ConfusionGuide[];
  useCases: Record<UseCaseId, { label: string; prompt: string; coreCapabilities: Capability[] }>;
  glossary: GlossaryTerm[];
};

type ProviderFilter = ProviderId | "all";
type KindFilter = ProductKind | "All";

const defaultQuiz: QuizState = {
  useCase: "agentic-coding",
  budget: "balanced",
  latency: "balanced",
  ecosystem: "none",
  needsOpenWeights: false,
};

const budgetLabels: Record<Budget, string> = {
  lowest: "Lowest cost",
  balanced: "Balanced",
  premium: "Best quality",
};

const latencyLabels: Record<Latency, string> = {
  instant: "Fast",
  balanced: "Normal",
  deep: "Deep work",
};

const ecosystemLabels: Record<Ecosystem, string> = {
  none: "No preference",
  openai: "OpenAI",
  google: "Google",
  anthropic: "Anthropic",
  xai: "xAI",
  "self-host": "Self-host",
};

const tierLabels: Record<Budget, string> = {
  lowest: "Low cost",
  balanced: "Balanced",
  premium: "Premium",
};

const productKinds: KindFilter[] = [
  "All",
  "App",
  "Agent",
  "Developer tool",
  "API",
  "Platform",
  "Model",
  "Subscription",
];

const SEARCH_PLACEHOLDER = "Try Gemini API, Claude Code, ChatGPT, OpenAI API, Grok ...";

function parseSearchTokens(text: string): string[] {
  return text.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function buildProductSearchBlob(entry: ProductEntry): string {
  return [
    entry.name,
    entry.kind,
    entry.plainEnglish,
    entry.audience,
    entry.useWhen,
    entry.skipWhen,
    entry.developerDetail,
    ...entry.relatedNames,
  ]
    .join(" ")
    .toLowerCase();
}

function scoreProductSearch(entry: ProductEntry, rawQuery: string, tokens: string[]): number {
  if (!tokens.length) return 0;

  const name = entry.name.toLowerCase();
  const related = entry.relatedNames.map((relatedName) => relatedName.toLowerCase());

  if (name === rawQuery) return 0;
  if (name.startsWith(rawQuery)) return 1;
  if (name.includes(rawQuery)) return 2;
  if (related.some((relatedName) => relatedName === rawQuery)) return 3;
  if (related.some((relatedName) => relatedName.startsWith(rawQuery))) return 4;
  if (tokens.every((token) => name.includes(token))) return 5;
  if (tokens.every((token) => related.some((relatedName) => relatedName.includes(token)))) return 6;
  return 10;
}

function syncProductHash(productId: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `#product-${productId}`);
}

function navigateToSection(domId: string) {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    document.getElementById(domId)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${domId}`);
  });
}

function providerName(providerId: ProviderId) {
  return getProvider(providerId)?.name ?? providerId;
}

export function CheatsheetApp({
  providers,
  models,
  productEntries,
  confusionGuides,
  useCases,
  glossary,
}: CheatsheetAppProps) {
  const validProductIds = useMemo(() => new Set(productEntries.map((entry) => entry.id)), [productEntries]);

  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gemini-app");
  const [darkMode, setDarkMode] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>(defaultQuiz);
  const [modelProviderFilter, setModelProviderFilter] = useState<ProviderFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const rawSearchQuery = query.trim().toLowerCase();
  const searchTokens = useMemo(() => parseSearchTokens(query), [query]);
  const recommendations = useMemo(() => getRecommendations(quiz), [quiz]);
  const stack = useMemo(() => buildStackSummary(quiz, recommendations), [quiz, recommendations]);
  const hasActiveFilters = Boolean(query) || providerFilter !== "all" || kindFilter !== "All";

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", darkMode);
    return () => document.documentElement.classList.remove("theme-dark");
  }, [darkMode]);

  useEffect(() => {
    function applyHash() {
      const raw = window.location.hash.slice(1);
      if (!raw.startsWith("product-")) return;
      const productId = raw.slice("product-".length);
      if (validProductIds.has(productId)) setSelectedId(productId);
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [validProductIds]);

  const filteredProducts = useMemo(() => {
    return productEntries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        const matchesProvider = providerFilter === "all" || entry.providerId === providerFilter;
        const matchesKind = kindFilter === "All" || entry.kind === kindFilter;
        const haystack = buildProductSearchBlob(entry);
        const matchesQuery = searchTokens.length === 0 || searchTokens.every((token) => haystack.includes(token));
        return matchesProvider && matchesKind && matchesQuery;
      })
      .sort((a, b) => {
        const rankA = scoreProductSearch(a.entry, rawSearchQuery, searchTokens);
        const rankB = scoreProductSearch(b.entry, rawSearchQuery, searchTokens);
        return rankA - rankB || a.index - b.index;
      })
      .map(({ entry }) => entry);
  }, [kindFilter, productEntries, providerFilter, rawSearchQuery, searchTokens]);

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    if (filteredProducts.some((entry) => entry.id === selectedId)) return;
    const nextId = filteredProducts[0].id;
    setSelectedId(nextId);
    syncProductHash(nextId);
  }, [filteredProducts, selectedId]);

  const selectedProduct = filteredProducts.find((entry) => entry.id === selectedId);

  const groupedModels = useMemo(() => {
    const filtered =
      modelProviderFilter === "all"
        ? models
        : models.filter((model) => model.providerId === modelProviderFilter);

    return providers
      .map((provider) => ({
        provider,
        models: filtered.filter((model) => model.providerId === provider.id),
      }))
      .filter((group) => group.models.length > 0);
  }, [modelProviderFilter, models, providers]);

  const typeCounts = useMemo(() => {
    return productKinds.reduce<Record<string, number>>((accumulator, kind) => {
      accumulator[kind] =
        kind === "All" ? productEntries.length : productEntries.filter((entry) => entry.kind === kind).length;
      return accumulator;
    }, {});
  }, [productEntries]);

  const selectProductById = useCallback((id: string) => {
    setSelectedId(id);
    syncProductHash(id);
  }, []);

  async function copyProductAnswer() {
    if (!selectedProduct) return;
    const provider = getProvider(selectedProduct.providerId)?.name ?? selectedProduct.providerId;
    const body = [
      `${selectedProduct.name} is a ${selectedProduct.kind.toLowerCase()} from ${provider}.`,
      "",
      selectedProduct.plainEnglish,
      "",
      `Use when: ${selectedProduct.useWhen}`,
      `Skip when: ${selectedProduct.skipWhen}`,
      "",
      `Source: ${selectedProduct.sourceUrl}`,
      `Verified: ${selectedProduct.lastVerified}`,
    ].join("\n");
    await navigator.clipboard.writeText(body);
    setCopied("product");
    window.setTimeout(() => setCopied(null), 1400);
  }

  async function copyStack() {
    const primaryLine = stack.primary
      ? `Primary: ${stack.primary.name} (model ID: ${stack.primary.modelId})`
      : "Primary: TBD";

    const secondaryLine = stack.secondary
      ? `Fallback: ${stack.secondary.name} (model ID: ${stack.secondary.modelId})`
      : "Fallback: add after evals";

    const body = [
      stack.title,
      primaryLine,
      secondaryLine,
      "",
      "Checks before shipping:",
      ...stack.notes.map((note) => `- ${note}`),
    ].join("\n");

    await navigator.clipboard.writeText(body);
    setCopied("stack");
    window.setTimeout(() => setCopied(null), 1400);
  }

  async function copyModelId(key: string, modelId: string) {
    await navigator.clipboard.writeText(modelId);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function resetFilters() {
    setQuery("");
    setProviderFilter("all");
    setKindFilter("All");
  }

  const resultsSummary = useMemo(() => {
    const n = filteredProducts.length;
    return n === productEntries.length ? `${n} products` : `${n} results for current filters`;
  }, [filteredProducts.length, productEntries.length]);

  return (
    <div className="app-shell min-h-dvh">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="AI Cheatsheet home">
            <span className="brand-text">
              <strong>AI Cheatsheet</strong>
              <small>Quick reference</small>
            </span>
          </a>

          <div className="header-actions">
            <a
              className="nav-link"
              href="#models"
              onClick={(event) => {
                event.preventDefault();
                navigateToSection("models");
              }}
            >
              Models
            </a>
            <a
              className="nav-link"
              href="#lookup"
              onClick={(event) => {
                event.preventDefault();
                navigateToSection("lookup");
              }}
            >
              Lookup
            </a>
            <a
              className="nav-link"
              href="#builder"
              onClick={(event) => {
                event.preventDefault();
                navigateToSection("builder");
              }}
            >
              Stack
            </a>
            <a
              className="nav-link"
              href="#learn"
              onClick={(event) => {
                event.preventDefault();
                navigateToSection("learn");
              }}
            >
              Learn
            </a>
            <button
              aria-label="Toggle color theme"
              className="icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              type="button"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="page-main" id="top">
        <div className="page-intro animate-in">
          <div className="intro-copy">
            <p className="intro-kicker">Cheat sheet for AI names</p>
            <h1>AI model and product reference</h1>
            <p>
              Start with the API-ready model names. Use lookup when a vendor page mentions an app, agent, subscription,
              or tool you do not recognize.
            </p>
          </div>
          <div className="intro-proof" aria-label="Catalog summary">
            <span>{models.length} model IDs</span>
            <span>{productEntries.length} product and tool names</span>
            <span>{confusionGuides.length} mixups</span>
          </div>
        </div>

        <ModelCheatSheet
          copiedKey={copied}
          copyModelId={copyModelId}
          groupedModels={groupedModels}
          modelCount={models.length}
          modelProviderFilter={modelProviderFilter}
          providers={providers}
          setModelProviderFilter={setModelProviderFilter}
        />

        <section
          aria-labelledby="lookup-heading"
          className="lookup-block animate-in animate-in-delay-1"
          id="lookup"
        >
          <div className="section-head lookup-section-head">
            <div>
              <p className="section-kicker">Product lookup</p>
              <h2 id="lookup-heading">Search names</h2>
              <p className="section-desc">Find apps, agents, APIs, subscriptions, and tools mentioned in vendor docs.</p>
            </div>
          </div>
          <div className="lookup-control-panel">
            <div className="lookup-command">
              <div className="lookup-command-copy">
                <p className="lookup-toolbar-kicker">Search</p>
                <p className="lookup-toolbar-title">Type a name or try a shortcut.</p>
              </div>

              <div className="lookup-search-panel">
                <div className="list-search">
                  <MagnifyingGlass size={15} aria-hidden />
                  <div className="list-search-input-wrap">
                    <input
                      aria-describedby="product-results-count-live"
                      aria-label="Search AI products"
                      id="product-search-field"
                      inputMode="search"
                      placeholder={SEARCH_PLACEHOLDER}
                      spellCheck={false}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>
                  <span className="list-search-count-wrap" aria-hidden>
                    <span className="list-search-count">{filteredProducts.length}</span>
                  </span>
                  {query ? (
                    <button
                      aria-controls="product-search-field"
                      aria-label="Clear search"
                      className="list-search-clear"
                      onClick={() => setQuery("")}
                      type="button"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  ) : null}
                </div>
                <span className="sr-only" aria-atomic="true" aria-live="polite" id="product-results-count-live">
                  {resultsSummary}
                </span>
              </div>

              <div className="quick-lookups" aria-label="Example lookups">
                {["Gemini API", "Claude Code", "ChatGPT", "Grok"].map((example) => (
                  <button
                    className="quick-lookup"
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      navigateToSection("lookup");
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-zone compact-filters" aria-label="Product filters">
              <div className="filter-row">
                <p className="filter-label">Company</p>
                <button
                  className={`chip ${providerFilter === "all" ? "is-active" : ""}`}
                  onClick={() => setProviderFilter("all")}
                  type="button"
                >
                  All
                  <span className="chip-count">{productEntries.length}</span>
                </button>
                {providers.map((provider) => (
                  <button
                    className={`chip ${providerFilter === provider.id ? "is-active" : ""}`}
                    key={provider.id}
                    onClick={() => setProviderFilter(provider.id)}
                    type="button"
                  >
                    <span className="chip-dot" style={{ background: provider.accent }} />
                    {provider.name}
                  </button>
                ))}
              </div>

              <div className="filter-row">
                <p className="filter-label">Type</p>
                {productKinds.map((kind) => (
                  <button
                    className={`chip ${kindFilter === kind ? "is-active" : ""}`}
                    key={kind}
                    onClick={() => setKindFilter(kind)}
                    type="button"
                  >
                    {kind}
                    <span className="chip-count">{typeCounts[kind]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lookup-results-bar">
              <span>{resultsSummary}</span>
              {hasActiveFilters ? (
                <button className="reset-link" onClick={resetFilters} type="button">
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <ProductReferenceTable
            copied={copied === "product"}
            onCopy={copyProductAnswer}
            products={filteredProducts}
            providerFor={getProvider}
            selectProductById={selectProductById}
            selectedProduct={selectedProduct}
          />
        </section>

        <StackBuilder
          copied={copied}
          copyModelId={copyModelId}
          copyStack={copyStack}
          models={models}
          quiz={quiz}
          recommendations={recommendations}
          setQuiz={setQuiz}
          useCases={useCases}
        />

        <LearnSection confusionGuides={confusionGuides} glossary={glossary} />
      </main>
    </div>
  );
}

function ProductReferenceTable({
  copied,
  products,
  providerFor,
  onCopy,
  selectProductById,
  selectedProduct,
}: {
  copied: boolean;
  onCopy: () => void;
  products: ProductEntry[];
  providerFor: typeof getProvider;
  selectProductById: (id: string) => void;
  selectedProduct?: ProductEntry;
}) {
  if (!products.length) {
    return (
      <div className="reference-panel">
        <div className="list-empty">
          <MagnifyingGlass size={24} />
          <h2>No matches</h2>
          <p>Try a broader term like API, app, agent, or a company name.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lookup-table-grid animate-in animate-in-delay-2">
      <div className="reference-panel">
        <div className="table-scroll">
          <table className="reference-table product-reference-table">
            <caption className="sr-only">AI product, app, API, and tool lookup</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Company</th>
                <th scope="col">Plain answer</th>
                <th scope="col">Use when</th>
              </tr>
            </thead>
            <tbody>
              {products.map((entry) => {
                const isSelected = selectedProduct?.id === entry.id;
                return (
                  <Fragment key={entry.id}>
                    <tr
                      className={isSelected ? "is-selected" : ""}
                      onClick={() => selectProductById(entry.id)}
                    >
                      <th scope="row">
                        <button
                          aria-current={isSelected ? "true" : undefined}
                          className="table-name-button"
                          type="button"
                          onClick={() => selectProductById(entry.id)}
                        >
                          {entry.name}
                        </button>
                      </th>
                      <td>
                        <span className="table-pill">{entry.kind}</span>
                      </td>
                      <td>{providerFor(entry.providerId)?.name ?? entry.providerId}</td>
                      <td>{entry.plainEnglish}</td>
                      <td>{entry.useWhen}</td>
                    </tr>
                    {isSelected ? (
                      <tr className="selected-detail-row">
                        <td colSpan={5}>
                          <ProductDetailInline copied={copied} onCopy={onCopy} product={entry} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductDetailInline({
  copied,
  onCopy,
  product,
}: {
  copied: boolean;
  onCopy: () => void;
  product: ProductEntry;
}) {
  return (
    <div className="inline-detail-panel" aria-live="polite">
      <div className="inline-detail-head">
        <div>
          <p className="eyebrow">{providerName(product.providerId)} / {product.kind}</p>
          <h3>{product.name}</h3>
        </div>
        <div className="detail-utilities">
          <button className={`detail-link ${copied ? "is-copied" : ""}`} onClick={onCopy} type="button">
            {copied ? "Copied" : "Copy answer"}
          </button>
          <a
            aria-label={`Open vendor documentation for ${product.name} (opens in a new tab)`}
            className="detail-link"
            href={product.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Docs
            <ArrowSquareOut aria-hidden size={12} weight="bold" />
          </a>
        </div>
      </div>
      <dl className="fact-table">
        <div>
          <dt>Plain answer</dt>
          <dd>{product.plainEnglish}</dd>
        </div>
        <div>
          <dt>For</dt>
          <dd>{product.audience}</dd>
        </div>
        <div>
          <dt>Use when</dt>
          <dd>{product.useWhen}</dd>
        </div>
        <div>
          <dt>Skip when</dt>
          <dd>{product.skipWhen}</dd>
        </div>
        <div>
          <dt>Developer read</dt>
          <dd>{product.developerDetail}</dd>
        </div>
        <div>
          <dt>Related</dt>
          <dd>{product.relatedNames.join(", ")}</dd>
        </div>
        <div>
          <dt>Verified</dt>
          <dd>{product.lastVerified}</dd>
        </div>
      </dl>
    </div>
  );
}

function ModelCheatSheet({
  copiedKey,
  copyModelId,
  groupedModels,
  modelCount,
  modelProviderFilter,
  providers,
  setModelProviderFilter,
}: {
  copiedKey: string | null;
  copyModelId: (key: string, modelId: string) => Promise<void>;
  groupedModels: { provider: Provider; models: ModelRecord[] }[];
  modelCount: number;
  modelProviderFilter: ProviderFilter;
  providers: Provider[];
  setModelProviderFilter: Dispatch<SetStateAction<ProviderFilter>>;
}) {
  return (
    <section className="section-block model-first-block" id="models">
      <div className="section-head">
        <div>
          <p className="section-kicker">Model cheat sheet</p>
          <h2>Current model names</h2>
          <p className="section-desc">
            API-ready model IDs, status, and one-line fit notes. These are the names you copy into code.
          </p>
        </div>
      </div>

      <div className="filter-zone" style={{ marginBottom: "1.1rem" }}>
        <div className="filter-row">
          <p className="filter-label">Provider</p>
          <button
            className={`chip ${modelProviderFilter === "all" ? "is-active" : ""}`}
            onClick={() => setModelProviderFilter("all")}
            type="button"
          >
            All
            <span className="chip-count">{modelCount}</span>
          </button>
          {providers.map((provider) => (
            <button
              className={`chip ${modelProviderFilter === provider.id ? "is-active" : ""}`}
              key={provider.id}
              onClick={() => setModelProviderFilter(provider.id)}
              type="button"
            >
              <span className="chip-dot" style={{ background: provider.accent }} />
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      <div className="reference-panel">
        <div className="table-scroll">
          <table className="reference-table model-reference-table">
            <caption className="sr-only">Current API-ready model names</caption>
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col">Model</th>
                <th scope="col">Model ID</th>
                <th scope="col">Status</th>
                <th scope="col">Tier</th>
                <th scope="col">Best read</th>
                <th scope="col">Context</th>
                <th scope="col">Latency</th>
                <th scope="col">Docs</th>
              </tr>
            </thead>
            <tbody>
              {groupedModels.flatMap(({ provider, models: providerModels }) =>
                providerModels.map((model) => {
                  const copyKey = `mid-sheet-${model.id}`;
                  return (
                    <tr key={model.id}>
                      <td>
                        <span className="provider-cell">
                          <span className="chip-dot" style={{ background: provider.accent }} />
                          {provider.name}
                        </span>
                      </td>
                      <th scope="row">{model.name}</th>
                      <td>
                        <span className="id-cell">
                          <code>{model.modelId}</code>
                          <button
                            aria-label={`Copy model ID ${model.modelId}`}
                            className={`mini-copy ${copiedKey === copyKey ? "is-copied" : ""}`}
                            type="button"
                            onClick={() => copyModelId(copyKey, model.modelId)}
                          >
                            {copiedKey === copyKey ? <Check aria-hidden size={14} /> : <Copy aria-hidden size={14} />}
                          </button>
                        </span>
                      </td>
                      <td><span className={`status-pill ${model.status}`}>{model.status}</span></td>
                      <td><span className="table-pill">{tierLabels[model.pricingTier]}</span></td>
                      <td>{model.shortDescription}</td>
                      <td>{model.contextWindow}</td>
                      <td>{latencyLabels[model.latency]}</td>
                      <td>
                        <a
                          aria-label={`Open vendor documentation for ${model.name} (opens in a new tab)`}
                          className="table-link"
                          href={model.sourceUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Docs <ArrowSquareOut aria-hidden size={12} weight="bold" />
                        </a>
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StackBuilder({
  copied,
  copyModelId,
  copyStack,
  models,
  quiz,
  recommendations,
  setQuiz,
  useCases,
}: {
  copied: string | null;
  copyModelId: (key: string, modelId: string) => Promise<void>;
  copyStack: () => void;
  models: ModelRecord[];
  quiz: QuizState;
  recommendations: ReturnType<typeof getRecommendations>;
  setQuiz: Dispatch<SetStateAction<QuizState>>;
  useCases: Record<UseCaseId, { label: string; prompt: string; coreCapabilities: Capability[] }>;
}) {
  return (
    <section className="section-block" id="builder">
      <div className="section-head">
        <div>
          <p className="section-kicker">Stack builder</p>
          <h2>Stack shortlist</h2>
          <p className="section-desc">Set your job and constraints. Copy the result into a ticket or planning doc.</p>
        </div>
        <button className="btn-ghost" onClick={copyStack} type="button">
          <ClipboardText size={14} weight="bold" />
          {copied === "stack" ? "Copied" : "Copy stack"}
        </button>
      </div>

      <div className="builder-shell">
        <div className="builder-form">
          <label className="field span-2">
            <span>Job</span>
            <select
              value={quiz.useCase}
              onChange={(event) => setQuiz((current) => ({ ...current, useCase: event.target.value as UseCaseId }))}
            >
              {Object.entries(useCases).map(([id, useCase]) => (
                <option key={id} value={id}>
                  {useCase.label}
                </option>
              ))}
            </select>
          </label>
          <Segmented
            label="Budget"
            value={quiz.budget}
            options={budgetLabels}
            onChange={(value) => setQuiz((current) => ({ ...current, budget: value }))}
          />
          <Segmented
            label="Speed"
            value={quiz.latency}
            options={latencyLabels}
            onChange={(value) => setQuiz((current) => ({ ...current, latency: value }))}
          />
          <label className="field span-2">
            <span>Ecosystem</span>
            <select
              value={quiz.ecosystem}
              onChange={(event) =>
                setQuiz((current) => ({ ...current, ecosystem: event.target.value as Ecosystem }))
              }
            >
              {Object.entries(ecosystemLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="check-field">
            <input
              checked={quiz.needsOpenWeights}
              onChange={(event) =>
                setQuiz((current) => ({ ...current, needsOpenWeights: event.target.checked }))
              }
              type="checkbox"
            />
            <span>Need open weights or self-hosting</span>
          </label>
        </div>

        <div className="recommendation-table-wrap">
          <table className="reference-table recommendation-table">
            <caption className="sr-only">Recommended model shortlist</caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Model</th>
                <th scope="col">Provider</th>
                <th scope="col">Model ID</th>
                <th scope="col">Fit</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.slice(0, 3).map((recommendation, index) => {
                const rankCopyKey = `rank-copy-${recommendation.model.id}`;
                return (
                  <tr key={recommendation.model.id}>
                    <td>{index + 1}</td>
                    <th scope="row">{recommendation.model.name}</th>
                    <td>{providerName(recommendation.model.providerId)}</td>
                    <td>
                      <span className="id-cell">
                        <code>{recommendation.model.modelId}</code>
                        <button
                          aria-label={`Copy model ID ${recommendation.model.modelId}`}
                          className={`mini-copy ${copied === rankCopyKey ? "is-copied" : ""}`}
                          type="button"
                          onClick={() => copyModelId(rankCopyKey, recommendation.model.modelId)}
                        >
                          {copied === rankCopyKey ? <Check aria-hidden size={14} /> : <Copy aria-hidden size={14} />}
                        </button>
                      </span>
                    </td>
                    <td>{recommendation.score}</td>
                    <td>{recommendation.reasons[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="builder-note">
        {models.length} models in the local reference set. Treat this as a shortlist; verify pricing, limits, and docs
        before shipping.
      </p>
    </section>
  );
}

function Segmented<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: Record<T, string>;
  value: T;
}) {
  return (
    <div className="segmented">
      <span>{label}</span>
      <div className="segmented-options">
        {Object.entries(options).map(([key, labelText]) => (
          <button
            className={value === key ? "is-active" : ""}
            key={key}
            onClick={() => onChange(key as T)}
            type="button"
          >
            {labelText as string}
          </button>
        ))}
      </div>
    </div>
  );
}

function LearnSection({
  confusionGuides,
  glossary,
}: {
  confusionGuides: ConfusionGuide[];
  glossary: GlossaryTerm[];
}) {
  return (
    <section className="section-block" id="learn">
      <div className="section-head">
        <div>
          <p className="section-kicker">Learn</p>
          <h2>Common mixups</h2>
          <p className="section-desc">The fastest way to avoid the usual AI naming traps.</p>
        </div>
      </div>

      <div className="learn-layout">
        <div className="traps-panel" aria-label="Common AI naming mixups">
          {confusionGuides.map((guide) => (
            <article className="trap-card" id={`guide-${guide.id}`} key={guide.id}>
              <div className="trap-copy">
                <p className="trap-label">Mixup</p>
                <h3>{guide.title}</h3>
                <span className="trap-question">{guide.question}</span>
                <p className="trap-answer">{guide.answer}</p>
              </div>
              <ul className="trap-choices">
                {guide.choices.map((choice) => (
                  <li className="trap-choice" key={choice.label}>
                    <p className="trap-choice-label">{choice.label}</p>
                    <p className="trap-choice-when">{choice.pickWhen}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <aside className="glossary-panel">
          <p className="glossary-kicker">Vocabulary</p>
          <h3>Words docs assume you know</h3>
          <p>Plain translations for pricing pages, model cards, API docs, and eval writeups.</p>
          <div className="glossary-list">
            {glossary.map((term) => (
              <div className="glossary-item" key={term.term}>
                <p className="glossary-term">{term.term}</p>
                <p className="glossary-def">{term.plainEnglish}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="page-end" aria-label="End of cheat sheet">
        <div>
          <p className="page-end-kicker">Keep it bookmarked</p>
          <p>Use lookup for product names, models for API IDs, and vocabulary when a vendor page gets vague.</p>
        </div>
        <a href="#top" onClick={(event) => { event.preventDefault(); navigateToSection("top"); }}>
          Back to top
        </a>
      </footer>
    </section>
  );
}
