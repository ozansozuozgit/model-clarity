"use client";

import {
  AppWindow,
  ArrowSquareOut,
  BracketsCurly,
  CaretRight,
  CheckCircle,
  ClipboardText,
  Code,
  Copy,
  Database,
  GitBranch,
  MagnifyingGlass,
  Moon,
  Sparkle,
  Sun,
  TerminalWindow,
  X,
} from "@phosphor-icons/react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";
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

type CompassAppProps = {
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

const capabilityLabels: Record<Capability, string> = {
  agents: "Agents",
  coding: "Coding",
  "cost-efficiency": "Cost",
  "long-context": "Long context",
  multimodal: "Multimodal",
  reasoning: "Reasoning",
  realtime: "Realtime",
  "self-hosting": "Self-host",
  "structured-output": "JSON",
  "tool-calling": "Tools",
};

const productKinds: KindFilter[] = ["All", "App", "Agent", "Developer tool", "API", "Platform", "Model", "Subscription"];

export function CompassApp({
  providers,
  models,
  productEntries,
  confusionGuides,
  useCases,
  glossary,
}: CompassAppProps) {
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("gemini-app");
  const [darkMode, setDarkMode] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>(defaultQuiz);
  const [copied, setCopied] = useState<"product" | "stack" | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const recommendations = useMemo(() => getRecommendations(quiz), [quiz]);
  const stack = useMemo(() => buildStackSummary(quiz, recommendations), [quiz, recommendations]);
  const hasActiveFilters = Boolean(query) || providerFilter !== "all" || kindFilter !== "All";

  const filteredProducts = useMemo(() => {
    return productEntries.filter((entry) => {
      const matchesProvider = providerFilter === "all" || entry.providerId === providerFilter;
      const matchesKind = kindFilter === "All" || entry.kind === kindFilter;
      const searchable = [
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

      return matchesProvider && matchesKind && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [kindFilter, normalizedQuery, productEntries, providerFilter]);

  const selectedProduct =
    filteredProducts.find((entry) => entry.id === selectedId) ??
    productEntries.find((entry) => entry.id === selectedId) ??
    filteredProducts[0] ??
    productEntries[0];

  const typeCounts = useMemo(() => {
    return productKinds.reduce<Record<string, number>>((accumulator, kind) => {
      accumulator[kind] = kind === "All" ? productEntries.length : productEntries.filter((entry) => entry.kind === kind).length;
      return accumulator;
    }, {});
  }, [productEntries]);

  async function copyProductAnswer() {
    if (!selectedProduct) return;
    const provider = getProvider(selectedProduct.providerId)?.name ?? selectedProduct.providerId;
    const body = `${selectedProduct.name} is a ${selectedProduct.kind.toLowerCase()} from ${provider}. ${selectedProduct.plainEnglish} Use it when: ${selectedProduct.useWhen}`;
    await navigator.clipboard.writeText(body);
    setCopied("product");
    window.setTimeout(() => setCopied(null), 1400);
  }

  async function copyStack() {
    const body = [
      stack.title,
      `Primary: ${stack.primary?.name ?? "TBD"}`,
      stack.secondary ? `Fallback: ${stack.secondary.name}` : "Fallback: add after evals",
      "",
      "Checks before shipping:",
      ...stack.notes.map((note) => `- ${note}`),
    ].join("\n");

    await navigator.clipboard.writeText(body);
    setCopied("stack");
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <main className={`app-shell min-h-[100dvh] ${darkMode ? "theme-dark" : ""}`}>
      <CommandBar
        darkMode={darkMode}
        providerCount={providers.length}
        query={query}
        resultCount={filteredProducts.length}
        setDarkMode={setDarkMode}
        setQuery={setQuery}
      />

      <div className="workspace-grid mx-auto grid w-full">
        <QuickRail
          confusionGuides={confusionGuides}
          kindFilter={kindFilter}
          productCount={productEntries.length}
          providerFilter={providerFilter}
          providers={providers}
          setKindFilter={setKindFilter}
          setProviderFilter={setProviderFilter}
          typeCounts={typeCounts}
        />

        <section className="min-w-0">
          <div className="reference-header">
            <div>
              <p className="micro-label">Name directory</p>
              <h1>Find the right meaning fast</h1>
            </div>
            {hasActiveFilters ? (
              <button
                aria-label="Reset search and filters"
                className="quiet-button"
                onClick={() => {
                  setQuery("");
                  setProviderFilter("all");
                  setKindFilter("All");
                }}
                type="button"
              >
                <X size={15} weight="bold" />
                Reset filters
              </button>
            ) : (
              <span className="state-pill">All names shown</span>
            )}
          </div>

          <DirectoryList
            products={filteredProducts}
            selectedId={selectedProduct?.id}
            setSelectedId={setSelectedId}
          />
        </section>

        <AnswerPanel
          copied={copied === "product"}
          product={selectedProduct}
          provider={selectedProduct ? getProvider(selectedProduct.providerId) : undefined}
          onCopy={copyProductAnswer}
        />
      </div>

      <div className="decision-zone">
        <BuilderPanel
          copied={copied === "stack"}
          copyStack={copyStack}
          models={models}
          quiz={quiz}
          recommendations={recommendations}
          setQuiz={setQuiz}
          useCases={useCases}
        />
      </div>

      <ReferenceShelf confusionGuides={confusionGuides} glossary={glossary} />
    </main>
  );
}

function CommandBar({
  darkMode,
  providerCount,
  query,
  resultCount,
  setDarkMode,
  setQuery,
}: {
  darkMode: boolean;
  providerCount: number;
  query: string;
  resultCount: number;
  setDarkMode: (value: boolean) => void;
  setQuery: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b [border-color:var(--line)] [background:color-mix(in_oklch,var(--surface),transparent_4%)] backdrop-blur-xl">
      <div className="command-inner mx-auto grid">
        <a className="brand-mark" href="#top" aria-label="AI Compass home">
          <span className="brand-icon">
            <MagnifyingGlass size={16} weight="bold" />
          </span>
          <span>
            <strong>AI Compass</strong>
            <small>{providerCount} ecosystems tracked</small>
          </span>
        </a>

        <label className="search-box">
          <MagnifyingGlass size={17} />
          <input
            aria-label="Search AI products"
            placeholder="Search Gemini API, Claude Code, Vertex, ChatGPT..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span aria-label={`${resultCount} matching names`}>{resultCount} names</span>
        </label>

        <div className="top-actions">
          <a className="nav-pill" href="#builder">
            Builder
          </a>
          <a className="nav-pill" href="#reference">
            Mix-ups
          </a>
          <button
            aria-label="Toggle color theme"
            className="icon-button"
            onClick={() => setDarkMode(!darkMode)}
            type="button"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function QuickRail({
  confusionGuides,
  kindFilter,
  productCount,
  providerFilter,
  providers,
  setKindFilter,
  setProviderFilter,
  typeCounts,
}: {
  confusionGuides: ConfusionGuide[];
  kindFilter: KindFilter;
  productCount: number;
  providerFilter: ProviderFilter;
  providers: Provider[];
  setKindFilter: Dispatch<SetStateAction<KindFilter>>;
  setProviderFilter: Dispatch<SetStateAction<ProviderFilter>>;
  typeCounts: Record<string, number>;
}) {
  return (
    <aside className="quick-rail" id="top">
      <section className="rail-section">
        <p className="micro-label">Quick clarity</p>
        <h2>Start by identifying the object.</h2>
        <p>
          A name can be an app, model, API, platform, subscription, agent, or coding tool. Comparing quality before
          naming the object is where most confusion starts.
        </p>
        <div className="rail-metric">
          <strong>{productCount}</strong>
          <span>names mapped</span>
        </div>
      </section>

      <section className="rail-section">
        <p className="micro-label">Company</p>
        <div className="filter-stack">
          <FilterButton active={providerFilter === "all"} count={productCount} onClick={() => setProviderFilter("all")}>
            All
          </FilterButton>
          {providers.map((provider) => (
            <FilterButton
              active={providerFilter === provider.id}
              count={undefined}
              key={provider.id}
              onClick={() => setProviderFilter(provider.id)}
              swatch={provider.accent}
            >
              {provider.name}
            </FilterButton>
          ))}
        </div>
      </section>

      <section className="rail-section">
        <p className="micro-label">Type</p>
        <div className="type-grid">
          {productKinds.map((kind) => (
            <button
              className={`type-chip ${kindFilter === kind ? "is-active" : ""}`}
              key={kind}
              onClick={() => setKindFilter(kind)}
              type="button"
            >
              <span>{kind}</span>
              <b>{typeCounts[kind]}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="rail-section">
        <p className="micro-label">Common traps</p>
        <div className="trap-list">
          {confusionGuides.map((guide) => (
            <a href={`#guide-${guide.id}`} key={guide.id}>
              {guide.question}
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}

function FilterButton({
  active,
  children,
  count,
  onClick,
  swatch,
}: {
  active: boolean;
  children: ReactNode;
  count?: number;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button className={`filter-button ${active ? "is-active" : ""}`} onClick={onClick} type="button">
      <span className="filter-name">
        {swatch ? <span className="filter-swatch" style={{ background: swatch }} /> : null}
        {children}
      </span>
      {typeof count === "number" ? <b>{count}</b> : null}
    </button>
  );
}

function DirectoryList({
  products,
  selectedId,
  setSelectedId,
}: {
  products: ProductEntry[];
  selectedId?: string;
  setSelectedId: (id: string) => void;
}) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <MagnifyingGlass size={22} />
        <h2>No matching names</h2>
        <p>Remove one filter or search for a broader term like API, app, coding, Google, or agent.</p>
      </div>
    );
  }

  return (
    <div aria-label="AI product directory" className="directory-list" role="listbox">
      {products.map((entry, index) => (
        <button
          aria-selected={selectedId === entry.id}
          className={`directory-row ${selectedId === entry.id ? "is-selected" : ""}`}
          key={entry.id}
          onClick={() => setSelectedId(entry.id)}
          role="option"
          style={{ "--row-index": index } as React.CSSProperties}
          type="button"
        >
          <span className="kind-icon">{kindIcon(entry.kind)}</span>
          <span className="row-main">
            <span className="row-title">
              <strong>{entry.name}</strong>
              <b>{entry.kind}</b>
            </span>
            <span>{entry.plainEnglish}</span>
          </span>
          <span className="row-action" aria-hidden="true">
            Details
            <CaretRight size={14} weight="bold" />
          </span>
        </button>
      ))}
    </div>
  );
}

function AnswerPanel({
  copied,
  onCopy,
  product,
  provider,
}: {
  copied: boolean;
  onCopy: () => void;
  product?: ProductEntry;
  provider?: Provider;
}) {
  if (!product) return null;

  return (
    <aside className="answer-panel">
      <div className="answer-kicker">
        <span className="filter-swatch" style={{ background: provider?.accent }} />
        {provider?.name ?? product.providerId}
      </div>
      <h2>{product.name}</h2>
      <div className="answer-type">
        <span>{product.kind}</span>
        <small>verified {product.lastVerified}</small>
      </div>

      <p className="answer-definition">{product.plainEnglish}</p>

      <div className="answer-actions">
        <button className="action-button" onClick={onCopy} type="button">
          <Copy size={15} weight="bold" />
          {copied ? "Copied" : "Copy answer"}
        </button>
        <a className="action-button secondary" href={product.sourceUrl} rel="noreferrer" target="_blank">
          <ArrowSquareOut size={15} weight="bold" />
          Source
        </a>
      </div>

      <div className="answer-blocks">
        <InfoBlock icon={<CheckCircle size={16} weight="bold" />} title="Use it when" body={product.useWhen} />
        <InfoBlock icon={<X size={16} weight="bold" />} title="Skip it when" body={product.skipWhen} />
        <InfoBlock icon={<Code size={16} weight="bold" />} title="Developer read" body={product.developerDetail} />
      </div>

      <div className="related-list">
        <p className="micro-label">Related names</p>
        <div>
          {product.relatedNames.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function BuilderPanel({
  copied,
  copyStack,
  models,
  quiz,
  recommendations,
  setQuiz,
  useCases,
}: {
  copied: boolean;
  copyStack: () => void;
  models: ModelRecord[];
  quiz: QuizState;
  recommendations: ReturnType<typeof getRecommendations>;
  setQuiz: Dispatch<SetStateAction<QuizState>>;
  useCases: Record<UseCaseId, { label: string; prompt: string; coreCapabilities: Capability[] }>;
}) {
  return (
    <section className="builder-panel" id="builder">
      <div className="builder-head">
        <div>
          <p className="micro-label">Builder mode</p>
          <h2>Need a stack answer?</h2>
        </div>
        <button className="action-button compact" onClick={copyStack} type="button">
          <ClipboardText size={15} weight="bold" />
          {copied ? "Copied" : "Copy stack"}
        </button>
      </div>

      <div className="builder-layout">
        <div className="builder-controls">
          <label>
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
          <Segmented label="Budget" value={quiz.budget} options={budgetLabels} onChange={(value) => setQuiz((current) => ({ ...current, budget: value }))} />
          <Segmented label="Speed" value={quiz.latency} options={latencyLabels} onChange={(value) => setQuiz((current) => ({ ...current, latency: value }))} />
          <label>
            <span>Ecosystem</span>
            <select
              value={quiz.ecosystem}
              onChange={(event) => setQuiz((current) => ({ ...current, ecosystem: event.target.value as Ecosystem }))}
            >
              {Object.entries(ecosystemLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="check-row">
            <input
              checked={quiz.needsOpenWeights}
              onChange={(event) => setQuiz((current) => ({ ...current, needsOpenWeights: event.target.checked }))}
              type="checkbox"
            />
            <span>Need open weights or self-hosting</span>
          </label>
        </div>

        <div className="recommendation-list">
          {recommendations.slice(0, 3).map((recommendation, index) => (
            <article key={recommendation.model.id}>
              <b>{index + 1}</b>
              <div>
                <strong>{recommendation.model.name}</strong>
                <span>{getProvider(recommendation.model.providerId)?.name}</span>
              </div>
              <small>{recommendation.score} fit</small>
              <p>{recommendation.reasons[0]}</p>
            </article>
          ))}
        </div>
      </div>

      <p className="builder-footnote">{models.length} models in the local reference set. Treat the result as a shortlist, then verify pricing, limits, and docs.</p>
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
    <div className="segmented-control">
      <span>{label}</span>
      <div>
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

function ReferenceShelf({
  confusionGuides,
  glossary,
}: {
  confusionGuides: ConfusionGuide[];
  glossary: GlossaryTerm[];
}) {
  return (
    <section className="reference-shelf" id="reference">
      <div className="reference-column">
        <p className="micro-label">Common traps</p>
        <div className="confusion-grid">
          {confusionGuides.map((guide) => (
            <article id={`guide-${guide.id}`} key={guide.id}>
              <strong>{guide.title}</strong>
              <span>{guide.question}</span>
              <p>{guide.answer}</p>
              <ul>
                {guide.choices.map((choice) => (
                  <li key={choice.label}>
                    <b>{choice.label}</b>
                    {choice.pickWhen}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
      <div className="reference-column">
        <p className="micro-label">Words people mix up</p>
        <div className="glossary-grid">
          {glossary.map((term) => (
            <article key={term.term}>
              <strong>{term.term}</strong>
              <span>{term.plainEnglish}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ body, icon, title }: { body: string; icon: ReactNode; title: string }) {
  return (
    <section>
      <h3>
        {icon}
        {title}
      </h3>
      <p>{body}</p>
    </section>
  );
}

function kindIcon(kind: ProductKind) {
  const iconProps = { size: 18, weight: "bold" as const };
  if (kind === "App") return <AppWindow {...iconProps} />;
  if (kind === "Model") return <Sparkle {...iconProps} />;
  if (kind === "API") return <BracketsCurly {...iconProps} />;
  if (kind === "Platform") return <Database {...iconProps} />;
  if (kind === "Agent") return <GitBranch {...iconProps} />;
  if (kind === "Developer tool") return <TerminalWindow {...iconProps} />;
  return <ClipboardText {...iconProps} />;
}
