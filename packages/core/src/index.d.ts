export type SignalStoryMark =
  | "bold"
  | "code"
  | "link"
  | "muted"
  | "risk"
  | "positive"
  | "metric";

export type SignalStoryPart = {
  text?: string;
  path?: string;
  suffix?: string;
  marks?: SignalStoryMark[] | string[];
  tone?: string;
  href?: string;
};

export type SignalStoryStory = {
  id: string;
  key?: string;
  ruleId?: string;
  rulePackId?: string;
  severity?: string;
  priority?: number;
  confidence?: number;
  tone?: string;
  icon?: string;
  title?: string;
  sentence: SignalStoryPart[];
  rationale?: SignalStoryPart[];
  action?: { label?: string; href?: string };
  evidenceRefs?: Array<{ label?: string; path?: string; value?: unknown }>;
  metadata?: Record<string, unknown>;
};

export type SignalStoryRulePack = {
  id: string;
  rules: Array<Record<string, unknown>>;
};

export type SignalStoryPlugin = {
  id?: string;
  afterGenerate?: (
    stories: SignalStoryStory[],
    context: Record<string, unknown>,
  ) => SignalStoryStory[] | void;
};

export declare const renderPlainText: (parts?: SignalStoryPart[] | string[]) => string;

export declare const createSignalStoryEngine: (config?: {
  rulePacks?: SignalStoryRulePack[];
  plugins?: SignalStoryPlugin[];
}) => {
  generate: (payload?: Record<string, unknown>) => SignalStoryStory[];
};
