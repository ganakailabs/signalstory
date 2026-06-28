const SEVERITY_WEIGHT = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const defaultContext = {
  signals: {},
  evidence: {},
  metadata: {},
};

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const valueAtPath = (source, path) => {
  if (!source || !path) {
    return undefined;
  }
  return String(path)
    .split(".")
    .reduce((current, segment) => {
      if (current && typeof current === "object" && segment in current) {
        return current[segment];
      }
      return undefined;
    }, source);
};

const signalValue = (context, path) => {
  const fromSignals = valueAtPath(context.signals, path);
  return fromSignals === undefined ? valueAtPath(context.evidence, path) : fromSignals;
};

const compare = (actual, condition) => {
  if ("exists" in condition) {
    return condition.exists ? actual !== undefined && actual !== null : actual === undefined || actual === null;
  }
  if ("eq" in condition && actual !== condition.eq) {
    return false;
  }
  if ("gt" in condition && !(isNumber(actual) && actual > condition.gt)) {
    return false;
  }
  if ("gte" in condition && !(isNumber(actual) && actual >= condition.gte)) {
    return false;
  }
  if ("lt" in condition && !(isNumber(actual) && actual < condition.lt)) {
    return false;
  }
  if ("lte" in condition && !(isNumber(actual) && actual <= condition.lte)) {
    return false;
  }
  return true;
};

const matchesCondition = (condition, context) => {
  if (!condition) {
    return true;
  }
  if (Array.isArray(condition.all)) {
    return condition.all.every((entry) => matchesCondition(entry, context));
  }
  if (Array.isArray(condition.any)) {
    return condition.any.some((entry) => matchesCondition(entry, context));
  }
  return compare(signalValue(context, condition.signal), condition);
};

const normalizePart = (part, context) => {
  if (typeof part === "string") {
    return { text: part };
  }
  if (part.text !== undefined) {
    return {
      text: String(part.text),
      marks: Array.isArray(part.marks) ? part.marks : undefined,
      tone: part.tone,
      href: part.href,
    };
  }
  const value = signalValue(context, part.path);
  return {
    text: `${value ?? ""}${part.suffix ?? ""}`,
    marks: Array.isArray(part.marks) ? part.marks : undefined,
    tone: part.tone,
    href: part.href,
  };
};

const normalizeEvidenceRef = (entry, context) => ({
  label: String(entry.label ?? entry.path ?? "Evidence"),
  path: String(entry.path ?? entry.label ?? "evidence"),
  value: entry.value ?? signalValue(context, entry.path),
});

const buildStory = (rule, rulePack, context) => {
  const draft = rule.story ?? {};
  const sentence = (Array.isArray(draft.sentence) ? draft.sentence : [draft.sentence ?? ""])
    .filter((part) => part !== undefined && part !== null)
    .map((part) => normalizePart(part, context));
  const rationale = draft.rationale
    ? (Array.isArray(draft.rationale) ? draft.rationale : [draft.rationale]).map((part) =>
        normalizePart(part, context)
      )
    : [];
  const evidenceRefs = (draft.evidence ?? []).map((entry) => normalizeEvidenceRef(entry, context));

  return {
    id: String(draft.id ?? rule.id),
    key: String(draft.key ?? rule.key ?? draft.id ?? rule.id),
    ruleId: String(rule.id),
    rulePackId: String(rulePack.id ?? "default"),
    severity: draft.severity ?? "info",
    priority: Number.isFinite(draft.priority) ? draft.priority : Number.isFinite(rule.priority) ? rule.priority : 0,
    confidence: Number.isFinite(draft.confidence)
      ? draft.confidence
      : Number.isFinite(rule.confidence)
        ? rule.confidence
        : 1,
    tone: draft.tone ?? "neutral",
    icon: draft.icon ?? null,
    title: draft.title ?? null,
    sentence,
    rationale,
    action: draft.action ?? null,
    evidenceRefs,
    metadata: {
      ...(context.metadata ?? {}),
      ...(draft.metadata ?? {}),
    },
  };
};

export const renderPlainText = (parts = []) =>
  parts.map((part) => (typeof part === "string" ? part : String(part?.text ?? ""))).join("");

export const rankStories = (stories) =>
  [...stories].sort((left, right) => {
    const severityDelta =
      (SEVERITY_WEIGHT[right.severity] ?? 0) - (SEVERITY_WEIGHT[left.severity] ?? 0);
    if (severityDelta !== 0) {
      return severityDelta;
    }
    const priorityDelta = (right.priority ?? 0) - (left.priority ?? 0);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    const confidenceDelta = (right.confidence ?? 0) - (left.confidence ?? 0);
    if (confidenceDelta !== 0) {
      return confidenceDelta;
    }
    return String(left.id).localeCompare(String(right.id));
  });

export const dedupeStories = (stories) => {
  const byKey = new Map();
  for (const story of stories) {
    const key = story.key ?? story.id;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, story);
      continue;
    }
    const [winner] = rankStories([existing, story]);
    byKey.set(key, winner);
  }
  return [...byKey.values()];
};

export const createSignalStoryEngine = ({ rulePacks = [], plugins = [] } = {}) => ({
  generate(input = {}) {
    const context = {
      ...defaultContext,
      ...input,
      signals: input.signals ?? {},
      evidence: input.evidence ?? input.signals ?? {},
      metadata: input.metadata ?? {},
    };
    let stories = [];
    for (const rulePack of rulePacks) {
      for (const rule of rulePack.rules ?? []) {
        if (matchesCondition(rule.when, context)) {
          stories.push(buildStory(rule, rulePack, context));
        }
      }
    }
    stories = rankStories(dedupeStories(stories));
    for (const plugin of plugins) {
      if (typeof plugin.afterGenerate === "function") {
        stories = plugin.afterGenerate(stories, context) ?? stories;
      }
    }
    return stories;
  },
});
