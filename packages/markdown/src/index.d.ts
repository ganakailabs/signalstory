import type { SignalStoryPart, SignalStoryStory } from "signalstory/core";

export declare const formatIconLabel: (icon?: string) => string;
export declare const renderPartsMarkdown: (parts?: SignalStoryPart[]) => string;
export declare const renderStoryMarkdown: (
  story: SignalStoryStory,
  options?: { icons?: boolean; iconLabels?: Record<string, string> },
) => string;
export declare const renderGithubSummary: (
  stories?: SignalStoryStory[],
  options?: { title?: string; icons?: boolean; iconLabels?: Record<string, string> },
) => string;
export { renderPlainText } from "signalstory/core";
