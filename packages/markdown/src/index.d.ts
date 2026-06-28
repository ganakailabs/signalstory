import type { SignalStoryPart, SignalStoryStory } from "@signalstory/core";

export declare const renderPartsMarkdown: (parts?: SignalStoryPart[]) => string;
export declare const renderStoryMarkdown: (story: SignalStoryStory) => string;
export declare const renderGithubSummary: (
  stories?: SignalStoryStory[],
  options?: { title?: string },
) => string;
export { renderPlainText } from "@signalstory/core";
